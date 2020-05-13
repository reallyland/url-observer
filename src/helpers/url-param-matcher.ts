export function urlParamMatcher<T>(pathname: string, pathRegExp: RegExp): T {
  const matches = pathname.match(pathRegExp)?.groups as undefined | T;
  return matches ?? {} as T;
}
