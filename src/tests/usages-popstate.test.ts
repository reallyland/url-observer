import { popStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import { itSkip } from './webdriverio-test-helpers.js';

describe('usages-popstate', () => {
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

  itSkip(['safari'])(`fires popstate event when triggered by hashchange`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];
    type C = [string, B];

    const newHash = '#123';
    const expected: C = await browser.executeAsync(async (
      a: string,
      b: string,
      done
    ) => {
      const $w = window as unknown as Window;
      const { initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({ routes: Object.values(routes) });

      await waitForEvent(b, () => {
        $w.location.hash = a;
      });

      const { pathname, hash } = $w.location;

      done([
        [pathname, hash].join(''),
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, newHash, popStateEventKey);

    expect(expected).toStrictEqual<C>([
      '/test.html#123',
      ['init', 'popstate'],
    ]);
  });

  itSkip(['firefox'])(`fires popstate event when triggered by history.back()`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];
    type C = [string, B];

    const newUrl = '/test/123';
    const expected: C = await browser.executeAsync(async (
      a: string,
      b: string,
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({ routes: Object.values(routes) });
      const { link, removeLink } = appendLink(a);

      await waitForEvent('click', () => link.click());
      await waitForEvent(b, () => $w.history.back());

      removeLink();

      done([
        $w.location.pathname,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, newUrl, popStateEventKey);

    expect(expected).toStrictEqual<C>([
      '/test.html',
      ['init', 'click', 'popstate'],
    ]);
  });

  it(`fires popstate event when triggered by history.forward()`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];
    type C = [string, B];

    const newUrls = ['/test/456', '/test/789'];
    const expected: C = await browser.executeAsync(async (
      a: string[],
      b: string,
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({
        routes: Object.values(routes),
        observerOption: { dwellTime: -1 },
      });

      for (const na of a) {
        const { link, removeLink } = appendLink(na);

        await waitForEvent('click', () => link.click());
        removeLink();
      }

      await waitForEvent(b, () => {
        $w.history.back();
      });

      await waitForEvent(b, () => {
        $w.history.forward();
      });

      done([
        $w.location.pathname,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, newUrls, popStateEventKey);

    expect(expected).toStrictEqual<C>([
      '/test/789',
      ['init', 'click', 'click', 'popstate', 'popstate'],
    ]);
  });

});
