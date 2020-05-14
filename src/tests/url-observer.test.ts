import type { MatchedRoute, URLObserverEntryProperties } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('url-observer', () => {
  /** Always load the page to reset URL history */
  beforeEach(async () => {
    await browser.url(HOST);
  });

  afterEach(async () => {
    await browser.executeAsync(async (done) => {
      const obsList: URLObserver[] = (window as any).observerList;

      for (const obs of obsList) obs.disconnect();
      done();
    });
  });

  it(`instantiates without 'callback'`, async () => {
    type A = boolean;
    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o();

      $w.observerList.push(observer);

      done(typeof(observer) === 'object');
    });

    expect(expected).toBeTruthy();
  });

  it(`instantiates with 'callback'`, async () => {
    type A = boolean;
    const expected: A = await browser.executeAsync(async (done) => {
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o((list, obs) => {
        /** Do nothing */
        return [list, obs];
      });

      $w.observerList.push(observer);

      done(typeof(observer) === 'object');
    });

    expect(expected).toBeTruthy();
  });

  it(`runs 'callback' on URL change`, async () => {
    type A = [URLObserverEntryProperties[], boolean];
    const newUrl = '/test';
    const expected: A = await browser.executeAsync(async (a: string, done) => {
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o((list, obs) => {
        if (!linkClicked) return;

        const entries = list.getEntries();
        const result: A = [[], false];

        for (const entry of entries) result[0].push(entry.toJSON());
        result[1] = (typeof(obs) === 'object');

        done(result);
      });
      const routes = [/^\/test$/i];
      let linkClicked = false;

      const link = document.createElement('a');
      link.href = a;
      link.textContent = a;

      document.body.appendChild(link);
      $w.observerList.push(observer);
      observer.observe(routes);

      linkClicked = true;
      link.click();
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
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o();
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const links: HTMLAnchorElement[] = [];
      for (const l of a) {
        const link = document.createElement('a');

        link.href = l;
        link.textContent = l;
        links.push(link);
        document.body.appendChild(link);
      }

      $w.observerList.push(observer);
      observer.observe(Object.values(routes));

      const results: MatchedRoute<B>[] = [];

      for (const l of links) {
        l.click();
        results.push(observer.match<B>());
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
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o();
      const routes: Record<A, RegExp> = {
        page: $w.pathToRegExp('/test'),
        section: $w.pathToRegExp('/test/:test'),
      };

      const links: HTMLAnchorElement[] = [];
      for (const l of a) {
        const link = document.createElement('a');

        link.href = l;
        link.textContent = l;
        links.push(link);
        document.body.appendChild(link);
      }

      $w.observerList.push(observer);
      observer.observe(Object.values(routes), {
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
      });

      const results: MatchedRoute<B>[] = [];

      for (const l of links) {
        l.click();
        results.push(observer.match<B>());
      }

      done(results);
    }, newUrls);

    expect(expected).toHaveLength(2);
    expect(expected).toEqual([
      { found: true, matches: {} },
      { found: true, matches: { test: '123' } },
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
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o();
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const links: HTMLAnchorElement[] = [];
      for (const l of a) {
        const link = document.createElement('a');

        link.href = l;
        link.textContent = l;
        links.push(link);
        document.body.appendChild(link);
      }

      $w.observerList.push(observer);
      observer.observe(Object.values(routes));

      for (const l of links) {
        /** Push 1st and 2nd URL, then replace 2nd with 3rd URL. */
        if (l.textContent !== a[2]) await new Promise(y => setTimeout(y, 2e3));

        l.click();
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

  it(`runs matcher with custom 'dwellTime'`, async () => {
    type A = 'page' | 'section';
    type B = string;

    const newUrls = ['/test', '/test/123'];
    const expected: B = await browser.executeAsync(async (
      a: string[],
      done
    ) => {
      const $w = window as any;
      const o: typeof URLObserver = $w.URLObserver;
      const observer = new o();
      const routes: Record<A, RegExp> = {
        page: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const links: HTMLAnchorElement[] = [];
      for (const l of a) {
        const link = document.createElement('a');

        link.href = l;
        link.textContent = l;
        links.push(link);
        document.body.appendChild(link);
      }

      $w.observerList.push(observer);
      /** Always push when 'dwellTime' < 0 */
      observer.observe(Object.values(routes), { dwellTime: -1 });

      for (const l of links) {
        l.click();
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
