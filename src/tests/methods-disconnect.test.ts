import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { TriggerEventsEventName, TriggerEventsResult } from './test-helpers.js';

describe('methods-disconnect', () => {
  /** Always load the page to reset URL history */
  beforeEach(async () => {
    await browser.url(HOST);
  });

  afterEach(async () => {
    await browser.executeAsync(async (done) => {
      const obsList: URLObserver[] = window.observerList;

      for (const obs of obsList) obs.disconnect();
      done();
    });
  });

  it(`disconnects`, async () => {
    type A = TriggerEventsEventName;
    type B = TriggerEventsResult;
    type C = [B, number[]];

    const expected: C = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver, triggerEvents } = $w.TestHelpers;
      const mergeListeners = (
        la: B,
        lb: B
      ): B => {
        return {
          click: la.click.concat(lb.click),
          hashchange: la.hashchange.concat(lb.hashchange),
          popstate: la.popstate.concat(lb.popstate),
        };
      };

      const events: A[] = ['click', 'hashchange', 'popstate'];
      const historyRecords: number[] = [];

      let listeners: B = {
        click: [],
        hashchange: [],
        popstate: [],
      };

      for (const n of events) {
        const observer = initObserver({
          routes: [/^\/test/i],
          observerOption: { debug: true },
        });

        listeners = mergeListeners(listeners, await triggerEvents(n));

        observer.disconnect();
        listeners = mergeListeners(listeners, await triggerEvents(n, true));

        historyRecords.push(observer.takeRecords.length);
      }

      done([listeners, historyRecords]);
    });

    expect(expected).toEqual<C>([
      {
        click: ['click', null],
        hashchange: ['hashchange', null],
        popstate: ['popstate', null],
      },
      [0, 0, 0],
    ]);
  });

});
