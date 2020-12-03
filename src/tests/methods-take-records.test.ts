import { assert } from '@esm-bundle/chai';

import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { TriggerEventListeners, triggerEvents } from './utils/trigger-event.js';

describe('methods-take-records', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`always returns 'init' as the first record`, () => {
    const observer = init({
      routes: [routes.test],
    });

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`takes records`, async () => {
    const listeners: TriggerEventListeners = {};
    const observer = init({
      routes: [routes.test],
    });
    const run = triggerEvents(listeners);

    await run('click');

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click']
    );
  });

  it(`deletes no records after it disconnects`, async () => {
    const listeners: TriggerEventListeners = {};
    const observer = init({
      routes: [routes.test],
    });
    const run = triggerEvents(listeners);

    await run('click');

    observer.disconnect();

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      []
    );
  });

});
