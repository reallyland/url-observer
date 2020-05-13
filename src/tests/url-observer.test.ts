import type { MatchedRoute, URLObserverEntryProperties } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('url-observer', () => {
  before(async () => {
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
      observer.observe(Object.keys(routes).map(n => routes[n as A]));

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
      observer.observe(Object.keys(routes).map(n => routes[n as A]), {
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

});

// TODO: Write tests for 'dwellTime'
