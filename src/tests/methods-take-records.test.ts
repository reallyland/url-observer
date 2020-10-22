import { assert } from '@esm-bundle/chai';

import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';
import { TriggerEventListeners, triggerEvents } from './helpers/trigger-event.js';

describe('methods-take-records', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  it(`always returns 'init' as the first record`, () => {
    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
    });

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`takes records`, async () => {
    const listeners: TriggerEventListeners = {};
    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
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
    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
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
