import type { URLChangedStatus, URLObserverEntryProperty } from './custom_typings.js';
import { URLObserverEntry } from './url-observer-entry.js';

export class URLObserverEntryList {
  #entryList: URLObserverEntry[] = [];

  public get [Symbol.toStringTag](): string {
    return 'URLObserverEntryList';
  }

  public addEntry(option: URLObserverEntryProperty): void {
    this.#entryList.push(new URLObserverEntry(option));
  }

  public deleteEntries(): void {
    this.#entryList = [];
  }

  public getEntries(): URLObserverEntry[] {
    return this.#entryList;
  }

  public getEntriesByEntryScope(scope: string): URLObserverEntry[] {
    return this.#entryList.filter(n => n.scope === scope);
  }

  public getEntriesByEntryType(entryType: URLChangedStatus): URLObserverEntry[] {
    return this.#entryList.filter(n => n.entryType === entryType);
  }
}
