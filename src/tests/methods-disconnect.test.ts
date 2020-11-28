import { assert } from '@esm-bundle/chai';

import { popStateEventKey, pushStateEventKey } from '../constants.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { TriggerEventListeners, triggerEvents, TriggerEventsEvents } from './helpers/trigger-event.js';

describe('methods-disconnect', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`disconnects`, async () => {
    const events: TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
    const listeners: TriggerEventListeners = {};
    const historyRecords: number[] = [];
    const run = triggerEvents(listeners);

    for (const n of events) {
      const observer = init({
        routes: [routes.test],
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

  it(
    `does not update URL when updating history manually on disconnected observer`,
    async () => {
      const events: TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
      const listeners: TriggerEventListeners = {};
      const historyRecords: number[] = [];
      const run = triggerEvents(listeners);

      for (const n of events) {
        const observer = init({
          routes: [routes.test],
        });

        await run(n);

        observer.disconnect();

        await new Promise<void>(async (y) => {
          let clickTimer = -1;

          const onPopState = async () => {
            window.clearTimeout(clickTimer);

            // NOTE: TypeScript infers the typings better in this way.
            switch (n) {
              case 'popstate': {
                (listeners[n] ?? []).push(n);
                break;
              }
              case 'click':
              case 'hashchange':
              default:
            }

            window.removeEventListener(popStateEventKey, onPopState);
            window.removeEventListener(pushStateEventKey, onPushState);
            y();
          };
          const onPushState = async () => {
            window.clearTimeout(clickTimer);

            // NOTE: TypeScript infers the typings better in this way.
            switch (n) {
              case 'click': {
                (listeners[n] ?? []).push(n);
                break;
              }
              case 'hashchange': {
                (listeners[n] ?? []).push(n);
                break;
              }
              case 'popstate':
              default:
            }

            window.removeEventListener(pushStateEventKey, onPushState);
            window.removeEventListener(popStateEventKey, onPopState);
            y();
          };

          window.addEventListener(popStateEventKey, onPopState);
          window.addEventListener(pushStateEventKey, onPushState);

          clickTimer = window.setTimeout(() => {
            (listeners[n] ?? []).push(null);
            window.removeEventListener(popStateEventKey, onPopState);
            window.removeEventListener(pushStateEventKey, onPushState);
            y();
          }, 2e3);

          await observer.updateHistory(`/test-${new Date().toJSON()}`);
        });

        historyRecords.push(observer.takeRecords().length);
      }

      assert.deepStrictEqual(listeners, {
        click: ['click', null],
        hashchange: ['hashchange', null],
        popstate: ['popstate', null],
      } as TriggerEventListeners);
      assert.deepStrictEqual(historyRecords, [0, 0, 0]);
    }
  );

});
