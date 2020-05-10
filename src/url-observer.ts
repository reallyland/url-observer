import type {
  MatchedRoute,
  RouteEvent,
  RouteOption,
  Routes,
  URLChangedOption,
  URLChangedStatus,
} from './custom_typings.js';
import { findMatchedRoute } from './helpers/find-matched-route.js';

const $w = window;
const $h = $w.history;
const $l = $w.location;

interface URLObserverOption {
  dwellTime: number;
  callback(): void;
}

export const popStateEventKey = ':popState';
export const pushStateEventKey = ':pushState';

export class URLObserver {
  #dwellTime: number = 2e3;
  #state: any;
  #title: string = '';
  #lastChangedAt: number = -1;
  #routes: Routes = new Map();

  public constructor(public callback?: URLObserverOption['callback']) {
    this._popstate = this._popstate.bind(this);
    this._hashchange = this._hashchange.bind(this);
    this._click = this._click.bind(this);

    return this;
  }

  public add<T>(option: RouteOption<T>): void {
    const {
      pathRegExp,
      handleEvent,
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
  }

  public match<T>(): MatchedRoute<T> {
    const { pathname } = $l;

    for (const [, { pathRegExp }] of this.#routes) {
      if (pathRegExp.test(pathname)) {
        return {
          found: true,
          matches: pathname.match(pathRegExp)?.groups as undefined | T ?? {} as T,
        };
      }
    }

    return {
      found: false,
      matches: {} as T,
    };
  }

  public observe(routes: RegExp[], option?: Partial<Omit<URLObserverOption, 'callback'>>): void {
    (Array.isArray(routes) ? routes : []).forEach(n => this.add({ pathRegExp: n }));

    if (option) {
      const {
        dwellTime,
      } = option;

      this.#dwellTime = dwellTime ?? 2e3;
    }

    document.body.addEventListener('click', this._click);
    $w.addEventListener('hashchange', this._hashchange);
    $w.addEventListener('popstate', this._popstate);

    this._urlChanged({
      url: new URL($l.href),
      skipCheck: true,
      state: {},
      status: 'init',
      title: '',
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

  public async updateHistory(state: any, title: string, pathname: string): Promise<void> {
    await this._urlChangedWithBeforeRoute({
      state,
      title,
      skipCheck: true,
      status: 'manual',
      url: new URL(pathname, $l.origin),
    });
  }

  private async _click(ev: MouseEvent): Promise<void> {
    if (
      ev.defaultPrevented ||
      ev.button !== 0 ||
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
      anchor.download ||
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

    const hasScope = Object.keys(anchor).includes('scope') || anchor.hasAttribute('scope');

    await this._urlChangedWithBeforeRoute({
      url,
      state: {
        scope: hasScope ? anchor.scope || anchor.getAttribute('scope') || ':default' : '',
      },
      status: 'click',
      title: anchor.getAttribute('aria-label') ||
        anchor.getAttribute('title') ||
        anchor.textContent ||
        '',
    });
  }

  private _hashchange(): void {
    this._urlChanged({
      /**
       * In hashchange, URL changes before router can do anything about it.
       * So skip verifying URL.
       */
      skipCheck: true,
      state: this.#state,
      status: 'hashchange',
      title: this.#title,
      url: new URL($l.href),
    });
  }

  private _isSameUrl(url: URL): boolean {
    const { pathname, search, hash } = $l;

    return (
      url.pathname === pathname &&
      url.search === search &&
      url.hash === hash
    );
  }

  private _popstate(ev: PopStateEvent): void {
    this._urlChanged({
      /**
       * In popstate, URL changes before router can do anything about it.
       * So skip verifying URL.
       */
      skipCheck: true,
      state: { ...ev.state },
      status: 'popstate',
      title: ev.state?.title || document.title || '',
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
        pathRegExp,
        beforeRouteHandlers,
      } = route;
      const matches = url.pathname.match(pathRegExp)?.groups ?? {};
      const beforeRouteHandler = beforeRouteHandlers.get(scope);

      if (beforeRouteHandler) return beforeRouteHandler(matches, status);
    }

    return true;
  }

  private _shouldSkipUpdate(url: URL, skipCheck: URLChangedOption['skipCheck']): boolean {
    return $l.origin !== url.origin || (!skipCheck && this._isSameUrl(url));
  }

  private _updateUrl(option: URLChangedOption): void {
    const {
      state,
      status,
      title,
      url,
    } = option;
    const fullUrl = url.href;

    const now = $w.performance.now();
    const shouldReplace = status !== 'click' || (this.#lastChangedAt + this.#dwellTime > now);

    if (shouldReplace) {
      $h.replaceState(state, title, fullUrl);
    } else {
      $h.pushState(state, title, fullUrl);
    }

    this.#lastChangedAt = now;
    this.#state = state;
    this.#title = title;

    $w.dispatchEvent(
      new CustomEvent(
        status === 'popstate' ? popStateEventKey : pushStateEventKey,
        {
          detail: {
            state,
            status,
            title,
            notFound: !findMatchedRoute(this.#routes, url.pathname),
            url: fullUrl,
          } as RouteEvent,
        }
      )
    );
  }

  private _urlChanged(option: URLChangedOption): void {
    if (this._shouldSkipUpdate(option.url, option.skipCheck)) return;

    this._updateUrl(option);
  }

  private async _urlChangedWithBeforeRoute(option: URLChangedOption): Promise<void> {
    const {
      skipCheck,
      state,
      status,
      url,
    } = option;

    if (this._shouldSkipUpdate(url, skipCheck)) return;

    // Run before route change handler
    if ((status === 'click' || status === 'manual') && state.scope) {
      if (!(await this._runScopedRouteHandler(url, status, state.scope))) return;
    }

    this._updateUrl(option);
  }

  public findRoute() {
    return findMatchedRoute(this.#routes, $w.location.pathname);
  }
}

declare global {
  // #region HTML element type extensions
  interface HTMLAnchorElement {
    scope: string;
    state: any;
  }
  // #endregion HTML element type extensions

  interface WindowEventMap {
    [popStateEventKey]: CustomEvent<RouteEvent>;
    [pushStateEventKey]: CustomEvent<RouteEvent>;
  }
}
