import type { MatchedRoute, RouteValue, URLObserverEntryProperties } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import type { AppendLinkResult } from './test-helpers.js';

describe('url-observer', () => {
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

  it(`instantiates without 'callback'`, async () => {
    type A = boolean;
    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver();

      done(typeof(observer) === 'object');
    });

    expect(expected).toBeTruthy();
  });

  it(`instantiates with 'callback'`, async () => {
    type A = boolean;
    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        callback: (list, obs) => {
          /** Do nothing */
          return [list, obs];
        },
      });

      done(typeof(observer) === 'object');
    });

    expect(expected).toBeTruthy();
  });

  it(`runs 'callback' on URL change`, async () => {
    type A = [URLObserverEntryProperties[], boolean];

    const newUrl = '/test';
    const expected: A = await browser.executeAsync(async (a: string, done) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;

      let linkClicked = false;

      const observer = initObserver({
        callback: (list, obs) => {
          if (!linkClicked) return;

          const entries = list.getEntries();
          const result: A = [[], false];

          for (const entry of entries) result[0].push(entry.toJSON());
          result[1] = (typeof(obs) === 'object');

          done(result);
        },
      });
      const { link, removeLink } = appendLink(a);

      observer.observe([/^\/test$/i]);

      linkClicked = true;
      link.click();
      removeLink();
    }, newUrl);

    const [urlEntries, isFn] = expected;

    expect(urlEntries).toHaveLength(2);
    expect(urlEntries.map(n => n.entryType)).toEqual(['init', 'click']);
    expect(urlEntries[1].url).toStrictEqual(expect.stringContaining(newUrl));
    expect(isFn).toBeTruthy();
  });

  (
    /** As of writing, only Chrome and Webkit stable support RegExp capturing groups */
    browser.isChrome ? it : it.skip
  )(`runs matcher with native RegExp capturing groups on URL change`, async () => {
    type A = 'page' | 'section';
    interface B {
      test?: string;
    }

    const newUrls = ['/test', '/test/123'];
    const expected: MatchedRoute<B>[] = await browser.executeAsync(async (
      a: string[],
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
      });

      const links: AppendLinkResult[] = a.map(n => appendLink(n));
      const results: MatchedRoute<B>[] = [];

      for (const l of links) {
        l.link.click();
        results.push(observer.match<B>());
        l.removeLink();
      }

      done(results);
    }, newUrls);

    expect(expected).toHaveLength(2);
    expect(expected).toEqual([
      { found: true, matches: {} },
      { found: true, matches: { test: '123' } },
    ]);
  });

  it(`runs with custom matcher callback on URL change`, async () => {
    type A = 'page' | 'section';
    interface B {
      test?: string;
    }

    const newUrls = ['/test', '/test/123'];
    const expected: MatchedRoute<B>[] = await browser.executeAsync(async (
      a: string[],
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;
      const routes: Record<A, RegExp> = {
        page: $w.pathToRegExp('/test'),
        section: $w.pathToRegExp('/test/:test'),
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: {
          matcherCallback: function customMatcher<T>(p: string, r: RegExp): T {
            const [, ...matches] = p.match(r) ?? [];

            switch (r) {
              case routes.section: {
                return { test: matches[0] } as unknown as T;
              }
              case routes.page:
              default: {
                return {} as unknown as T;
              }
            }
          },
        },
      });

      const links: AppendLinkResult[] = a.map(n => appendLink(n));
      const results: MatchedRoute<B>[] = [];

      for (const l of links) {
        l.link.click();
        results.push(observer.match<B>());
        l.removeLink();
      }

      done(results);
    }, newUrls);

    expect(expected).toHaveLength(2);
    expect(expected).toEqual([
      { found: true, matches: {} },
      { found: true, matches: { test: '123' } },
    ]);
  });

  it(`does not expose 'routes' as public property when 'debug=false'`, async () => {
    type A = boolean;

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({ routes: [] });

      /** This shows that 'routes' property is enumerable */
      done(Object.keys(observer).includes('routes'));
    });

    expect(expected).toBeFalsy();
  });

  it(`exposes 'routes' as public property when 'debug=true'`, async () => {
    type A = boolean;
    type C = [string, {
      [K in keyof RouteValue]: K extends 'beforeRouteHandlers' ? unknown[] : string;
    }];

    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test/i],
        observerOption: { debug: true },
      });
      const result: C[] = [];

      for (const [k, v] of (observer as URLObserverWithDebug).routes) {
        const { beforeRouteHandlers, pathRegExp } = v;

        result.push([k, {
          beforeRouteHandlers: Array.from(beforeRouteHandlers),
          pathRegExp: pathRegExp.toString(),
        }]);
      }

      done(result);
    });

    expect(expected).toEqual([
      [
        '/^\\/test/i', {
          beforeRouteHandlers: [],
          pathRegExp: '/^\\/test/i',
        },
      ],
    ]);
  });

  it(`runs matcher with default 'dwellTime'`, async () => {
    type A = 'page' | 'section';
    type B = string;

    const newUrls = ['/test', '/test/123', '/test/456'];
    const expected: B = await browser.executeAsync(async (
      a: string[],
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      initObserver({ routes: Object.values(routes) });

      const links: AppendLinkResult[] = a.map(n => appendLink(n));

      for (const { link, removeLink } of links) {
        /** Push 1st and 2nd URL, then replace 2nd with 3rd URL. */
        if (link.textContent !== a[2]) await new Promise(y => setTimeout(y, 2e3));

        link.click();
        removeLink();
      }

      const popStateDone = new Promise((y) => {
        function popStateDoneCallback() {
          y();
          $w.removeEventListener('popstate', popStateDoneCallback);
        }

        $w.addEventListener('popstate', popStateDoneCallback);
      });

      $w.history.back();
      await popStateDone;

      done($w.location.href);
    }, newUrls);

    const url = new URL(expected);

    expect(url.pathname).toStrictEqual(newUrls[0]);
  });

  it(`runs matcher with custom 'dwellTime'`, async () => {
    type A = 'page' | 'section';
    type B = string;

    const newUrls = ['/test', '/test/123'];
    const expected: B = await browser.executeAsync(async (
      a: string[],
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      initObserver({
        routes: Object.values(routes),
        observerOption: {
          /** Always push URL when 'dwellTime' < 0 */
          dwellTime: -1,
        },
      });
      const links: AppendLinkResult[] = a.map(n => appendLink(n));

      for (const l of links) {
        l.link.click();
        l.removeLink();
      }

      const popStateDone = new Promise((y) => {
        function popStateDoneCallback() {
          y();
          ($w as Window).removeEventListener('popstate', popStateDoneCallback);
        }

        ($w as Window).addEventListener('popstate', popStateDoneCallback);
      });

      ($w as Window).history.back();
      await popStateDone;

      done($w.location.href);
    }, newUrls);

    const url = new URL(expected);

    expect(url.pathname).toStrictEqual(newUrls[0]);
  });

});
