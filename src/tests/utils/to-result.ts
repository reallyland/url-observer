import type { Routes, RouteValue } from '../../custom_typings.js';

export function toResult<T extends [string, unknown] = [string, unknown]>(
  routes: Routes,
  cb: (handler: RouteValue['beforeRouteHandlers']) => unknown
): T[] {
  const result: T[] = [];

  for (const [k, { beforeRouteHandlers }] of routes) {
    result.push([k, cb(beforeRouteHandlers)] as T);
  }

  return result;
}
