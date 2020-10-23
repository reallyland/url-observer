import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './helpers/append-link.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';
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
      matches: { test: '123' },
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
      matches: {},
    });
  });

});
