const $w = window;
const $h = $w.history;
const $l = $w.location;

type Routes = Map<string, RouteValue>;
export type URLChangedStatus =
  | 'click'
  | 'hashchange'
  | 'init'
  | 'manual'
  | 'popstate';

interface URLObserverOption {
  dwellTime: number;
  debug: boolean;
  encodeSpaceAsPlusQuery: boolean;
}

interface URLChangedOption {
  state: any;
  title: string;
  status: URLChangedStatus;
  url: URL;

  skipCheck?: boolean;
}

interface RouteOption<T extends Record<string, any> = Record<string, any>> {
  pathRegExp: RegExp;
  scope?: string;
  handleEvent?(matches: T, status: URLChangedStatus): Promise<boolean> | boolean;
}

interface RouteValue {
  pathRegExp: RegExp;
  beforeRouteHandlers: Map<string, RouteOption['handleEvent']>;
}

interface RouteEvent extends Omit<URLChangedOption, 'url'> {
  url: string;
  notFound: boolean;
}

export const popStateEventKey = ':popState';
export const pushStateEventKey = ':pushState';

// @ts-ignore
function findMatchedRoute(routes: Routes, pathname: string): undefined | RouteValue {
  for (const [, routeValue] of routes) {
    if (routeValue.pathRegExp.test(pathname)) return routeValue;
  }
}

export class URLObserver {
  #dwellTime: number = 2e3;
  // #debug: boolean = false;
  #encodeSpaceAsPlusQuery: boolean = true;
  #state: any;
  #title: string = '';
  #lastChangedAt: number = -1;
  #routes: Routes = new Map();

  public constructor(option?: Partial<URLObserverOption>) {
    if (option) {
      const {
        // debug,
        dwellTime,
        encodeSpaceAsPlusQuery,
      } = option;

      // this.#debug = debug ?? false;
      this.#dwellTime = dwellTime ?? 2e3;
      this.#encodeSpaceAsPlusQuery = encodeSpaceAsPlusQuery ?? true;
    }

    this._popstate = this._popstate.bind(this);
    this._hashchange = this._hashchange.bind(this);
    this._click = this._click.bind(this);

    return this;
  }

  public async observe() {
    document.body.addEventListener('click', this._click);
    $w.addEventListener('hashchange', this._hashchange);
    $w.addEventListener('popstate', this._popstate);

    await this._urlChanged({
      url: new URL($l.href),
      skipCheck: true,
      state: {},
      status: 'init',
      title: '',
    });
  }

  public disconnect() {
    document.body.removeEventListener('click', this._click);
    $w.removeEventListener('hashchange', this._hashchange);
    $w.removeEventListener('popstate', this._popstate);
  }

  public beforeRoute<T>(option: RouteOption<T>): void {
    const {
      pathRegExp,
      handleEvent,
      scope,
    } = option;
    const patternStr = pathRegExp.toString();
    const routeValue = this.#routes.get(patternStr);
    const scopeValue = scope || ':default';

    if (routeValue) {
      routeValue.beforeRouteHandlers.set(scopeValue, handleEvent);
    } else {
      this.#routes.set(patternStr, {
        pathRegExp,
        beforeRouteHandlers: new Map([
          [scopeValue, handleEvent],
        ]),
      });
    }
  }

  public async updateHistory(state: any, title: string, pathname: string) {
    await this._urlChanged({
      state,
      title,
      skipCheck: true,
      status: 'manual',
      url: new URL(pathname, $l.origin),
    });
  }

  private async _popstate(ev: PopStateEvent) {
    await this._urlChanged({
      state: { ...ev.state },
      status: 'popstate',
      title: ev.state?.title || document.title || '',
      url: new URL($l.href),
    });
  }

  private async _hashchange() {
    await this._urlChanged({
      state: this.#state,
      status: 'hashchange',
      title: this.#title,
      url: new URL($l.href),
    });
  }

  private async _click(ev: MouseEvent) {
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

    const hasScope = Object.keys(anchor.scope) || anchor.hasAttribute('scope');

    await this._urlChanged({
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

  private async _runScopedRouteHandler(url: URL, status: URLChangedStatus, scope: string) {
    const route = findMatchedRoute(this.#routes, url.pathname);

    if (route) {
      const {
        pathRegExp,
        beforeRouteHandlers,
      } = route;
      const matches = pathRegExp[Symbol.match](url.pathname)?.groups ?? {};
      const beforeRouteHandler = beforeRouteHandlers.get(scope);

      if (beforeRouteHandler) return beforeRouteHandler(matches, status);
    }

    return true;
  }

  private async _urlChanged(option: URLChangedOption) {
    const {
      skipCheck,
      state,
      status,
      title,
      url,
    } = option;

    if ($l.origin !== url.origin) return;

    const newUrl = this._getUrl(url);
    if (!skipCheck && this._isSameUrl(newUrl)) return;

    // Run before route change handler
    if ((status === 'click' || status === 'manual') && state.scope) {
      if (!(await this._runScopedRouteHandler(newUrl, status, state.scope))) return;
    }

    const fullUrl = newUrl.href;
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

  private _isSameUrl(url: URL) {
    const { pathname, search, hash } = $l;

    return (
      url.pathname === pathname &&
      url.search === search &&
      url.hash === hash
    );
  }

  private _getUrl(url: URL) {
    const {
      hash,
      origin,
      pathname,
      search,
    } = url;

    const partiallyEncodedPathname = $w.encodeURI(pathname).replace(/\#/g, '%23').replace(/\?/g, '%3F');

    let partiallyEncodedQuery = search ?
      `?${search.replace(/\#/g, '%23').replace(/\+/g, '%2B')}` :
      '';

    if (this.#encodeSpaceAsPlusQuery) {
      partiallyEncodedQuery = partiallyEncodedQuery.replace(/(\s|%20)/g, '+');
    } else {
      /** Required for Edge */
      partiallyEncodedQuery = partiallyEncodedQuery.replace(/ /g, '%20');
    }

    const partiallyEncodedHash = hash ? `#${$w.encodeURI(hash)}` : '';

    return new URL(
      `${origin}${partiallyEncodedPathname}${partiallyEncodedQuery}${partiallyEncodedHash}`
    );
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
