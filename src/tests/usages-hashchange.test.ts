import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('usages-hashchange', () => {
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

  it(`tracks URL changes via hashchange`, async () => {
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
      const { initObserver } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({ routes: Object.values(routes) });

      $w.location.hash = a;
      $w.addEventListener(b, () => {
        const { pathname, hash } = $w.location;

        done([
          [pathname, hash].join(''),
          observer.takeRecords().map(n => n.entryType),
        ]);
      });
    }, newHash, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      '/test.html#123',
      ['init', 'popstate', 'hashchange'],
    ]);
  });

});
