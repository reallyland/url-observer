import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendLink } from './utils/append-link.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { waitForEvent } from './utils/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('usages-route-handler', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`runs before route handler on manual history update`, async () => {
    type A = [string, string][];

    const newUrlOptions: A = [
      ['/test/123', ':default'],
      ['/test/456', ':test-1'],
    ];

    const observer = init({
      routes: Object.values(routes),
    });

    const result: A = [];

    for (const [newUrl, newUrlScope] of newUrlOptions) {
      observer.add({
        pathRegExp: routes.section,
        handleEvent() {
          result.push([newUrl, newUrlScope]);
          return true;
        },
        scope: newUrlScope,
      });

      await waitForEvent(pushStateEventKey, async () => {
        await observer.updateHistory(newUrl, newUrlScope);
      });
    }

    assert.deepStrictEqual(result, newUrlOptions);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      [
        'init',
        ...Array.from<unknown, URLChangedStatus>(Array(newUrlOptions.length), () => 'manual'),
      ]
    );
  });

  it(`runs before route handler on link click`, async () => {
    type A = [string, Record<string, string>][];

    const newUrlOptions: A = [
      ['/test/123', { scope: ':default' }],
      ['/test/123a', { scope: '' }],
      ['/test/456', { ['.scope']: ':default' }],
      ['/test/456a', { ['.scope']: '' }],
      ['/test/789', { scope: 'test-1' }],
      ['/test/789a', { ['.scope']: 'test-1' }],
    ];

    const observer = init({
      routes: Object.values(routes),
    });

    const result: A = [];
    for (const [newUrl, newUrlScope] of newUrlOptions) {
      const { removeLink } = appendLink(newUrl, newUrlScope);

      observer.add({
        pathRegExp: routes.section,
        handleEvent() {
          result.push([newUrl, newUrlScope]);
          return true;
        },
        scope: newUrlScope?.scope ?? newUrlScope?.['.scope'],
      });

      await waitForEvent(pushStateEventKey, async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
    }

    assert.deepStrictEqual(result, newUrlOptions);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      [
        'init',
        ...Array.from<unknown, URLChangedStatus>(Array(newUrlOptions.length), () => 'click'),
      ]
    );
  });

  it(
    `does not run before route handler when updating history manually without defined scope`,
    async () => {
      type A = [string, string | undefined][];

      const newUrlOptions: A = [
        ['/test/123', ''],
        ['/test/456', undefined],
      ];

      const observer = init({
        routes: Object.values(routes),
      });

      const result: A = [];
      for (const [newUrl, newUrlScope] of newUrlOptions) {
        observer.add({
          pathRegExp: routes.section,
          handleEvent() {
            result.push([newUrl, newUrlScope]);
            return true;
          },
          scope: newUrlScope,
        });

        await waitForEvent(pushStateEventKey, async () => {
          await observer.updateHistory(newUrl, newUrlScope);
        });
      }

      assert.deepStrictEqual(result, []);
      assert.deepStrictEqual<URLChangedStatus[]>(
        observer.takeRecords().map(n => n.entryType),
        [
          'init',
          ...Array.from<unknown, URLChangedStatus>(Array(newUrlOptions.length), () => 'manual'),
        ]
      );
    }
  );

  it(
    `does not run before route handler when clicking on link without defined scope`,
    async () => {
      type A = [string, string][];

      const newUrlOptions: A = [
        ['/test/123', ''],
        ['/test/456', ':default'],
        ['/test/789', 'test-1'],
      ];

      const observer = init({
        routes: Object.values(routes),
      });

      const result: A = [];
      for (const [newUrl, newUrlScope] of newUrlOptions) {
        const { removeLink } = appendLink(newUrl);

        observer.add({
          pathRegExp: routes.section,
          handleEvent() {
            result.push([newUrl, newUrlScope]);
            return true;
          },
          scope: newUrlScope,
        });

        await waitForEvent(pushStateEventKey, async () => {
          await pageClick(`a[href="${newUrl}"]`, {
            button: 'left',
          });
        });

        removeLink();
      }

      assert.deepStrictEqual(result, []);
      assert.deepStrictEqual<URLChangedStatus[]>(
        observer.takeRecords().map(n => n.entryType),
        [
          'init',
          ...Array.from<unknown, URLChangedStatus>(Array(newUrlOptions.length), () => 'click'),
        ]
      );
    }
  );

  it(
    `does not run update history when before route handler return false after clicking a link`,
    async () => {
      type A = [string, Record<string, string>];

      const newUrlOptions: A[] = [
        ['/test/123', { scope: ':default' }],
        ['/test/123a', { scope: '' }],
        ['/test/456', { ['.scope']: ':default' }],
        ['/test/456a', { ['.scope']: '' }],
        ['/test/789', { scope: 'test-1' }],
        ['/test/789a', { ['.scope']: 'test-1' }],
      ];

      const observer = init({
        routes: Object.values(routes),
      });

      const result: A[] = [];
      for (const [newUrl, newUrlScope] of newUrlOptions) {
        const { removeLink } = appendLink(newUrl, newUrlScope);

        let temp: A = ['', {}];

        observer.add({
          pathRegExp: routes.section,
          handleEvent() {
            temp = [newUrl, newUrlScope];

            return false;
          },
          scope: newUrlScope.scope ?? newUrlScope?.['.scope'],
        });

        const ev = await waitForEvent(pushStateEventKey, async () => {
          await pageClick(`a[href="${newUrl}"]`, {
            button: 'left',
          });
        });

        removeLink();

        if (ev) result.push(temp);
      }

      assert.deepStrictEqual(result, []);
      assert.deepStrictEqual<URLChangedStatus[]>(
        observer.takeRecords().map(n => n.entryType),
        ['init']
      );
    }
  );

  it(
    `does not update history when before route handler returns false on manual history update`,
    async () => {
      type A = [string, string];

      const newUrlOptions: A[] = [
        ['/test/123', ':default'],
        ['/test/456', 'test-1'],
      ];

      const observer = init({
        routes: Object.values(routes),
      });

      const historyRecords: string[] = [];
      const result: A[] = [];
      for (const [newUrl, newUrlScope] of newUrlOptions) {
        let temp: A = ['', ''];

        observer.add({
          pathRegExp: routes.section,
          handleEvent() {
            temp = [newUrl, newUrlScope];

            return false;
          },
          scope: newUrlScope,
        });

        const ev = await waitForEvent(pushStateEventKey, async () => {
          await observer.updateHistory(newUrl, newUrlScope);
        });

        if (ev) result.push(temp);

        historyRecords.push(window.location.pathname);
      }

      assert.deepStrictEqual(result, []);
      assert.deepStrictEqual(
        historyRecords,
        Array.from<unknown, string>(Array(newUrlOptions.length), () => '/')
      );
      assert.deepStrictEqual<URLChangedStatus[]>(
        observer.takeRecords().map(n => n.entryType),
        ['init']
      );
    }
  );

  it(`does not run before route handler for non-existent route`, async () => {
    type A = (keyof typeof routes)[];

    const newUrls: [string, string][] = [
      ['/test2', ''],
      ['/test2', ':test'],
    ];

    const result: A[] = [];
    const clicked: boolean[] = [];

    for (const [newUrl, newScope] of newUrls) {
      const observer = init({
        routes: Object.values(routes),
      });

      const temp: A = [];

      observer.add({
        pathRegExp: routes.test,
        handleEvent() {
          temp.push('test');
          return true;
        },
        scope: newScope || undefined,
      });
      observer.add({
        pathRegExp: routes.section,
        handleEvent() {
          temp.push('section');
          return true;
        },
        scope: newScope || undefined,
      });

      const didClick = Boolean(
        await waitForEvent(pushStateEventKey, async () => {
          await observer.updateHistory(newUrl, newScope || undefined);
        })
      );

      if (temp.length) result.push(temp);

      clicked.push(didClick);
    }

    assert.deepStrictEqual(clicked, [true, true]);
    assert.deepStrictEqual(result, []);
  });

});
