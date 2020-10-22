import { assert } from '@esm-bundle/chai';
import { pushStateEventKey } from '../constants.js';

import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './helpers/append-link.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';

describe('methods-match', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  // skip microsoftedge
  it(`finds a matched route`, async () => {
    const observer = init({
      routes: [/^\/test\/(?<test>[^\/]+)/i],
    });
    const { link, removeLink } = appendLink('/test/123');

    await waitForEvent(pushStateEventKey, () => {
      link.click();
    });

    removeLink();

    assert.deepStrictEqual(observer.match(), {
      found: true,
      matches: { test: '123' },
    });
  });

  it(`finds no matched route`, async () => {
    const observer = init({
      routes: [/^\/test$/i],
    });
    const { link, removeLink } = appendLink('/test/123');

    await waitForEvent(pushStateEventKey, () => {
      link.click();
    });

    removeLink();

    assert.deepStrictEqual(observer.match(), {
      found: false,
      matches: {},
    });
  });

});
