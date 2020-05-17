import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';

describe('methods-add', () => {
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

  it(`adds first route`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [],
        observerOption: { debug: true },
      });

      observer.add({ pathRegExp: /^\/test/i });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, !beforeRouteHandlers.size]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(`adds first route with default before route handler`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const scopeName = ':default';

      const observer = initObserver({
        routes: [],
        observerOption: { debug: true },
      });

      observer.add({
        handleEvent: () => true,
        pathRegExp: /^\/test/i,
      });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, beforeRouteHandlers.has(scopeName)]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(`adds first route with scoped before route handler`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const scopeName = ':test';

      const observer = initObserver({
        routes: [],
        observerOption: { debug: true },
      });

      observer.add({
        handleEvent: () => true,
        pathRegExp: /^\/test/i,
        scope: scopeName,
      });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, beforeRouteHandlers.has(scopeName)]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(`adds new route`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test/i],
        observerOption: { debug: true },
      });

      observer.add({ pathRegExp: /^\/test1/i });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, !beforeRouteHandlers.size]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([
      ['/^\\/test/i', true],
      ['/^\\/test1/i', true],
    ]);
  });

  it(`does not add new route to existing route`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test/i],
        observerOption: { debug: true },
      });

      observer.add({ pathRegExp: /^\/test/i });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, !beforeRouteHandlers.size]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(`does not override existing route`, async () => {
    type A = [string, boolean];

    const expected: A[] = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const scopeName = ':default';

      const observer = initObserver({
        routes: [/^\/test/i],
        observerOption: { debug: true },
      });

      observer.add({
        handleEvent: () => true,
        pathRegExp: /^\/test/i,
      });
      observer.add({ pathRegExp: /^\/test/i });

      const result: A[] = [];
      for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
        result.push([k, beforeRouteHandlers.size === 1 && beforeRouteHandlers.has(scopeName)]);
      }

      done(result);
    });

    expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
  });

  it(
    `adds default before route handler to existing route with existing before route handlers`,
    async () => {
      type A = [string, boolean];

      const expected: A[] = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;
        const { initObserver } = $w.TestHelpers;
        const scopeName = ':test';

        const observer = initObserver({
          routes: [/^\/test/i],
          observerOption: { debug: true },
        });

        observer.add({
          handleEvent: () => true,
          pathRegExp: /^\/test/i,
          scope: scopeName,
        });
        observer.add({
          handleEvent: () => true,
          pathRegExp: /^\/test/i,
        });

        const result: A[] = [];
        for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
          result.push([
            k,
            beforeRouteHandlers.size === 2 &&
            [':default', scopeName].every(n => beforeRouteHandlers.has(n)),
          ]);
        }

        done(result);
      });

      expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
    }
  );

  it(
    `adds scoped before route handler to existing route with existing before route handlers`,
    async () => {
      type A = [string, boolean];

      const expected: A[] = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;
        const { initObserver } = $w.TestHelpers;
        const scopeName = ':test';

        const observer = initObserver({
          routes: [/^\/test/i],
          observerOption: { debug: true },
        });

        observer.add({
          handleEvent: () => true,
          pathRegExp: /^\/test/i,
        });
        observer.add({
          handleEvent: () => true,
          pathRegExp: /^\/test/i,
          scope: scopeName,
        });

        const result: A[] = [];
        for (const [k, { beforeRouteHandlers }] of (observer as URLObserverWithDebug).routes) {
          result.push([
            k,
            beforeRouteHandlers.size === 2 &&
            [':default', scopeName].every(n => beforeRouteHandlers.has(n)),
          ]);
        }

        done(result);
      });

      expect(expected).toEqual<A[]>([['/^\\/test/i', true]]);
    }
  );

});
