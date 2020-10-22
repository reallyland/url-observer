import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';

describe('usages-hashchange', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const routes: Record<'section' | 'test', RegExp> = {
    section: /^\/test\/(?<test>[^\/]+)$/i,
    test: /^\/test$/i,
  };

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();

    /** Replace current URL to root path after each test */
    window.history.replaceState({}, '', '/');
  });

  it(`tracks URL changes via hashchange`, async () => {
    const newHash = '#123';

    const observer = init({
      routes: Object.values(routes),
    });

    await waitForEvent(pushStateEventKey, () => {
      window.location.hash = newHash;
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(window.location.hash, newHash);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'popstate', 'hashchange']
    );
  });

});
