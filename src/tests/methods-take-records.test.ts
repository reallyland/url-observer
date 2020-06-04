import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';

describe('methods-take-records', () => {
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

  it(`always returns 'init' as the first record`, async () => {
    type A = URLChangedStatus[];

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: Record<'test', RegExp> = {
        test: /^\/test$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      done((observer as URLObserverWithDebug).takeRecords().map(n => n.entryType));
    });

    expect(expected).toStrictEqual<A>(['init']);
  });

  it(`returns records`, async () => {
    type A = URLChangedStatus[];

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver, triggerEvents } = $w.TestHelpers;
      const routes: Record<'test', RegExp> = {
        test: /^\/test$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      await triggerEvents('click');

      done((observer as URLObserverWithDebug).takeRecords().map(n => n.entryType));
    });

    expect(expected).toStrictEqual<A>(['init', 'click']);
  });

  it(`returns no records after it disconnects`, async () => {
    type A = URLChangedStatus[];

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver, triggerEvents } = $w.TestHelpers;
      const routes: Record<'test', RegExp> = {
        test: /^\/test$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      await triggerEvents('click');

      observer.disconnect();

      done((observer as URLObserverWithDebug).takeRecords().map(n => n.entryType));
    });

    expect(expected).toStrictEqual<A>([]);
  });

});
