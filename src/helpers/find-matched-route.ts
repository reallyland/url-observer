import type { FindMatchedRouteOption, FindMatchedRouteResult, Routes, RouteValue } from '../custom_typings.js';

export function findMatchedRoute<T extends Record<string, unknown>>(
  routes: Routes,
  {
    matcherCallback,
    scope,
    status,
    url: {
      href,
      pathname,
    },
  }: FindMatchedRouteOption
): FindMatchedRouteResult<T> {
  let len = pathname.length;
  let match: undefined | RouteValue;

  for (const [, routeValue] of routes) {
    if (routeValue.pathRegExp.test(pathname)) {
      len = pathname.replace(routeValue.pathRegExp, '').length;
      match = routeValue;

      if (!len) break;
    }
  }

  const found = match != null;

  return {
    beforeRouteHandlers: match?.beforeRouteHandlers,
    found,
    params: match && matcherCallback ? matcherCallback<T>(pathname, match.pathRegExp) : {} as T,
    pathRegExp: match?.pathRegExp,
    scope,
    status,
    url: href,
  };
}
