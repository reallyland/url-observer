import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { MatchedRoute, RouteValue, URLChangedStatus, URLObserverEntryProperties } from '../custom_typings.js';
import { URLObserver } from '../url-observer.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink, AppendLinkResult } from './helpers/append-link.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('url-observer', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`returns the correct name`, () => {
    const observer = init();

    assert.strictEqual(observer[Symbol.toStringTag], 'URLObserver');
    assert.strictEqual(Object.prototype.toString.call(observer), '[object URLObserver]');
  });

  it(`instantiates without 'callback'`, () => {
    const observer = init();

    assert.instanceOf(observer, URLObserver);
  });

  it(`instantiates with 'callback'`, () => {
    const observer = init({
      callback(list, obs) {
        /** Do nothing */
        return [list, obs];
      },
    });

    assert.instanceOf(observer, URLObserver);
  });

  it(`runs 'callback' on URL change`, async () => {
    let linkClicked = false;

    const newUrl = '/test';
    const [
      urlEntries,
      observerParam,
    ] = await new Promise<[URLObserverEntryProperties[], URLObserver]>(async (y) => {
      const { removeLink } = appendLink(newUrl);
      const observer = init({
        callback(list, obs) {
          if (!linkClicked) return;

          const result: URLObserverEntryProperties[] = [];

          for (const entry of list.getEntries()) {
            result.push(entry.toJSON());
          }

          y([result, obs]);
        },
      });

      observer.observe([routes.test]);

      await waitForEvent(pushStateEventKey, async () => {
        /**
         * Set linkClicked to true first so that 'callback' can be called after link click.
         * - Wrong: link.click() -> linkClicked is false -> noop
         * - Correct: linkClicked is true -> link.click() -> Run 'callback'
         */
        linkClicked = true;
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
    });

    assert.deepStrictEqual<URLChangedStatus[]>(
      urlEntries.map(n => n.entryType),
      ['init', 'click']
    );
    assert.strictEqual(new URL(urlEntries[1].url).pathname, newUrl);
    assert.instanceOf(observerParam, URLObserver);
  });

  it(`does not call .observe() more than once`, () => {
    const observer = init();

    observer.observe([routes.test]);
    observer.observe([routes.test]);

    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  // skip microsoftedge
  it(`runs matcher with native RegExp capturing groups on URL change`, async () => {
    type A = MatchedRoute<Record<'test', string>>;

    const newUrls = ['/test', '/test/123'];

    const observer = init({
      routes: Object.values(routes),
      observerOption: {
        dwellTime: -1,
      },
    });

    const result: A[] = [];
    for (const [
      newUrl,
      { removeLink },
    ] of newUrls.map<[string, AppendLinkResult]>(n => [n, appendLink(n)])) {
      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();

      result.push(observer.match());
    }

    assert.deepStrictEqual(result, [
      { found: true, matches: {} },
      { found: true, matches: { test: '123' } },
    ]);
  });

  it(`runs with custom matcher callback on URL change`, async () => {
    type A = MatchedRoute<Record<'test', string>>;

    const newUrls = ['/test', '/test/123'];

    const observer = init({
      routes: Object.values(routes),
      observerOption: {
        dwellTime: -1,
        matcherCallback<T>(p: string, r: RegExp): T {
          const [, ...matches] = p.match(r) ?? [];

          switch (r) {
            case routes.section: {
              return { test: matches[0] } as unknown as T;
            }
            case routes.test:
            default: {
              return {} as unknown as T;
            }
          }
        },
      },
    });

    const result: A[] = [];
    for (const [
      newUrl,
      { removeLink },
    ] of newUrls.map<[string, AppendLinkResult]>(n => [n, appendLink(n)])) {
      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();

      result.push(observer.match());
    }

    assert.deepStrictEqual(result, [
      { found: true, matches: {} },
      { found: true, matches: { test: '123' } },
    ]);
  });

  it(`does not expose 'routes' as public property when 'debug=false'`, async () => {
    const observer = init({
      observerOption: {
        debug: false,
      },
      routes: [],
    });

    /** This shows that 'routes' property is enumerable */
    assert.notOk(Object.keys(observer).includes('routes'));
  });

  it(`exposes 'routes' as public property when 'debug=true'`, () => {
    type A = [string, {
      [K in keyof RouteValue]: K extends 'beforeRouteHandlers' ? unknown[] : string;
    }];

    const observer = init({
      routes: [routes.test],
    });

    const result: A[] = [];
    for (const [k, { beforeRouteHandlers, pathRegExp }] of observer.routes) {
      result.push([k, {
        beforeRouteHandlers: Array.from(beforeRouteHandlers),
        pathRegExp: String(pathRegExp),
      }]);
    }

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', {
        beforeRouteHandlers: [],
        pathRegExp: '/^\\/test$/i',
      }],
    ]);
  });

  it(`runs matcher with default 'dwellTime'`, async () => {
    const newUrls = ['/test', '/test/123', '/test/456'];

    init({
      routes: Object.values(routes),
    });

    /** Push all URLs into history */
    for (const [
      newUrl,
      { removeLink },
    ] of newUrls.map<[string, AppendLinkResult]>(n => [n, appendLink(n)])) {
      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();

      await new Promise(y => window.setTimeout(y, 2e3));
    }

    /** Pop n - 1 URLs out of history */
    for (const _ of newUrls.slice(0, -1)) {
      await waitForEvent('popstate', () => {
        window.history.back();
      });
    }

    assert.strictEqual(new URL(window.location.href).pathname, newUrls[0]);
  });

  it(`runs matcher with default 'dwellTime'`, async () => {
    const newUrls = ['/test', '/test/123', '/test/456'];

    init({
      observerOption: {
        /** Always push URL when 'dwellTime' < 0 */
        dwellTime: -1,
      },
      routes: Object.values(routes),
    });

    /** Push all URLs into history */
    for (const [
      newUrl,
      { removeLink },
    ] of newUrls.map<[string, AppendLinkResult]>(n => [n, appendLink(n)])) {
      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
    }

    /** Pop n - 1 URLs out of history */
    for (const _ of newUrls.slice(0, -1)) {
      await waitForEvent('popstate', () => {
        window.history.back();
      });
    }

    assert.strictEqual(new URL(window.location.href).pathname, newUrls[0]);
  });

  it(`replaces history when URL changes are too frequent (< 'dwellTime')`, async () => {
    const newUrls = ['/test', '/test/123', '/test/456'];

    init({
      routes: Object.values(routes),
    });

    /** Push all URLs into history */
    for (const [
      newUrl,
      { removeLink },
    ] of newUrls.map<[string, AppendLinkResult]>(n => [n, appendLink(n)])) {
      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      /** Only wait for dwellTime after first URL */
      if (newUrl === newUrls[0]) {
        await new Promise(y => window.setTimeout(y, 2e3));
      }

      removeLink();
    }

    /** URLs after first URL should be replaced by the last URL */
    await waitForEvent('popstate', () => {
      window.history.back();
    });

    assert.strictEqual(new URL(window.location.href).pathname, newUrls[0]);
  });

});
