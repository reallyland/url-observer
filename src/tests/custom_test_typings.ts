import type { pathToRegexp } from 'path-to-regexp';

import type { URLObserver } from '../url-observer.js';

type BrowserWindow = typeof Window;

declare global {
  interface Window extends BrowserWindow {
    observerList: URLObserver[];
    pathToRegExp: typeof pathToRegexp;
    router: URLObserver;
    URLObserver: typeof URLObserver;
  }
}
