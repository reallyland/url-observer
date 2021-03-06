import { linkScopeKey, popStateEventKey, pushStateEventKey } from './constants.js';
import type {
  MatchedRoute,
  RouteEvent,
  RouteOption,
  Routes,
  URLChangedOption,
  URLChangedStatus,
  URLObserverCallbacks,
  URLObserverOption,
} from './custom_typings.js';
import { findMatchedRoute } from './helpers/find-matched-route.js';
import { urlParamMatcher } from './helpers/url-param-matcher.js';
import { URLObserverEntryList } from './url-observer-entry-list.js';
import type { URLObserverEntry } from './url-observer-entry.js';

export class URLObserver {
  #callback?: URLObserverCallbacks['callback'];
  #connected = false;
  #debug = false;
  /**
   * dwellTime is required to prevent pushState IPC storm DoS.
   *
   * @see {@link https://codereview.chromium.org/2972073002|Issue 2972073002}
   * for more in-depth issue.
   */
  #dwellTime = 2e3;
  #entryList: URLObserverEntryList = new URLObserverEntryList();
  #lastChangedAt = -1;
  #matcherCallback: URLObserverCallbacks['matcherCallback'] = urlParamMatcher;
  #routes: Routes = new Map();

  public constructor(callback?: URLObserverCallbacks['callback']) {
    this._popstate = this._popstate.bind(this);
    this._hashchange = this._hashchange.bind(this);
    this._click = this._click.bind(this);

    if (typeof(callback) === 'function') this.#callback = callback;

    return this;
  }

  public get [Symbol.toStringTag](): string {
    return 'URLObserver';
  }

  public add<T extends Record<string, unknown>>(option: RouteOption<T>): void {
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
    window.removeEventListener('hashchange', this._hashchange);
    window.removeEventListener('popstate', this._popstate);

    this.#connected = false;
    this.#entryList.deleteEntries();
  }

  public match<T extends Record<string, unknown> = Record<string, unknown>>(tail?: string): MatchedRoute<T> {
    const pathname= tail || location.pathname;

    for (const [, { pathRegExp }] of this.#routes) {
      if (pathRegExp.test(pathname)) {
        return {
          found: true,
          params: this.#matcherCallback<T>(pathname, pathRegExp),
        };
      }
    }

    return {
      found: false,
      params: {} as T,
    };
  }

  public observe(routes: RegExp[], option?: Partial<URLObserverOption>): void {
    /** An observer instance can only be observed once */
    if (this.#connected) return;

    (Array.isArray(routes) ? routes : []).forEach(n => this.add({ pathRegExp: n }));

    const {
      debug,
      dwellTime,
      matcherCallback,
    } = option ?? {};

    this.#debug = debug ?? false;
    this.#dwellTime = dwellTime ?? 2e3;
    this.#matcherCallback = matcherCallback ?? urlParamMatcher;
    this.#connected = true;

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
    window.addEventListener('hashchange', this._hashchange);
    window.addEventListener('popstate', this._popstate);

    this._updateUrl({
      url: new URL(location.href),
      scope: '',
      status: 'init',
    });
  }

  public remove(pathRegExp: RegExp, scope?: RouteOption['scope']): boolean {
    const routeKey = pathRegExp.toString();

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

  public takeRecords(): URLObserverEntry[] {
    return this.#entryList.getEntries();
  }

  public async updateHistory(pathname: string, scope?: string): Promise<void> {
    await this._urlChangedWithBeforeRoute({
      scope: scope || '',
      status: 'manual',
      url: new URL(pathname, location.origin),
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
      /** This is to ensure it works even on browsers yet to support Shadow DOM */
      (ev.composedPath?.() as HTMLAnchorElement[])?.find(n => n.tagName === 'A')
    );

    if (
      null == anchor ||
      anchor.hasAttribute('download') ||
      anchor.target === '_blank' ||
      ((anchor.target === '_top' || anchor.target === '_parent') && window.top !== window)
    ) return;

    const href = anchor.href;
    const url = document.baseURI != null ? new URL(href, document.baseURI) : new URL(href);

    /** Nothing to do if not in the same origin */
    if (url.origin !== location.origin) return;

    ev.preventDefault();

    /** Nothing to do if nothing new in the URL */
    if (url.href === location.href) return;

    await this._urlChangedWithBeforeRoute({
      url,
      scope: Object.keys(anchor).includes(linkScopeKey) || anchor.hasAttribute(linkScopeKey) ?
        anchor[linkScopeKey] || anchor.getAttribute(linkScopeKey) || ':default' :
        '',
      status: 'click',
    });
  }

  private _hashchange(): void {
    this._updateUrl({
      scope: '',
      status: 'hashchange',
      url: new URL(location.href),
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
      url: new URL(location.href),
    });
  }

  private async _runScopedRouteHandler(
    url: URL,
    status: URLChangedStatus,
    scope: string
  ): Promise<boolean> {
    const {
      beforeRouteHandlers,
      params,
    } = findMatchedRoute(this.#routes, {
      scope,
      status,
      url,
      matcherCallback: this.#matcherCallback,
    });

    if (beforeRouteHandlers) {
      const beforeRouteHandler = beforeRouteHandlers.get(scope);

      if (beforeRouteHandler) return beforeRouteHandler(params, status);
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
    const now = window.performance.now();
    /**
     * URL will always be replaced when:
     * 1. Not triggered by clicks
     * 2. Less than defined 'dwellTime', e.g. period in between 0 (inc) and dwellTime (inc)
     */
    const shouldReplace = status !== 'click' || (this.#lastChangedAt + this.#dwellTime >= now);

    if (shouldReplace) {
      history.replaceState({}, '', fullUrl);
    } else {
      history.pushState({}, '', fullUrl);
    }

    this.#lastChangedAt = now;

    /** Do nothing when URLObserver disconnects */
    if (!this.#connected) return;

    this.#entryList.addEntry({
      scope,
      entryType: status,
      startTime: window.performance.now(),
      url: fullUrl,
    });

    /** Run observer callback if any */
    if (this.#callback) this.#callback(this.#entryList, this);

    const { found, params } = findMatchedRoute(this.#routes, {
      scope,
      status,
      url,
      matcherCallback: this.#matcherCallback,
    });

    window.dispatchEvent(
      new CustomEvent<RouteEvent>(
        status === 'popstate' ? popStateEventKey : pushStateEventKey,
        {
          detail: {
            found,
            params,
            scope,
            status,
            url: fullUrl,
          },
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
    if (scope && !(await this._runScopedRouteHandler(url, status, scope))) return;

    this._updateUrl(option);
  }

}

declare global {
  // #region HTML element type extensions
  interface HTMLAnchorElement {
    [linkScopeKey]: string;
  }
  // #endregion HTML element type extensions

  interface WindowEventMap {
    [popStateEventKey]: CustomEvent<RouteEvent<Record<string, unknown>>>;
    [pushStateEventKey]: CustomEvent<RouteEvent<Record<string, unknown>>>;
  }
}

// FIXME: Limitation: No multiple observers on the same page.
