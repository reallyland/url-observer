import { pushStateEventKey } from '../constants.js';
import type { RouteEvent, URLChangedStatus } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('usages-click', () => {
  /** Always load the page to reset URL history */
  beforeEach(async () => {
    await browser.url(HOST);
  });

  afterEach(async () => {
    await browser.executeAsync(async (done) => {
      const obsList: URLObserver[] = window.observerList;

      for (const obs of obsList) obs.disconnect();

      /** Reset .UsagesClick if exists */
      if ((window as any).UsagesClick) {
        (window as any).UsagesClick = undefined;
      }

      done();
    });
  });

  context('does not intercept click when ', () => {
    it(`'<click>.defaultPrevented=true'`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      type C = [string, B, B];

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

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });

        const { link, removeLink } = appendLink(a);
        const result: B = [];

        link.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();
          result.push(null);
        });

        if (
          await waitForEvent<CustomEvent<RouteEvent>>(b, () => {
            link.click();
          })
        ) result.push('click');

        removeLink();

        done([
          $w.location.pathname,
          result,
          observer.takeRecords().map(n => n.entryType),
        ]);
      }, newUrl, pushStateEventKey);

      expect(expected).toStrictEqual<C>(['/test.html', [null], ['init']]);
    });

    it(`'<click>.metaKey=true'`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
        metaKey: boolean;
      }
      type D = [string, C, B];

      const newUrl = '/test/123';
      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a);

        ($w as any).UsagesClick = { observer, button: -1, metaKey: false };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev?.button;
          ($w as any).UsagesClick.metaKey = ev.metaKey;
          removeLink();
        });

        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await Promise.all([
        browser.keys(['Meta']),
        (await $(`[href="${newUrl}"]`)).click({ button: 'left' }),
      ]);

      await browser.keys(['Meta']);

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;

        const result: D = [
          $w.location.pathname,
          {
            button: ($w as any).UsagesClick.button,
            metaKey: ($w as any).UsagesClick.metaKey,
          },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0, metaKey: true }, ['init']]);
    });

    it(`'<click>.ctrlKey=true'`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
        ctrlKey: boolean;
      }
      type D = [string, C, B];

      const newUrl = '/test/123';
      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a);

        ($w as any).UsagesClick = { observer, button: -1, ctrlKey: false };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev.button;
          ($w as any).UsagesClick.ctrlKey = ev.ctrlKey;
          removeLink();
        });
        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await Promise.all([
        browser.keys(['Control']),
        (await $(`a[href="${newUrl}"]`)).click({ button: 'left' }),
      ]);

      await browser.keys(['Control']);

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;

        const result: D = [
          $w.location.pathname,
          {
            button: ($w as any).UsagesClick.button,
            ctrlKey: ($w as any).UsagesClick.ctrlKey,
          },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0, ctrlKey: true }, ['init']]);
    });

    it(`'<click>.shiftKey=true'`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
        shiftKey: boolean;
      }
      type D = [string, C, B];

      const newUrl = '/test/123';
      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a);

        ($w as any).UsagesClick = { observer, button: -1, shiftKey: false };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev.button;
          ($w as any).UsagesClick.shiftKey = ev.shiftKey;
          removeLink();
        });
        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await Promise.all([
        browser.keys(['Shift']),
        (await $(`[href="${newUrl}"]`)).click({ button: 'left' }),
      ]);

      await browser.keys(['Shift']);

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;

        const result: D = [
          $w.location.pathname,
          {
            button: ($w as any).UsagesClick.button,
            shiftKey: ($w as any).UsagesClick.shiftKey,
          },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0, shiftKey: true }, ['init']]);
    });

    it(`<click>.target is not an anchor element`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
      }
      type D = [string, C, B];

      const newElement = 'button';
      const newUrl = '/test/123';
      await browser.executeAsync(async (
        a: string,
        b: string,
        c: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendElement, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeElement } = appendElement<HTMLButtonElement>(a, { id: b, textContent: b });

        ($w as any).UsagesClick = { observer, button: -1 };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ($w as any).UsagesClick.button = ev.button;
          removeElement();
        });
        $w.addEventListener(c, () => {
          ($w as any).UsagesClick.button = -2;
          removeElement();
        });

        done();
      }, newElement, newUrl, pushStateEventKey);

      await (await $(`button[id="${newUrl}"]`)).click({ button: 'left' });

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;

        const result: D = [
          $w.location.pathname,
          { button: ($w as any).UsagesClick.button },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0 }, ['init']]);
    });

    it(`<click>.<#shadowTarget> is not an anchor element`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
      }
      type D = [string, C, B];

      const newElement = 'button';
      const newUrl = '/test/123';
      const componentName: string = await browser.executeAsync(async (
        a: string,
        b: string,
        c: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendShadowElement, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const {
          component,
          removeElement,
        } = appendShadowElement<HTMLButtonElement>(a, { id: b, '.textContent': b });

        ($w as any).UsagesClick = { observer, button: -1 };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ($w as any).UsagesClick.button = ev.button;
          removeElement();
        });
        $w.addEventListener(c, () => {
          ($w as any).UsagesClick.button = -2;
          removeElement();
        });

        done(component.localName);
      }, newElement, newUrl, pushStateEventKey);

      await (
        await (await $(componentName)).shadow$(`button[id="${newUrl}"]`)
      ).click({ button: 'left' });

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;
        const result: D = [
          $w.location.pathname,
          { button: ($w as any).UsagesClick.button },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0 }, ['init']]);
    });

    it(`<click>.target is a download link`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
      }
      type D = [string, C, B];

      const newUrl = '/test/123';

      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a, { download: '' });

        ($w as any).UsagesClick = { observer, button: -1 };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev.button;
          removeLink();
        });
        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await (await $(`a[href="${newUrl}"]`)).click({ button: 'left' });

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;
        const result: D = [
          $w.location.pathname,
          { button: ($w as any).UsagesClick.button },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0 }, ['init']]);
    });

    it(`<click>.target opens link in a new window or tab`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
      }
      type D = [string, C, B];

      const newUrl = '/test/123';
      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a, { target: '_blank' });

        ($w as any).UsagesClick = { observer, button: -1 };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev.button;
          removeLink();
        });
        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await (await $(`a[href="${newUrl}"]`)).click({ button: 'left' });

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;

        const result: D = [
          $w.location.pathname,
          { button: ($w as any).UsagesClick.button },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0 }, ['init']]);
    });

    it(`<click>.target is inside an iframe`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      type C = [string[], number[], B];

      const newUrl = '/test/123';
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

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });

        ($w as any).UsagesClick = { observer, button: [], pathname: [] };

        for (const linkTarget of ['_parent', '_top']) {
          const frame = document.createElement('iframe');
          const link = document.createElement('a');

          link.href = link.textContent = a;
          link.setAttribute('target', linkTarget);

          document.body.appendChild(frame);
          frame.contentDocument?.body.appendChild(link);

          const linkClicked = new Promise((y) => {
            frame.contentWindow?.addEventListener('click', (ev: MouseEvent) => {
              ev.preventDefault();

              ($w as any).UsagesClick.button.push(ev.button);
              document.body.removeChild(frame);
              y();
            });

            $w.addEventListener(b, () => {
              ($w as any).UsagesClick.button.push(-2);
              document.body.removeChild(frame);
              y();
            });
          });

          link.click();
          await linkClicked;

          ($w as any).UsagesClick.pathname.push($w.location.pathname);
        }

        const result: C = [
          ($w as any).UsagesClick.pathname,
          ($w as any).UsagesClick.button,
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      }, newUrl, pushStateEventKey);

      expect(expected).toStrictEqual<C>([
        ['/test.html', '/test.html'],
        [0, 0],
        ['init'],
      ]);
    });

    it(`<click>.target opens cross-origin link`, async () => {
      type A = Record<'test' | 'section', RegExp>;
      type B = (null | URLChangedStatus)[];
      interface C {
        button: number;
      }
      type D = [string, C, B];

      const newUrl = 'https://example.com/test/123';

      await browser.executeAsync(async (
        a: string,
        b: string,
        done
      ) => {
        const $w = window as unknown as Window;
        const { appendLink, initObserver } = $w.TestHelpers;
        const routes: A = {
          test: /^\/test$/i,
          section: /^\/test\/(?<test>[^\/]+)$/i,
        };

        const observer = initObserver({
          routes: Object.values(routes),
          observerOption: { debug: true },
        });
        const { removeLink } = appendLink(a);

        ($w as any).UsagesClick = { observer, button: -1 };

        $w.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();

          ($w as any).UsagesClick.button = ev.button;
          removeLink();
        });
        $w.addEventListener(b, () => {
          ($w as any).UsagesClick.button = -2;
          removeLink();
        });

        done();
      }, newUrl, pushStateEventKey);

      await (await $(`a[href="${newUrl}"]`)).click({ button: 'left' });

      const expected: D = await browser.executeAsync(async (done) => {
        const $w = window as unknown as Window;
        const result: D = [
          $w.location.pathname,
          { button: ($w as any).UsagesClick.button },
          (($w as any).UsagesClick.observer as URLObserver).takeRecords().map(n => n.entryType),
        ];

        done(result);
      });

      expect(expected).toStrictEqual<D>(['/test.html', { button: 0 }, ['init']]);
    });

  });

  it(`does not update URL when new URL is the same as the existing one`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];

    const newUrl = '/test/123';
    const expected: B = await browser.executeAsync(async(
      a: string,
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

      await waitForEvent('click', async () => {
        await observer.updateHistory(a);
        link.click();
      });

      removeLink();

      done(observer.takeRecords().map(n => n.entryType));
    }, newUrl);

    expect(expected).toEqual<B>(['init', 'manual']);
  });

  it(`updates URL with default before route handler`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = Record<string, string>;
    type C = [string, B];
    type D = [B[], URLChangedStatus[]];

    const anchorOptions: C[] = [
      ['/test/123', { '.scope': '' }],
      ['/test/456', { scope: '' }],
      ['/test/789', { '.scope': 'test' }],
      ['/test/abc', { scope: 'test' }],
    ];
    const expected: D = await browser.executeAsync(async(
      a: C[],
      done
    ) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver, waitForEvent } = $w.TestHelpers;
      const routes: A = {
        test: /^\/test$/i,
        section: /^\/test\/(?<test>[^\/]+)$/i,
      };

      const observer = initObserver({ routes: Object.values(routes) });
      const result: B[] = [];

      for (const [na, nb] of a) {
        const { link, removeLink } = appendLink(na, nb);

        observer.add({
          pathRegExp: routes.section,
          handleEvent: () => {
            result.push(nb);
            return true;
          },
          scope: nb[Object.keys(nb)[0]],
        });

        await waitForEvent('click', () => {
          link.click();
        });

        removeLink();
      }

      done([
        result,
        observer.takeRecords().map(n => n.entryType),
      ]);
    }, anchorOptions);

    expect(expected).toEqual<D>([
      anchorOptions.map(([, n]) => n),
      ['init', 'click', 'click', 'click', 'click'],
    ]);
  });

  it(`updates URL with no before route handler`, async () => {
    type A = Record<'test' | 'section', RegExp>;
    type B = URLChangedStatus[];

    const newUrl = '/test/123';
    const expected: B = await browser.executeAsync(async(
      a: string,
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

      await waitForEvent('click', () => {
        link.click();
      });

      removeLink();

      done(observer.takeRecords().map(n => n.entryType));
    }, newUrl);

    expect(expected).toEqual<B>(['init', 'click']);
  });

});
