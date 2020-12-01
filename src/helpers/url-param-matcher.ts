export function urlParamMatcher<T>(pathname: string, pathRegExp: RegExp): T {
  const params = pathname.match(pathRegExp)?.groups as undefined | T;
  return params ?? {} as T;
}
