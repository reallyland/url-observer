import { pushStateEventKey } from '../constants.js';
import type { RouteEvent, URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('usages-route-handler', () => {
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

  it(`runs before route handler on manual history update`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, string][];
    type C = [B, URLChangedStatus[]];

    const testOptions: B = [
      ['/test/123', ':default'],
      ['/test/456', 'test-1'],
    ];
    const expected: C = await browser.executeAsync(async (
      a: B,
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
      const result: B = [];

      for (const [urlPath, testScope] of a) {
        observer.add({
          pathRegExp: routes.section,
          handleEvent: () => {
            result.push([urlPath, testScope]);
            return true;
          },
          scope: testScope,
        });

        await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
          await observer.updateHistory(urlPath, testScope);
        });
      }

      done([
        result,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, testOptions, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      testOptions,
      [
        'init',
        ...Array.from<unknown, URLChangedStatus>(Array(testOptions.length), () => 'manual'),
      ],
    ]);
  });

  it(`runs before route handler on link click`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, Record<string, string>][];
    type C = [B, URLChangedStatus[]];

    const testOptions: B = [
      ['/test/123', { scope: ':default' }],
      ['/test/123a', { scope: '' }],
      ['/test/456', { ['.scope']: ':default' }],
      ['/test/456a', { ['.scope']: '' }],
      ['/test/789', { scope: 'test-1' }],
      ['/test/789a', { ['.scope']: 'test-1' }],
    ];
    const expected: C = await browser.executeAsync(async (
      a: B,
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
      const result: B = [];

      for (const [urlPath, testScope] of a) {
        const { link, removeLink } = appendLink(urlPath, testScope);

        observer.add({
          pathRegExp: routes.section,
          handleEvent: () => {
            result.push([urlPath, testScope]);
            return true;
          },
          scope: testScope.scope || testScope['.scope'],
        });

        await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
          link.click();
        });

        removeLink();
      }

      done([
        result,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, testOptions, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      testOptions,
      [
        'init',
        ...Array.from<unknown, URLChangedStatus>(Array(testOptions.length), () => 'click'),
      ],
    ]);
  });

  it(
    `does not run before route handler without defined scope on manual history update`,
    async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = [string, string | undefined][];
      type C = [B, URLChangedStatus[]];

      const testOptions: B = [
        ['/test/123', ''],
        ['/test/456', undefined],
      ];
      const expected: C = await browser.executeAsync(async (
        a: B,
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
        const result: B = [];

        for (const [urlPath, testScope] of a) {
          observer.add({
            pathRegExp: routes.section,
            handleEvent: () => {
              result.push([urlPath, testScope]);
              return true;
            },
            scope: testScope,
          });

          await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
            if (testScope == null) {
              await observer.updateHistory(urlPath);
            } else {
              await observer.updateHistory(urlPath, testScope);
            }
          });
        }

        done([
          result,
          observer.takeRecords().map(n => n.entryType),
        ]);
      }, testOptions, pushStateEventKey);

      expect(expected).toStrictEqual<C>([
        [],
        [
          'init',
          ...Array.from<unknown, URLChangedStatus>(Array(testOptions.length), () => 'manual'),
        ],
      ]);
    }
  );

  it(`does not run before route handler without defined scope on link click`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = [string, string][];
    type C = [B, URLChangedStatus[]];

    const testOptions: B = [
      ['/test/123', ''],
      ['/test/456', ':default'],
      ['/test/789', 'test-1'],
    ];
    const expected: C = await browser.executeAsync(async (
      a: B,
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
      const result: B = [];

      for (const [urlPath, testScope] of a) {
        const { link, removeLink } = appendLink(urlPath);

        observer.add({
          pathRegExp: routes.section,
          handleEvent: () => {
            result.push([urlPath, testScope]);
            return true;
          },
          scope: testScope,
        });

        await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
          link.click();
        });

        removeLink();
      }

      done([
        result,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, testOptions, pushStateEventKey);

    expect(expected).toStrictEqual<C>([
      [],
      [
        'init',
        ...Array.from<unknown, URLChangedStatus>(Array(testOptions.length), () => 'click'),
      ],
    ]);
  });

  it(
    `does not run update history as a result of before route handler on link click`,
    async function t() {
      type A = Record<'test' | 'section', RegExp>;
      type B = [string, Record<string, string>][];
      type C = [B, string[], URLChangedStatus[]];

      const testOptions: B = [
        ['/test/123', { scope: ':default' }],
        ['/test/123a', { scope: '' }],
        ['/test/456', { ['.scope']: ':default' }],
        ['/test/456a', { ['.scope']: '' }],
        ['/test/789', { scope: 'test-1' }],
        ['/test/789a', { ['.scope']: 'test-1' }],
      ];

      this.timeout(testOptions.length * 10e3);

      const expected: C = await browser.executeAsync(async (
        a: B,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver, waitForEvent } = $w.TestHelpers;
        const history: string[] = [];
        const result: B = [];
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({ routes: Object.values(routes) });

        for (const [urlPath, testScope] of a) {
          const { link, removeLink } = appendLink(urlPath, testScope);
          let temp: B[number] = ['nil', { scope: 'nil' }];

          observer.add({
            pathRegExp: routes.section,
            handleEvent: () => {
              temp = [urlPath, testScope];

              /** Return false to not update history */
              return false;
            },
            scope: testScope.scope || testScope['.scope'],
          });

          const ev = await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
            link.click();
          });

          removeLink();

          if (ev) result.push(temp);

          history.push($w.location.pathname);
        }

        done([
          result,
          history,
          observer.takeRecords().map(n => n.entryType),
        ]);
      }, testOptions, pushStateEventKey);

      expect(expected).toStrictEqual<C>([
        [],
        Array.from(Array(testOptions.length), () => '/test.html'),
        ['init'],
      ]);
    }
  );

  it(
    `does not run update history as a result of before route handler on manual history update`,
    async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = [string, string][];
      type C = [B, string[], URLChangedStatus[]];

      const testOptions: B = [
        ['/test/123', ':default'],
        ['/test/456', 'test-1'],
      ];
      const expected: C = await browser.executeAsync(async (
        a: B,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { initObserver, waitForEvent } = $w.TestHelpers;
        const history: string[] = [];
        const result: B = [];
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({ routes: Object.values(routes) });

        for (const [urlPath, testScope] of a) {
          let temp: B[number] = ['nil', 'nil'];

          observer.add({
            pathRegExp: routes.section,
            handleEvent: () => {
              temp = [urlPath, testScope];

              /** Return false to not update history */
              return false;
            },
            scope: testScope,
          });

          const ev = await waitForEvent<CustomEvent<RouteEvent>>(b, async () => {
            await observer.updateHistory(urlPath, testScope);
          });

          if (ev) result.push(temp);

          history.push($w.location.pathname);
        }

        done([
          result,
          history,
          observer.takeRecords().map(n => n.entryType),
        ]);
      }, testOptions, pushStateEventKey);

      expect(expected).toStrictEqual<C>([
        [],
        Array.from(Array(testOptions.length), () => '/test.html'),
        ['init'],
      ]);
    }
  );

});
