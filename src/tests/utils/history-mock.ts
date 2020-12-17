export interface MockRecord {
  data: Record<string, unknown>;
  title: string;
  type: 'push' | 'replace';
  url: string;
}

export class HistoryMock {
  private _mockRecords: Set<MockRecord> = new Set();
  private _originalUrl = '/';
  private _pushState: History['pushState'] | null = null;
  private _replaceState: History['replaceState'] | null = null;

  public clearMock(): void {
    this._mockRecords.clear();
  }

  public mock(): void {
    const mockFn = (type: MockRecord['type']) => {
      return (data: MockRecord['data'], title: MockRecord['title'], url: MockRecord['url']) => {
        this._mockRecords.add({ data, title, type, url });
      };
    };

    this._originalUrl = window.location.href;
    this._replaceState = window.history.replaceState.bind(window.history);
    this._pushState = window.history.pushState.bind(window.history);

    window.history.pushState = mockFn('push');
    window.history.replaceState = mockFn('replace');
  }

  public restoreMock(): void {
    if (this._replaceState) {
      window.history.replaceState = this._replaceState;
      this._replaceState = null;
    }

    if (this._pushState) {
      window.history.pushState = this._pushState;
      this._pushState = null;
    }

    this.clearMock();

    /**
     * By restoring the historyMock, it replaces the current browser history to the original URL
     * that was captured before the history gets mocked. Such approach works so far regardless of
     * the order of the tests.
     *
     * If it runs into any kind of issues then this could probably be the 1st place to debug the
     * root cause as the old URL might gets carried forward to the subsequent test.
     */
    window.history.replaceState({}, '', this._originalUrl);
    this._originalUrl = '/';
  }

  public takeRecords(): MockRecord[] {
    return Array.from(this._mockRecords);
  }

}
