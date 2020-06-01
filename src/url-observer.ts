import { popStateEventKey, pushStateEventKey } from './constants.js';
import type {
  MatchedRoute,
  RouteEvent,
  RouteOption,
  Routes,
  URLChangedOption,
  URLChangedStatus,
  URLObserverCallbacks,
  URLObserverProperties,
} from './custom_typings.js';
import { findMatchedRoute } from './helpers/find-matched-route.js';
import { urlParamMatcher } from './helpers/url-param-matcher.js';
import { URLObserverEntryList } from './url-observer-entry-list.js';

const $w = window;
const $h = $w.history;
const $l = $w.location;

export class URLObserver {
  #callback?: URLObserverCallbacks['callback'];
  #debug: boolean = false;
  #dwellTime: number = 2e3;
  #entryList: URLObserverEntryList = new URLObserverEntryList();
  #lastChangedAt: number = -1;
  #matcherCallback: URLObserverCallbacks['matcherCallback'] = urlParamMatcher;
  #routes: Routes = new Map();
  #connected: boolean = false;

  public constructor(callback?: URLObserverCallbacks['callback']) {
    this._popstate = this._popstate.bind(this);
    this._hashchange = this._hashchange.bind(this);
    this._click = this._click.bind(this);

    if (typeof(callback) === 'function') this.#callback = callback;

    return this;
  }

  public add<T>(option: RouteOption<T>): void {
    const {
      handleEvent,
      pathRegExp,
      scope,
    } = option;
    const patternStr = pathRegExp.toString();
    const routeValue = this.#routes.get(patternStr);
    const scopeValue = scope || ':default';

    // r h R
    // 0 0 r
    // 0 1 rh
    // 1 0 x
    // 1 1 h
    if (routeValue) {
      if (handleEvent) {
        routeValue.beforeRouteHandlers.set(scopeValue, handleEvent);
      }
    } else {
      this.#routes.set(patternStr, {
        pathRegExp,
        beforeRouteHandlers: new Map(handleEvent ? [[scopeValue, handleEvent]] : []),
      });
    }
  }

  public disconnect(): void {
    document.body.removeEventListener('click', this._click);
    $w.removeEventListener('hashchange', this._hashchange);
    $w.removeEventListener('popstate', this._popstate);

    this.#connected = false;
    this.#entryList.deleteEntries();
  }

  public match<T>(): MatchedRoute<T> {
    const { pathname } = $l;

    for (const [, { pathRegExp }] of this.#routes) {
      if (pathRegExp.test(pathname)) {
        return {
          found: true,
          matches: this.#matcherCallback<T>(pathname, pathRegExp),
        };
      }
    }

    return {
      found: false,
      matches: {} as T,
    };
  }

  public observe(routes: RegExp[], option?: Partial<URLObserverProperties>): void {
    (Array.isArray(routes) ? routes : []).forEach(n => this.add({ pathRegExp: n }));

    if (option) {
      const {
        debug,
        dwellTime,
        matcherCallback,
      } = option;

      this.#debug = debug ?? false;
      this.#dwellTime = dwellTime ?? 2e3;
      this.#matcherCallback = matcherCallback ?? urlParamMatcher;
    }

    if (this.#debug) {
      Object.defineProperty(this, 'routes', {
        configurable: false,
        enumerable: true,
        /** To prevent #routes being modified via public 'routes' property */
        get() {
          return new Map(this.#routes);
        },
      });
    }

    document.body.addEventListener('click', this._click);
    $w.addEventListener('hashchange', this._hashchange);
    $w.addEventListener('popstate', this._popstate);

    this.#connected = true;
    this._updateUrl({
      url: new URL($l.href),
      scope: '',
      status: 'init',
    });
  }

  public remove(route: RegExp, scope?: RouteOption['scope']): boolean {
    const routeKey = route.toString();

    if (typeof(scope) === 'string') {
      for (const [pathKey, { beforeRouteHandlers }] of this.#routes) {
        if (pathKey === routeKey && beforeRouteHandlers.size) {
          return beforeRouteHandlers.delete(scope || ':default');
        }
      }

      return false;
    }

    return this.#routes.delete(routeKey);
  }

  public takeRecords() {
    return this.#entryList.getEntries();
  }

  public async updateHistory(pathname: string, scope?: string): Promise<void> {
    await this._urlChangedWithBeforeRoute({
      scope: scope || '',
      status: 'manual',
      url: new URL(pathname, $l.origin),
    });
  }

  private async _click(ev: MouseEvent): Promise<void> {
    if (
      ev.defaultPrevented ||
      ev.metaKey ||
      ev.ctrlKey ||
      ev.shiftKey
    ) return;

    const el = ev.target as HTMLAnchorElement;
    const anchor = el.tagName === 'A' ? el : (
      el.closest<HTMLAnchorElement>('a') ||
      (ev.composedPath() as HTMLAnchorElement[]).find(n => n.tagName === 'A')
    );

    if (
      null == anchor ||
      anchor.hasAttribute('download') ||
      anchor.target === '_blank' ||
      ((anchor.target === '_top' || anchor.target === '_parent') && $w.top !== $w)
    ) return;

    const href = anchor.href;
    const url = document.baseURI != null ? new URL(href, document.baseURI) : new URL(href);

    /** Nothing to do if not in the same origin */
    if (url.origin !== $l.origin) return;

    ev.preventDefault();

    /** Nothing to do if nothing new in the URL */
    if (url.href === $l.href) return;

    await this._urlChangedWithBeforeRoute({
      url,
      scope: Object.keys(anchor).includes('scope') || anchor.hasAttribute('scope') ?
        anchor.scope || anchor.getAttribute('scope') || ':default' :
        '',
      status: 'click',
    });
  }

  private _hashchange(): void {
    this._updateUrl({
      scope: '',
      status: 'hashchange',
      url: new URL($l.href),
    });
  }

  /**
   * The following actions triggers a popstate event in browsers:
   * 1. Updating a hash, e.g. `window.location.hash = '123';`, or
   * 2. Clicking back button or calling `history.back()` in JS, or
   * 3. Clicking forward button or calling `history.forward()` in JS.
   */
  private _popstate(): void {
    this._updateUrl({
      scope: '',
      status: 'popstate',
      url: new URL($l.href),
    });
  }

  private async _runScopedRouteHandler(
    url: URL,
    status: URLChangedStatus,
    scope: string
  ): Promise<boolean> {
    const route = findMatchedRoute(this.#routes, url.pathname);

    if (route) {
      const {
        beforeRouteHandlers,
        pathRegExp,
      } = route;
      const matches = this.#matcherCallback<Record<string, any>>(url.pathname, pathRegExp);
      const beforeRouteHandler = beforeRouteHandlers.get(scope);

      if (beforeRouteHandler) return beforeRouteHandler(matches, status);
    }

    return true;
  }

  private _updateUrl(option: URLChangedOption): void {
    const {
      scope,
      status,
      url,
    } = option;
    const fullUrl = url.href;
    const now = $w.performance.now();
    /**
     * URL will always be replaced when:
     * 1. Not triggered by clicks
     * 2. Less than defined 'dwellTime', e.g. period in between 0 (inc) and dwellTime (inc)
     */
    const shouldReplace = status !== 'click' || (this.#lastChangedAt + this.#dwellTime >= now);

    if (shouldReplace) {
      $h.replaceState({}, '', fullUrl);
    } else {
      $h.pushState({}, '', fullUrl);
    }

    this.#lastChangedAt = now;

    /** Do nothing when URLObserver disconnects */
    if (!this.#connected) return;

    this.#entryList.addEntry({
      scope,
      entryType: status,
      startTime: performance.now(),
      url: fullUrl,
    });

    /** Run observer callback if any */
    if (this.#callback) this.#callback(this.#entryList, this);

    $w.dispatchEvent(
      new CustomEvent(
        status === 'popstate' ? popStateEventKey : pushStateEventKey,
        {
          detail: {
            scope,
            status,
            notFound: !findMatchedRoute(this.#routes, url.pathname),
            url: fullUrl,
          } as RouteEvent,
        }
      )
    );
  }

  private async _urlChangedWithBeforeRoute(option: URLChangedOption): Promise<void> {
    const {
      scope,
      status,
      url,
    } = option;

    /** Run before route change handler */
    // FIXME: Test the condition here
    if ((status === 'click' || status === 'manual') && scope) {
      if (!(await this._runScopedRouteHandler(url, status, scope))) return;
    }

    this._updateUrl(option);
  }

}

declare global {
  // #region HTML element type extensions
  interface HTMLAnchorElement {
    scope: string;
  }
  // #endregion HTML element type extensions

  interface WindowEventMap {
    [popStateEventKey]: CustomEvent<RouteEvent>;
    [pushStateEventKey]: CustomEvent<RouteEvent>;
  }
}
