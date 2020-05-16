import { popStateEventKey, pushStateEventKey } from '../constants.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

describe('methods-disconnect', () => {
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

  it(`disconnects`, async () => {
    type A = 'click' | 'hashchange' | 'popstate';
    type B = Record<A, (null | A)[]>;
    type C = [B, number[]];

    const expected: C = await browser.executeAsync(async (
      a: typeof pushStateEventKey,
      b: typeof popStateEventKey,
      done
    ) => {
      const $w = window as unknown as Window;
      const listeners: B = {
        click: [],
        hashchange: [],
        popstate: [],
      };
      const historyRecords: number[] = [];
      const triggerEvents = async (eventName: A, disconnected: boolean = false) => {
        return new Promise((y) => {
          switch (eventName) {
            case 'click': {
              let clickTimer = -1;

              const link = document.createElement('a');
              const linkPath = `/test-${new Date().toJSON()}`;
              const onClick = () => {
                $w.clearTimeout(clickTimer);
                listeners.click.push('click');
                $w.removeEventListener(a, onClick);
                document.body.removeChild(link);
                y();
              };

              link.href = link.textContent = linkPath;

              if (disconnected) {
                link.onclick = (ev: MouseEvent) => {
                  if (ev.defaultPrevented) return;
                  ev.preventDefault();
                };
              }

              document.body.appendChild(link);
              $w.addEventListener(a, onClick);

              clickTimer = $w.setTimeout(() => {
                listeners.click.push(null);
                document.body.removeChild(link);
                $w.removeEventListener(a, onClick);
                y();
              }, 2e3);
              link.click();

              break;
            }
            case 'hashchange': {
              let hashchangeTimer = -1;

              const hashPath = `#test-${new Date().toJSON()}`;
              const onHashchange = () => {
                $w.clearTimeout(hashchangeTimer);
                listeners.hashchange.push('hashchange');
                $w.removeEventListener(a, onHashchange);
                y();
              };

              $w.addEventListener(a, onHashchange);

              hashchangeTimer = $w.setTimeout(() => {
                listeners.hashchange.push(null);
                $w.removeEventListener(a, onHashchange);
                y();
              }, 2e3);

              $w.location.hash = hashPath;

              break;
            }
            case 'popstate': {
              let popstateTimer = -1;

              const urlPath = `/test-${new Date().toJSON()}`;
              const onPopstate = () => {
                $w.clearTimeout(popstateTimer);
                listeners.popstate.push('popstate');
                $w.removeEventListener(b, onPopstate);
                y();
              };

              $w.addEventListener(b, onPopstate);

              popstateTimer = $w.setTimeout(() => {
                listeners.popstate.push(null);
                $w.removeEventListener(b, onPopstate);
                y();
              }, 2e3);

              $w.history.pushState({}, '', urlPath);
              $w.history.back();

              break;
            }
            default:
          }
        });
      };

      // const events: A[] = ['hashchange', 'click'];
      const events: A[] = ['click', 'hashchange', 'popstate'];

      for (const n of events) {
        const observer = new $w.URLObserver();

        $w.observerList.push(observer);

        observer.observe([/^\/test/i], { debug: true });
        await triggerEvents(n);

        observer.disconnect();
        await triggerEvents(n, true);

        historyRecords.push(observer.takeRecords.length);
      }

      done([listeners, historyRecords]);
    }, pushStateEventKey, popStateEventKey);

    expect(expected).toEqual<C>([
      {
        click: ['click', null],
        hashchange: ['hashchange', null],
        popstate: ['popstate', null],
      },
      [0, 0, 0],
    ]);
  });

});
