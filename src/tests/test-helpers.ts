import { popStateEventKey, pushStateEventKey } from '../constants.js';
import type { URLObserverCallbacks, URLObserverProperties } from '../custom_typings.js';

export type TriggerEventsEventName = 'click' | 'hashchange' | 'popstate';
export type TriggerEventsResult = Record<TriggerEventsEventName, (null | TriggerEventsEventName)[]>;

export interface AppendLinkResult {
  link: HTMLAnchorElement;
  removeLink(): void;
}
export interface InitObserverOption {
  routes: RegExp[];
  observerOption: Partial<URLObserverProperties>;
  callback: URLObserverCallbacks['callback'];
}

const $w = window as unknown as Window;

export class TestHelpers {
  appendLink(path: string): AppendLinkResult {
    const link = document.createElement('a');

    link.href = link.textContent = path;

    document.body.appendChild(link);

    return {
      link,
      removeLink() {
        document.body.removeChild(link);
      },
    };
  }

  initObserver(option?: Partial<InitObserverOption>) {
    const {
      routes,
      callback,
      observerOption,
    } = option ?? {};

    const observer = new $w.URLObserver(callback);

    $w.observerList.push(observer);

    if (routes) {
      observer.observe(routes, observerOption);
    }

    return observer;
  }

  async triggerEvents(
    eventName: TriggerEventsEventName,
    disconnected: boolean = false
  ): Promise<TriggerEventsResult> {
    const listeners: TriggerEventsResult = {
      click: [],
      hashchange: [],
      popstate: [],
    };

    return new Promise((y) => {
      switch (eventName) {
        case 'click': {
          let clickTimer = -1;

          const link = document.createElement('a');
          const linkPath = `/test-${new Date().toJSON()}`;
          const onClick = () => {
            $w.clearTimeout(clickTimer);
            listeners.click.push('click');
            $w.removeEventListener(pushStateEventKey, onClick);
            document.body.removeChild(link);
            y(listeners);
          };

          link.href = link.textContent = linkPath;

          if (disconnected) {
            link.onclick = (ev: MouseEvent) => {
              if (ev.defaultPrevented) return;
              ev.preventDefault();
            };
          }

          document.body.appendChild(link);
          $w.addEventListener(pushStateEventKey, onClick);

          clickTimer = $w.setTimeout(() => {
            listeners.click.push(null);
            document.body.removeChild(link);
            $w.removeEventListener(pushStateEventKey, onClick);
            y(listeners);
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
            $w.removeEventListener(pushStateEventKey, onHashchange);
            y(listeners);
          };

          $w.addEventListener(pushStateEventKey, onHashchange);

          hashchangeTimer = $w.setTimeout(() => {
            listeners.hashchange.push(null);
            $w.removeEventListener(pushStateEventKey, onHashchange);
            y(listeners);
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
            $w.removeEventListener(popStateEventKey, onPopstate);
            y(listeners);
          };

          $w.addEventListener(popStateEventKey, onPopstate);

          popstateTimer = $w.setTimeout(() => {
            listeners.popstate.push(null);
            $w.removeEventListener(popStateEventKey, onPopstate);
            y(listeners);
          }, 2e3);

          $w.history.pushState({}, '', urlPath);
          $w.history.back();

          break;
        }
        default:
      }
    });
  }
}
