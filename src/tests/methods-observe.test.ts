import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import type { TriggerEventsEventName, TriggerEventsResult } from './test-helpers.js';

describe('methods-observer', () => {
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

  it(`observes URL changes with routes`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test/i],
        observerOption: { debug: true },
      });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, !beforeRouteHandlers.size]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(`observes URL changes with no route`, async () => {
    type A = number;

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [],
        observerOption: { debug: true },
      });

      done((observer as URLObserverWithDebug).routes.size);
    });

    expect(expected).toStrictEqual(0);
  });

  it(`adds 'init' as first record when .observe() is called`, async () => {
    type A = URLChangedStatus[];

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({ observerOption: { debug: true } });

      observer.observe([/^\/test$/i]);
      $w.observerList.push(observer);

      done(observer.takeRecords().map(n => n.entryType));
    });

    expect(expected).toEqual<A>(['init']);
  });

  it(`observes URL changes`, async () => {
    type A = TriggerEventsEventName;
    type B = TriggerEventsResult;
    type C = [B, URLChangedStatus[]];

    const expected: C = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver, triggerEvents } = $w.TestHelpers;

      const mergeListeners = (la: B, lb: B): B => {
        return {
          click: la.click.concat(lb.click),
          hashchange: la.hashchange.concat(lb.hashchange),
          popstate: la.popstate.concat(lb.popstate),
        };
      };
      const eventNames: A[] = ['click', 'hashchange', 'popstate'];
      const observer = initObserver({ observerOption: { debug: true } });

      let listeners: B = {
        click: [],
        hashchange: [],
        popstate: [],
      };

      for (const n of eventNames) {
        listeners = mergeListeners(listeners, await triggerEvents(n, true));
      }

      observer.observe([/^\/test$/i]);
      $w.observerList.push(observer);

      for (const n of eventNames) {
        listeners = mergeListeners(listeners, await triggerEvents(n));
      }

      done([listeners, observer.takeRecords().map(n => n.entryType)]);
    });

    expect(expected).toEqual<C>([
      {
        click: [null, 'click'],
        hashchange: [null, 'hashchange'],
        popstate: [null, 'popstate'],
      },
      ['init', 'click', 'popstate', 'hashchange', 'popstate'],
    ]);
  });

});
