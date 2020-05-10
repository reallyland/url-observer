export type Routes = Map<string, RouteValue>;

export type URLChangedStatus =
  | 'click'
  | 'hashchange'
  | 'init'
  | 'manual'
  | 'popstate';

export interface MatchedRoute<T extends Record<string, any> = Record<string, any>> {
  found: boolean;
  matches: T;
}

export interface RouteEvent extends Omit<URLChangedOption, 'url'> {
  url: string;
  notFound: boolean;
}

export interface RouteOption<T extends Record<string, any> = Record<string, any>> {
  handleEvent?(matches: T, status: URLChangedStatus): Promise<boolean> | boolean;
  pathRegExp: RegExp;
  scope?: string;
}

export interface RouteValue {
  beforeRouteHandlers: Map<string, RouteOption['handleEvent']>;
  pathRegExp: RegExp;
}

export interface URLChangedOption {
  state: any;
  title: string;
  status: URLChangedStatus;
  url: URL;

  skipCheck?: boolean;
}
