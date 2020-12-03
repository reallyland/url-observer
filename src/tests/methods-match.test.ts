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

});
