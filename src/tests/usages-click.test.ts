import { assert } from '@esm-bundle/chai';

import { pushStateEventKey } from '../constants.js';
import type { URLChangedStatus } from '../custom_typings.js';
import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { appendElement } from './helpers/append-element.js';
import { appendLink } from './helpers/append-link.js';
import { appendShadowElement } from './helpers/append-shadow-element.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { waitForEvent } from './helpers/wait-for-event.js';
import { frameClick } from './wtr-helpers/frame-click.js';
import { frameSetContent } from './wtr-helpers/frame-set-content.js';
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

  it(`does not intercept click when <click>.target is inside an iframe`, async () => {
    const observer = init({
      routes: Object.values(routes),
    });

    const result: string[] = [];
    const eventButtons: boolean[] = [];

    const frameName = 'test';
    const frame = document.createElement('iframe');
    // const removeFrame = () => {
    //   if (frame.parentElement) document.body.removeChild(frame);
    // };

    frame.src = 'about:blank';
    frame.name = frame.title = frameName;

    const frameAttached = new Promise(y => frame.onload = y);

    document.body.appendChild(frame);

    await frameAttached;
    // await new Promise(y => window.setTimeout(y, 5e3));

    for (const linkTarget of ['_parent', '_top']) {
      const newUrl = `/test/123?${linkTarget}`;

      await frameSetContent([
        `<a href="${newUrl}" target="${linkTarget}">${newUrl}</a>`,
        `<script>
          if (!window.interceptClick) {
            const a = document.body.querySelector('a[href="${newUrl}"]');

            window.addEventListener('click', (ev) => {
              ev.preventDefault();
              a.textContent += ' clicked';
            });
          }
        </script>`,
      ].join(''), {
        name: frameName,
      });

      await frameClick(`a[href="${newUrl}"]`, {
        button: 'left',
        name: frameName,
      });

      eventButtons.push(
        Boolean(
          frame
            .contentDocument
            ?.querySelector(`a[href="${newUrl}"]`)
            ?.textContent?.endsWith('clicked')
        )
      );

      // removeFrame();

      result.push(window.location.pathname);
    }

    assert.deepStrictEqual(result, ['/', '/']);
    assert.deepStrictEqual(eventButtons, [true, true]);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init']
    );
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
      await pageClick(`a[href="${newUrl}]`, {
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

  it(`does not update URL when before route handler returns false`, async () => {
    const newUrl = '/test/123';

    const { removeLink } = appendLink(newUrl, { scope: '' });
    const observer = init({
      routes: Object.values(routes),
    });
    let result: string = '';

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
      ['/test/123', { '.scope': '' }],
      ['/test/456', { scope: '' }],
      ['/test/789', { '.scope': 'test' }],
      ['/test/abc', { scope: 'test' }],
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
        scope: newUrlMatch?.scope ?? newUrlMatch?.['.scope'],
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

});
