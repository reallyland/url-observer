import type { URLChangedStatus, URLObserverEntryProperty } from './custom_typings.js';

export class URLObserverEntry implements Readonly<URLObserverEntryProperty> {
  public readonly entryType: URLChangedStatus;
  public readonly scope: string;
  public readonly startTime: number;
  public readonly url: string;

  public constructor({
    entryType,
    scope,
    startTime,
    url,
  }: URLObserverEntryProperty) {
    this.entryType = entryType;
    this.scope = scope;
    this.startTime = startTime;
    this.url = url;
  }

  public get [Symbol.toStringTag](): string {
    return 'URLObserverEntry';
  }

  public toJSON(): URLObserverEntryProperty {
    return {
      entryType: this.entryType,
      scope: this.scope,
      startTime: this.startTime,
      url: this.url,
    };
  }

}
