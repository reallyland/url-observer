import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { RouteEvent, URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './helpers/append-link.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

function normalizeEventDetailUrl<T>(detail?: RouteEvent<T>): RouteEvent<T> {
  if (detail == null) return {} as RouteEvent<T>;

  const url = new URL(detail.url);

  return {
    ...detail,
    url: `${url.pathname}${url.hash}`,
  };
}

describe('usages-route-match', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  // skip microsoftedge
  it(`pushes URL that is a matched route`, async () => {
    type A = Record<'test', string>;

    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });

    const ev = await waitForEvent<CustomEvent<RouteEvent<A>>>(pushStateEventKey, async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.deepStrictEqual<RouteEvent<A>>(normalizeEventDetailUrl(ev?.detail), {
      found: true,
      params: {
        test: '123',
      },
      scope: '',
      status: 'click',
      url: newUrl,
    });
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click']
    );
  });

  it(`pushes URL tht is a not-found route`, async () => {
    type A = Partial<Record<'test', string>>;

    const newUrl = '/test2';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });

    const ev = await waitForEvent<CustomEvent<RouteEvent<A>>>(pushStateEventKey, async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.deepStrictEqual<RouteEvent<A>>(normalizeEventDetailUrl(ev?.detail), {
      found: false,
      params: {},
      scope: '',
      status: 'click',
      url: newUrl,
    });
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click']
    );
  });

});
