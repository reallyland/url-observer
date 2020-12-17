import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './utils/append-link.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { waitForEvent } from './utils/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('methods-match', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  // skip microsoftedge
  it(`finds a matched route`, async () => {
    const newUrl = '/test/123';

    const observer = init({
      routes: [routes.section],
    });
    const { removeLink } = appendLink(newUrl);

    await waitForEvent(pushStateEventKey, async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.deepStrictEqual(observer.match(), {
      found: true,
      params: { test: '123' },
    });
  });

  it(`finds no matched route`, async () => {
    const newUrl = '/test/123';

    const observer = init({
      routes: [routes.test],
    });
    const { removeLink } = appendLink(newUrl);

    await waitForEvent(pushStateEventKey, async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.deepStrictEqual(observer.match(), {
      found: false,
      params: {},
    });
  });

  it(`finds a matched route with a 'tail'`, async () => {
    interface A extends Record<string, unknown> {
      subTest: string;
    }

    const newUrl = '/sub-test/123';

    const observer = init({
      routes: [
        /^\/test\/123\/sub-test\/(?<test>[^/]+)$/i,
        /^\/sub-test\/(?<subTest>[^/]+)$/i,
      ],
    });

    const result = observer.match<A>(newUrl);

    assert.deepStrictEqual(result, {
      found: true,
      params: {
        subTest: '123',
      },
    });
  });

  it(`finds no matched route with a 'tail'`, async () => {
    const newUrl = '/sub-test/123';

    const observer = init({
      routes: [
        /^\/test\/123\/sub-test\/(?<test>[^/]+)$/i,
      ],
    });

    const result = observer.match(newUrl);

    assert.deepStrictEqual(result, {
      found: false,
      params: {},
    });
  });

});
