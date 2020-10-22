import { assert } from '@esm-bundle/chai';

import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';
import { TriggerEventListeners, triggerEvents, TriggerEventsEvents } from './helpers/trigger-event.js';

describe('methods-disconnect', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  it(`disconnects`, async () => {
    const events: TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
    const listeners: TriggerEventListeners = {};
    const historyRecords: number[] = [];
    const run = triggerEvents(listeners);

    for (const n of events) {
      const observer = init({
        routes: [/^\/test/i],
      });

      await run(n);

      observer.disconnect();

      await run(n, true);

      historyRecords.push(observer.takeRecords().length);
    }

    assert.deepStrictEqual(listeners, {
      click: ['click', null],
      hashchange: ['hashchange', null],
      popstate: ['popstate', null],
    } as TriggerEventListeners);
    assert.deepStrictEqual(historyRecords, [0, 0, 0]);
  });

});
