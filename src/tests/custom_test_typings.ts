import type { pathToRegexp } from 'path-to-regexp';

import type { Routes } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import type { TestHelpers } from './test-helpers.js';

type BrowserWindow = typeof Window;

export type URLObserverWithDebug = URLObserver & { routes: Routes; };

declare global {
  interface Window extends BrowserWindow {
    observerList: URLObserver[];
    pathToRegExp: typeof pathToRegexp;
    router: URLObserver;
    TestHelpers: TestHelpers;
    URLObserver: typeof URLObserver;
  }
}
