import { assert } from '@esm-bundle/chai';

import { popStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './utils/append-link.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { waitForEvent } from './utils/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('usages-popstate', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  // skip safari
  it(`fires popstate event when triggered by hashchange`, async () => {
    const newHash = '123';

    const observer = init({
      routes: Object.values(routes),
    });

    await waitForEvent(popStateEventKey, () => {
      window.location.hash = newHash;
    });

    assert.strictEqual(`${window.location.pathname}${window.location.hash}`, `/#${newHash}`);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'popstate']
    );
  });

  // skip firefox, safari
  it(`fires popstate event when triggered by history.back()`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });

    await waitForEvent('click', async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    await waitForEvent(popStateEventKey, () => {
      window.history.back();
    });

    removeLink();

    assert.strictEqual(window.location.pathname, '/');
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click', 'popstate']
    );
  });

  it(`fires popstate event when triggered by history.forward()`, async () => {
    const newUrls = ['/test/456', '/test/789'];

    const observer = init({
      routes: Object.values(routes),
      observerOption: {
        dwellTime: -1,
      },
    });

    for (const newUrl of newUrls) {
      const { removeLink } = appendLink(newUrl);

      await waitForEvent('click', async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
    }

    await waitForEvent(popStateEventKey, () => {
      window.history.back();
    });

    await waitForEvent(popStateEventKey, () => {
      window.history.forward();
    });

    assert.strictEqual(window.location.pathname, '/test/789');
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click', 'click', 'popstate', 'popstate']
    );
  });

});
