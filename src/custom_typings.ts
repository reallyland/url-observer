import type { URLObserverEntryList } from './url-observer-entry-list.js';
import type { URLObserver } from './url-observer.js';

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
  notFound: boolean;
  url: string;
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
  scope: string;
  status: URLChangedStatus;
  url: URL;
}

export interface URLObserverCallbacks {
  callback(list: URLObserverEntryList, object: URLObserver): void;
  matcherCallback<T>(pathname: string, pathRegExp: RegExp): T;
}

export interface URLObserverEntryProperties {
  readonly entryType: URLChangedStatus;
  readonly scope: string;
  readonly startTime: number;
  readonly url: string;
}

export interface URLObserverProperties extends Pick<URLObserverCallbacks, 'matcherCallback'> {
  debug?: boolean;
  dwellTime?: number;
}
