import { assert } from '@esm-bundle/chai';

import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';
import { toResult } from './helpers/to-result.js';
import { TriggerEventListeners, triggerEvents, TriggerEventsEvents } from './helpers/trigger-event.js';

describe('methods-observe', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  it(`observes URL changes with routes`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [/^\/test/i],
    });

    const result = toResult<A>(observer.routes, h => !h.size);

    assert.deepStrictEqual(result, [
      ['/^\\/test/i', true],
    ]);
  });

  it(`observes URL changes with no route`, () => {
    const observer = init({
      routes: [],
    });

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`adds 'init' as first record when .observe() is called`, () => {
    const observer = init();

    observer.observe([/^\/test$/i]);

    assert.deepStrictEqual(observer.takeRecords().map(n => n.entryType), ['init']);
  });

  it(`observes URL changes`, async () => {
    const eventNames: TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
    const listeners: TriggerEventListeners = {};
    const observer = init();
    const run = triggerEvents(listeners);

    for (const n of eventNames) {
      await run(n, true);
    }

    observer.observe([/^\/test$/i]);

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
