import type { Routes, RouteValue } from '../custom_typings.js';

export function findMatchedRoute(routes: Routes, pathname: string): undefined | RouteValue {
  for (const [, routeValue] of routes) {
    if (routeValue.pathRegExp.test(pathname)) return routeValue;
  }

  /** NOTE: Suppress TS error to not return on all code paths */
  return;
}
