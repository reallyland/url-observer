import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';

describe('methods-update-history', () => {
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

  it(`updates history programmatically`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, URLChangedStatus[]];

    const newUrl = '/test/123';
    const expected: B = await browser.executeAsync(async (a: string, done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });

      await observer.updateHistory(a);

      done([
        $w.location.pathname,
        (observer as URLObserverWithDebug).takeRecords().map(n => n.entryType),
      ]);
    }, newUrl);

    expect(expected).toStrictEqual<B>([newUrl, ['init', 'manual']]);
  });

  it(`updates history programmatically with default before route handler`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, string[], URLChangedStatus[]];

    const newUrl = '/test/123';
    const scopeName = ':default';
    const expected: B = await browser.executeAsync(async (a: string, b: string, done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });
      const result: string[] = [];

      observer.add({
        pathRegExp: routes.section,
        handleEvent: () => {
          result.push(b);
          return true;
        },
      });

      await observer.updateHistory(a, b);

      done([
        $w.location.pathname,
        result,
        (observer as URLObserverWithDebug).takeRecords().map(n => n.entryType),
      ]);
    }, newUrl, scopeName);

    expect(expected).toStrictEqual<B>([newUrl, [scopeName], ['init', 'manual']]);
  });

  it(`updates history programmatically with scoped before route handler`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, string[], URLChangedStatus[]];

    const newUrl = '/test/123';
    const scopeName = ':test';
    const expected: B = await browser.executeAsync(async (a: string, b: string, done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { debug: true },
      });
      const result: string[] = [];

      observer.add({
        pathRegExp: routes.section,
        handleEvent: () => {
          result.push(b);
          return true;
        },
        scope: b,
      });

      await observer.updateHistory(a, b);

      done([
        $w.location.pathname,
        result,
        (observer as URLObserverWithDebug).takeRecords().map(n => n.entryType),
      ]);
    }, newUrl, scopeName);

    expect(expected).toStrictEqual<B>([newUrl, [scopeName], ['init', 'manual']]);
  });

});
