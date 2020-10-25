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

export interface RouteEvent<T extends Record<string, any> = Record<string, any>> extends
  MatchedRoute<T>,
  Omit<URLChangedOption, 'url'>
{
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
  callback(list: URLObserverEntryList, observer: URLObserver): void;
  matcherCallback<T>(pathname: string, pathRegExp: RegExp): T;
}

export interface URLObserverEntryProperty {
  entryType: URLChangedStatus;
  scope: string;
  startTime: number;
  url: string;
}

export interface URLObserverOption extends Pick<URLObserverCallbacks, 'matcherCallback'> {
  debug?: boolean;
  dwellTime?: number;
}
