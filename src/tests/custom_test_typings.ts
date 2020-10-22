import type { Routes } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';

export type URLObserverWithDebug = URLObserver & { routes: Routes; };
