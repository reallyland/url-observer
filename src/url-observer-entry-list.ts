import type { URLChangedStatus, URLObserverEntryProperty } from './custom_typings.js';
import { URLObserverEntry } from './url-observer-entry.js';

export class URLObserverEntryList {
  #entryList: Set<URLObserverEntry> = new Set();

  public get [Symbol.toStringTag](): string {
    return 'URLObserverEntryList';
  }

  public addEntry(option: URLObserverEntryProperty): void {
    this.#entryList.add(new URLObserverEntry(option));
  }

  public deleteEntries(): void {
    this.#entryList.clear();
  }

  public getEntries(): URLObserverEntry[] {
    return Array.from(this.#entryList);
  }

  public getEntriesByEntryScope(scope: string): URLObserverEntry[] {
    return Array.from(this.#entryList).filter(n => n.scope === scope);
  }

  public getEntriesByEntryType(entryType: URLChangedStatus): URLObserverEntry[] {
    return Array.from(this.#entryList).filter(n => n.entryType === entryType);
  }
}
