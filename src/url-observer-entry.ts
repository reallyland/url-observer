import type { URLChangedStatus, URLObserverEntryProperties } from './custom_typings.js';

export class URLObserverEntry implements URLObserverEntryProperties {
  public readonly entryType: URLChangedStatus;
  public readonly scope: string;
  public readonly startTime: number;
  public readonly url: string;

  public constructor({
    entryType,
    scope,
    startTime,
    url,
  }: URLObserverEntryProperties) {
    this.entryType = entryType;
    this.scope = scope;
    this.startTime = startTime;
    this.url = url;
  }

  public toJSON(): URLObserverEntryProperties {
    return {
      entryType: this.entryType,
      scope: this.scope,
      startTime: this.startTime,
      url: this.url,
    };
  }
}
