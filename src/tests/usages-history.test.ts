import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './helpers/append-link.js';
import { HistoryMock, MockRecord } from './helpers/history-mock.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('usages-history', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  let historyMock: HistoryMock;

  beforeEach(() => {
    historyMock = new HistoryMock();
    historyMock.mock();

    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  afterEach(() => {
    historyMock.restoreMock();
  });

  it(`replaces history when 'status' !== 'click'`, async () => {
    const statuses: URLChangedStatus[] = ['hashchange', 'manual'];

    const observer = init({
      routes: Object.values(routes),
    });

    for (const n of statuses) {
      switch (n) {
        case 'hashchange': {
          /**
           * 2 events will be fired when hash changes: popstate then hashchange.
           * For popstate event, `popStateEventKey` will be fired by the observer.
           * For hashchange event, `pushStateEventKey` will be fired by the observer.
           * So listening to just `pushStateEventKey` suffices in this case to ensure both events
           * are fired in the correct order.
           */
          await waitForEvent(pushStateEventKey, () => {
            window.location.hash = 'test';
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

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'popstate', 'hashchange', 'manual']
    );
    assert.deepStrictEqual(
      historyMock.takeRecords().map((n) => {
        const url = new URL(n.url);

        return {
          ...n,
          url: url.href.replace(url.origin, '').replace(url.search, ''),
        };
      }),
      [
        { data: {}, title: '', type: 'replace', url: '/' },
        { data: {}, title: '', type: 'replace', url: '/#test' },
        { data: {}, title: '', type: 'replace', url: '/#test' },
        { data: {}, title: '', type: 'replace', url: '/test' },
      ]
    );
  });

  it(`pushes history when 'status' === 'click' AND not within 'dwellTime'`, async () => {
    type A = URLChangedStatus[][];

    const dwellTimeOptions: number[] = [1e2, -1];
    const result: A = [];

    for (const dwellTime of dwellTimeOptions) {
      const newUrl = `/test-${dwellTime}`;
      const { removeLink } = appendLink(newUrl);
      const observer = init({
        routes: Object.values(routes),
        observerOption: { dwellTime },
      });

      if (dwellTime > 0) await new Promise(y => window.setTimeout(y, dwellTime));

      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      result.push(observer.takeRecords().map(n => n.entryType));

      removeLink();
      observer.disconnect();
    }

    assert.deepStrictEqual<MockRecord[]>(
      historyMock.takeRecords().map((n) => {
        const url = new URL(n.url);

        return {
          ...n,
          url: url.href.replace(url.origin, '').replace(url.search, ''),
        };
      }),
      [
        { data: {}, title: '', type: 'replace', url: '/' },
        { data: {}, title: '', type: 'push', url: '/test-100' },
        { data: {}, title: '', type: 'replace', url: '/' },
        { data: {}, title: '', type: 'push', url: '/test--1' },
      ]
    );
    assert.deepStrictEqual<A>(result, [
      ['init', 'click'],
      ['init', 'click'],
    ]);
  });

});
