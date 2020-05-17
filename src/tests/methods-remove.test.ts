import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';

describe('methods-remove', () => {
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

  it(`removes an existing route with no before route handlers`, async () => {
    type A = number;

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

      observer.remove(routes.test);

      done((observer as URLObserverWithDebug).routes.size);
    });

    expect(expected).toStrictEqual<A>(0);
  });

  it(`removes an existing route with before route handlers`, async () => {
    type A = number;

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

      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
      });
      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
        scope: ':test',
      });
      observer.remove(routes.test);

      done((observer as URLObserverWithDebug).routes.size);
    });

    expect(expected).toStrictEqual<A>(0);
  });

  it(`removes an existing default before route handler`, async () => {
    type A = [string, string[]];

    const scopeName = ':test';
    const expected: A[] = await browser.executeAsync(async (a: string, done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: Record<'test', RegExp> = {
        test: /^\/test$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
      });
      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
        scope: a,
      });
      observer.remove(routes.test, '');

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        const handlers: string[] = [];

        for (const [k2] of beforeRouteHandlers) {
          handlers.push(k2);
        }

        result.push([k, handlers]);
      }

      done(result);
    }, scopeName);

    expect(expected).toStrictEqual<A[]>([
      ['/^\\/test$/i', [scopeName]],
    ]);
  });

  it(`removes an existing scoped before route handler`, async () => {
    type A = [string, string[]];

    const scopeName = ':test';
    const expected: A[] = await browser.executeAsync(async (a: string, done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: Record<'test', RegExp> = {
        test: /^\/test$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
      });
      observer.add({
        pathRegExp: routes.test,
        handleEvent: () => true,
        scope: a,
      });
      observer.remove(routes.test, a);

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        const handlers: string[] = [];

        for (const [k2] of beforeRouteHandlers) {
          handlers.push(k2);
        }

        result.push([k, handlers]);
      }

      done(result);
    }, scopeName);

    expect(expected).toStrictEqual<A[]>([
      ['/^\\/test$/i', [':default']],
    ]);
  });

});
