import { assert } from '@esm-bundle/chai';

import { linkScopeKey, pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserverEntry } from '../url-observer-entry.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendElement } from './utils/append-element.js';
import { appendLink } from './utils/append-link.js';
import { appendShadowElement } from './utils/append-shadow-element.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { waitForEvent } from './utils/wait-for-event.js';
import { pageClick } from './wtr-helpers/page-click.js';

describe('usages-click', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`does not intercept click when <click>.defaultPrevented=true`, async () => {
    const newUrl = '/test/123';

    const { link, removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });
    const result: (URLChangedStatus | null)[] = [];

    link.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();
      result.push(null);
    });

    if (await waitForEvent(pushStateEventKey, async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    })) {
      result.push('click');
    }

    removeLink();

    assert.strictEqual(window.location.pathname, '/');
    assert.deepStrictEqual(result, [null]);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  // skip firefox, microsoftedge, safari
  it(`does not intercept click when <click>.metaKey=true`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;
    let metaKey = false;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      metaKey = ev.metaKey;
      removeLink();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeLink();
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
      modifiers: ['Meta'],
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.strictEqual(metaKey, true);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  // skip firefox, microsoftedge, safari
  it(`does not intercept click when <click>.ctrlKey=true`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;
    let ctrlKey = false;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      ctrlKey = ev.ctrlKey;
      removeLink();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeLink();
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
      modifiers: ['Control'],
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.strictEqual(ctrlKey, true);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  // skip firefox, microsoftedge, safari
  it(`does not intercept click when <click>.shiftKey=true`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;
    let shiftKey = false;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      shiftKey = ev.shiftKey;
      removeLink();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeLink();
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
      modifiers: ['Shift'],
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.strictEqual(shiftKey, true);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`does not intercept click when <click>.target is not an anchor element`, async () => {
    const newElement = 'button';
    const newUrl = '/test/123';

    const { removeElement } = appendElement(newElement, {
      id: newUrl,
      '.textContent': newUrl,
    });
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      removeElement();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeElement();
    });

    await pageClick(`button[id="${newUrl}"]`, {
      button: 'left',
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  // skip microsoftedge
  it(`does not intercept click when <click>.<#shadowTarget> is not an anchor element`, async () => {
    const newElement = 'button';
    const newUrl = '/test/123';

    const { component, removeElement } = appendShadowElement(newElement, {
      id: newUrl,
      '.textContent': newUrl,
    });
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      removeElement();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeElement();
    });

    await pageClick(`${component.localName} button[id="${newUrl}"]`, {
      button: 'left',
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`does not intercept click when <click>.target is a download link`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl, {
      download: '',
    });
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      removeLink();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeLink();
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(
    `does not intercept click when <click>.target opens link in a new window or tab`,
    async () => {
      const newUrl = '/test/123';

      const { removeLink } = appendLink(newUrl, {
        target: '_blank',
      });
      const observer = init({
        routes: Object.values(routes),
      });
      let eventButton = -1;

      window.addEventListener('click', (ev: MouseEvent) => {
        ev.preventDefault();

        eventButton = ev.button;
        removeLink();
      });

      window.addEventListener(pushStateEventKey, () => {
        eventButton = -2;
        removeLink();
      });

      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });

      assert.strictEqual(window.location.pathname, '/');
      assert.strictEqual(eventButton, 0);
      assert.deepStrictEqual<URLChangedStatus[]>(
        observer.takeRecords().map(n => n.entryType),
        ['init']
      );
    }
  );

  it.skip(`does not intercept click when <click>.target is in a iframe`, async () => {
    interface A {
      changes: string[];
      records: URLObserverEntry[];
    }

    const result: string[] = [];
    const frame = document.createElement('iframe');

    frame.name = frame.title = 'test';
    frame.src = '/src/tests/iframe.html';

    const removeFrame = () => {
      if (frame.parentElement) {
        document.body.removeChild(frame);
      }
    };
    function setupMessageListener<T extends unknown = string>(
      y: (value: T) => void,
      isJson?: boolean
    ): void {
      function onMessage(ev: MessageEvent) {
        y(
          (isJson ?? false) ? JSON.parse(ev.data) : ev.data
        );

        window.removeEventListener('message', onMessage);
      }

      window.addEventListener('message', onMessage);
    }
    const frameReadyTask = new Promise<string>(resolve => setupMessageListener(resolve));

    document.body.appendChild(frame);

    const readyMessage = await frameReadyTask;
    const observeReadyMessage = await new Promise((resolve) => {
      setupMessageListener(resolve);
      frame.contentWindow?.postMessage('observe', '*');
    });

    const linkTargets = ['_parent', '_top'];
    for (const linkTarget of linkTargets) {
      const msg = await new Promise<string>((resolve) => {
        setupMessageListener(resolve);
        frame.contentWindow?.postMessage(`click:${linkTarget}`, '*');
      });

      result.push(msg);
    }

    const {
      changes,
      records,
    } = await new Promise<A>((resolve) => {
      setupMessageListener<A>(resolve, true);
      frame.contentWindow?.postMessage('changes', '*');
    });

    assert.strictEqual(readyMessage, 'ready');
    assert.strictEqual(observeReadyMessage, 'observe:ready');
    assert.deepStrictEqual(
      result,
      [
        'click:_parent:ready',
        'click:_top:ready',
      ]
    );
    assert.deepStrictEqual(
      changes,
      [
        'window:click',
        'window:click',
      ]
    );
    assert.deepStrictEqual(
      records.map(n => n.entryType),
      [
        'init',
      ]
    );

    removeFrame();
  });

  it(`does not intercept click when <click>.target is a cross-origin link`, async () => {
    const newUrl = 'https://example.com/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });
    let eventButton = -1;

    window.addEventListener('click', (ev: MouseEvent) => {
      ev.preventDefault();

      eventButton = ev.button;
      removeLink();
    });

    window.addEventListener(pushStateEventKey, () => {
      eventButton = -2;
      removeLink();
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
    });

    assert.strictEqual(window.location.pathname, '/');
    assert.strictEqual(eventButton, 0);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`does not update URL when new URL is the same as current URL`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });

    await waitForEvent('click', async () => {
      await observer.updateHistory(newUrl);
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.strictEqual(window.location.pathname, newUrl);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'manual']
    );
  });

  it(`does not update URL when new URL has different origin`, async () => {
    const newUrl = 'https://example.com';

    const { removeLink } = appendLink(newUrl);
    const observer = init({
      routes: Object.values(routes),
    });

    const linkClicked = new Promise<void>((resolve) => {
      window.addEventListener('click', function onClick(ev: MouseEvent) {
        ev.preventDefault();
        removeLink();
        window.removeEventListener('click', onClick);
        resolve();
      });
    });

    await pageClick(`a[href="${newUrl}"]`, {
      button: 'left',
    });

    await linkClicked;

    assert.notStrictEqual(window.location.origin, newUrl);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`does not update URL when before route handler returns false`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl, { [linkScopeKey]: '' });
    const observer = init({
      routes: Object.values(routes),
    });
    let result = '';

    observer.add({
      pathRegExp: routes.section,
      handleEvent() {
        result = newUrl;
        return false;
      },
      scope: '',
    });

    await waitForEvent('click', async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.strictEqual(window.location.pathname, '/');
    assert.deepStrictEqual(result, newUrl);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
  });

  it(`updates URL with before route handler`, async () => {
    const anchorOptions: [string, Record<string, string>][] = [
      ['/test/123', { [`.${linkScopeKey}`]: '' }],
      ['/test/456', { [linkScopeKey]: '' }],
      ['/test/789', { [`.${linkScopeKey}`]: 'test' }],
      ['/test/abc', { [linkScopeKey]: 'test' }],
    ];

    const observer = init({
      routes: Object.values(routes),
      observerOption: { dwellTime: -1 },
    });

    const result: Record<string, string>[] = [];
    for (const [newUrl, newUrlMatch] of anchorOptions) {
      const { removeLink } = appendLink(newUrl, newUrlMatch);

      observer.add({
        pathRegExp: routes.section,
        handleEvent() {
          result.push(newUrlMatch);
          return true;
        },
        scope: newUrlMatch?.[linkScopeKey] ?? newUrlMatch?.[`.${linkScopeKey}`],
      });

      await waitForEvent('click', async () => {
        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
    }

    assert.strictEqual(window.location.pathname, anchorOptions[anchorOptions.length - 1][0]);
    assert.deepStrictEqual(result, anchorOptions.map(([, n]) => n));
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click', 'click', 'click', 'click']
    );
  });

  it(`updates URL with before route handler`, async () => {
    const newUrl = '/test/123';

    const observer = init({
      routes: Object.values(routes),
    });

    const { removeLink } = appendLink(newUrl);

    await waitForEvent('click', async () => {
      await pageClick(`a[href="${newUrl}"]`, {
        button: 'left',
      });
    });

    removeLink();

    assert.strictEqual(window.location.pathname, newUrl);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'click']
    );
  });

  it(`updates URL based on document.baseURI or base[href]`, async () => {
    const newBaseURIs: [string, string][] = [
      ['base:', '/test/123'],
      ['base:https://example.com', 'test/456'],
      ['', '/test/789'], /** document.baseURI=null, IE11 only */
      ['https://example.com', '/test/0ab'], /** Manually override document.baseURI */
    ];
    const originalUrl = window.location.href;
    const originalOrigin = new URL(originalUrl).origin;

    let cleanup;

    const observer = init({
      routes: Object.values(routes),
      observerOption: {
        dwellTime: -1, /** This test requires all link clicks */
      },
    });

    const baseURIs: (null | string)[] = [];
    const clicked: boolean[] = [];
    for (const [newBaseURI, newUrl] of newBaseURIs) {
      if (/^base:/i.test(newBaseURI)) {
        if (/^base:.+/i.test(newBaseURI)) {
          const baseEl = document.createElement('base');

          baseEl.href = newBaseURI.replace('base:', '');

          document.head.appendChild(baseEl);

          cleanup = () => {
            if (baseEl.parentElement) document.head.removeChild(baseEl);
          };
        }

        baseURIs.push(document.baseURI);
      } else {
        Object.defineProperty(document, 'baseURI', {
          configurable: true,
          value: newBaseURI || null,
        });

        cleanup = () => {
          Object.defineProperty(document, 'baseURI', {
            configurable: true,
            value: originalUrl,
          });
        };

        baseURIs.push(newBaseURI || null);
      }

      const { removeLink } = appendLink(newUrl);
      const linkClicked = await new Promise<boolean>(async (resolve) => {
        let clickTimer = -1;

        const onPreventClick = (ev: MouseEvent) => {
          window.clearTimeout(clickTimer);
          ev.preventDefault();
          window.removeEventListener('click', onPreventClick);
          resolve(true);
        };

        window.addEventListener('click', onPreventClick);

        clickTimer = window.setTimeout(() => {
          window.removeEventListener('click', onPreventClick);
          resolve(false);
        }, 2e3);

        await pageClick(`a[href="${newUrl}"]`, {
          button: 'left',
        });
      });

      removeLink();
      cleanup?.();

      clicked.push(linkClicked);
    }

    assert.deepStrictEqual(clicked, Array.from(Array(newBaseURIs.length), () => true));
    assert.deepStrictEqual(
      baseURIs,
      [
        originalUrl,
        'https://example.com/',
        null,
        'https://example.com',
      ]
    );
    assert.deepStrictEqual(
      observer.takeRecords().filter(n => n.entryType !== 'init').map((n) => {
        const url = new URL(n.url);

        return `${url.origin}${url.pathname}${url.search}`;
      }),
      [
        `${originalOrigin}/test/123`,
        `${originalOrigin}/test/789`,
        `${originalOrigin}/test/0ab`,
      ]
    );
  });

});

// FIXME: Refactor click tests on click after wait for click event at window
