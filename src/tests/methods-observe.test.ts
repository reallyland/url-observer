import { assert } from '@esm-bundle/chai';

import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { toResult } from './utils/to-result.js';
import {
  TriggerEventListeners,
  triggerEvents,
  TriggerEventsEvents,
} from './utils/trigger-event.js';

describe('methods-observe', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`observes URL changes with routes`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [routes.test],
    });

    const result = toResult<A>(observer.routes, h => !h.size);

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(`observes URL changes with no route`, () => {
    const observer = init({
      routes: [],
    });

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`observes with non-array routes`, () => {
    const observer = init();

    observer.observe(null as never, {
      debug: true,
    });

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`adds 'init' as first record when .observe() is called`, () => {
    const observer = init();

    observer.observe([routes.test]);

    assert.deepStrictEqual(observer.takeRecords().map(n => n.entryType), ['init']);
  });

  // FIXME: Potential slowdown
  it(`observes URL changes`, async () => {
    const eventNames: TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
    const listeners: TriggerEventListeners = {};
    const observer = init();
    const run = triggerEvents(listeners);

    for (const n of eventNames) {
      await run(n, true);
    }

    observer.observe([routes.test]);

    for (const n of eventNames) {
      await run(n);
    }

    assert.deepStrictEqual(listeners, {
      click: [null, 'click'],
      hashchange: [null, 'hashchange'],
      popstate: [null, 'popstate'],
    });
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map<URLChangedStatus>(n => n.entryType),
      [
        'init',
        'click',
        'popstate',
        'hashchange',
        'popstate',
      ]
    );
  });

});
