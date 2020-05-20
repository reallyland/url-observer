import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

interface MockRecord {
  data: Record<string, any>;
  title: string;
  url: string;
  type: 'push' | 'replace';
}

describe('usages-history', () => {
  /** Always load the page to reset URL history */
  beforeEach(async () => {
    await browser.url(HOST);

    /** Mock .pushState() and .replaceState() in window.history */
    await browser.executeAsync(async (done) => {
      class MockHistory {
        _replaceState: History['replaceState'] = window.history.replaceState.bind(window.history);
        _pushState: History['pushState'] = window.history.pushState.bind(window.history);
        _mockRecords: MockRecord[] = [];

        mock() {
          window.history.pushState = (data: MockRecord['data'], title: string, url: string) => {
            this._mockRecords.push({ data, title, url, type: 'push' });
          };
          window.history.replaceState = (data: MockRecord['data'], title: string, url: string) => {
            this._mockRecords.push({ data, title, url, type: 'replace' });
          };
        }

        restoreMock() {
          window.history.replaceState = this._replaceState;
          window.history.pushState = this._pushState;
        }

        takeRecords(): MockRecord[] {
          return Array.from(this._mockRecords);
        }
      }

      const mockHistory = new MockHistory();

      mockHistory.mock();

      (window as any).TestMock = mockHistory;

      done();
    });
  });

  afterEach(async () => {
    await browser.executeAsync(async (done) => {
      const obsList: URLObserver[] = window.observerList;

      for (const obs of obsList) obs.disconnect();

      /** Restore window.history */
      if ((window as any).TestMock) {
        (window as any).TestMock.restoreMock();
      }

      done();
    });
  });

  it(`replaces history when 'status' !== 'click'`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];
    type C = [MockRecord[], B];

    const expected: C = await browser.executeAsync(async (
      a: string,
      done
    ) => {
      const $w = window as unknown as Window;
      const { initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };
      const statuses: B = ['hashchange', 'manual'];

      const observer = initObserver({ routes: Object.values(routes) });

      for (const n of statuses) {
        switch (n) {
          case 'hashchange': {
            await waitForEvent(a, () => {
              $w.location.hash = 'test';
            });
            break;
          }
          case 'manual': {
            await observer.updateHistory('/test');
            break;
          }
          // These 2 can be skipped
          // case 'init':
          // case 'popstate':
          default:
        }
      }

      done([
        ($w as any).TestMock.takeRecords(),
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      [
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test.html' },
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test.html#test' },
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test.html#test' },
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test' },
      ],
      ['init', 'popstate', 'hashchange', 'manual'],
    ]);
  });

  it(`pushes history when 'status' === 'click' && not within 'dwellTime'`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];
    type C = [MockRecord[], B[]];

    const expected: C = await browser.executeAsync(async (
      a: string,
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };
      const options: number[] = [1e2, -1];

      const result: URLChangedStatus[][] = [];

      let i = 0;

      for (const dwellTime of options) {
        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { dwellTime },
        });
        const { link, removeLink } = appendLink(`/test-00${i}`);

        if (dwellTime > 0) await new Promise(y => setTimeout(y, dwellTime));

        await waitForEvent(a, () => link.click());

        result.push(observer.takeRecords().map(n => n.entryType));

        removeLink();
        observer.disconnect();
        i += 1;
      }

      done([
        ($w as any).TestMock.takeRecords(),
        result,
      ]);
    }, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      [
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test.html' },
        { data: {}, title: '', type: 'push', url: 'http://localhost:4000/test-000' },
        { data: {}, title: '', type: 'replace', url: 'http://localhost:4000/test.html' },
        { data: {}, title: '', type: 'push', url: 'http://localhost:4000/test-001' },
      ],
      [
        ['init', 'click'],
        ['init', 'click'],
      ],
    ]);
  });
});
