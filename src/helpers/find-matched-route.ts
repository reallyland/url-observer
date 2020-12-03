import type { Routes, RouteValue } from '../custom_typings.js';

export function findMatchedRoute(routes: Routes, pathname: string): undefined | RouteValue {
  let len = pathname.length;
  let match: undefined | RouteValue;

  for (const [, routeValue] of routes) {
    if (routeValue.pathRegExp.test(pathname)) {
      len = pathname.replace(routeValue.pathRegExp, '').length;

      if (!len) return routeValue;

      match = routeValue;
    }
  }

  return match;
}
