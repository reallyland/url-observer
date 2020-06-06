import { pushStateEventKey } from '../constants.js';
import type { RouteEvent, URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('usages-route-match', () => {
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

  it(`pushes URL that is a matched route`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    interface B {
      test?: string;
    }
    type C = [RouteEvent, URLChangedStatus[]];

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

      const { link, removeLink } = appendLink(a);
      const observer = initObserver({ routes: Object.values(routes) });

      const ev = await waitForEvent<CustomEvent<RouteEvent<B>>>(b, () => {
        link.click();
      });

      removeLink();

      done([
        ev?.detail,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, newUrl, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      {
        found: true,
        matches: { test: '123' },
        scope: '',
        status: 'click',
        url: `http://localhost:4000${newUrl}`,
      },
      ['init', 'click'],
    ]);
  });

  it(`pushes URL that is a not-found route`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    interface B {
      test?: string;
    }
    type C = [RouteEvent, URLChangedStatus[]];

    const newUrl = '/test2';
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

      const { link, removeLink } = appendLink(a);
      const observer = initObserver({ routes: Object.values(routes) });

      const ev = await waitForEvent<CustomEvent<RouteEvent<B>>>(b, () => {
        link.click();
      });

      removeLink();

      done([
        ev?.detail,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, newUrl, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      {
        found: false,
        matches: {},
        scope: '',
        status: 'click',
        url: `http://localhost:4000${newUrl}`,
      },
      ['init', 'click'],
    ]);
  });

});
