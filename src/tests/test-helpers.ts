import { html, LitElement } from 'lit-element';
import { popStateEventKey, pushStateEventKey } from '../constants.js';
import type { URLObserverCallbacks, URLObserverOption } from '../custom_typings.js';

export type TriggerEventsEventName = 'click' | 'hashchange' | 'popstate';
export type TriggerEventsResult = Record<TriggerEventsEventName, (null | TriggerEventsEventName)[]>;

export interface AppendElementResult<T> {
  element: T;
  removeElement(): void;
}
export interface AppendLinkResult {
  link: HTMLAnchorElement;
  removeLink(): void;
}
export interface AppendShadowElementResult<T> extends AppendElementResult<T> {
  component: HTMLElement;
}
export interface InitObserverOption {
  routes: RegExp[];
  observerOption: Partial<URLObserverOption>;
  callback: URLObserverCallbacks['callback'];
}

const $w = window as unknown as Window;

export class TestHelpers {
  appendElement<T extends HTMLElement>(
    elementName: string,
    option?: Record<string, string>
  ): AppendElementResult<T> {
    const element = document.createElement(elementName) as T;

    if (option) {
      for (const [k, v] of Object.entries(option)) {
        if (k.startsWith('.')) {
          (element as any)[k.slice(1)] = v;
        } else {
          element.setAttribute(k, v);
        }
      }
    }

    document.body.appendChild(element);

    return {
      element,
      removeElement() {
        document.body.removeChild(element);
      },
    };
  }

  appendLink(path: string, option?: Record<string, string>): AppendLinkResult {
    const link = document.createElement('a');

    link.href = link.textContent = path;

    if (option) {
      for (const [k, v] of Object.entries(option)) {
        if (k.startsWith('.')) {
          (link as any)[k.slice(1)] = v;
        } else {
          link.setAttribute(k, v);
        }
      }
    }

    document.body.appendChild(link);

    return {
      link,
      removeLink() {
        document.body.removeChild(link);
      },
    };
  }

  appendShadowElement<T extends HTMLElement>(
    elementName: string,
    option?: Record<string, string>
  ): AppendShadowElementResult<T> {
    const element = document.createElement(elementName) as T;

    if (option) {
      for (const [k, v] of Object.entries(option)) {
        if (k.startsWith('.')) {
          (element as any)[k.slice(1)] = v;
        } else {
          element.setAttribute(k, v);
        }
      }
    }

    const ceName = `test-${Math.random().toString(16).slice(-7)}`;
    // tslint:disable-next-line: max-classes-per-file
    window.customElements.define(ceName, class extends LitElement {
      protected render() {
        const content = document.createElement('div');

        content.appendChild(element);

        return html`
        ${content}
        `;
      }
    });

    const cElement = document.createElement(ceName);
    document.body.appendChild(cElement);

    return {
      element,
      component: cElement,
      removeElement() {
        document.body.removeChild(cElement);
      },
    };
  }

  appendShadowLink(path: string, option?: Record<string, string>): AppendLinkResult {
    const link = document.createElement('a');

    link.href = link.textContent = path;

    if (option) {
      for (const [k, v] of Object.entries(option)) {
        if (k.startsWith('.')) {
          (link as any)[k.slice(1)] = v;
        } else {
          link.setAttribute(k, v);
        }
      }
    }

    const ceName = `test-link-${Math.random().toString(16).slice(-7)}`;
    // tslint:disable-next-line: max-classes-per-file
    window.customElements.define(ceName, class extends LitElement {
      protected render() {
        const content = document.createElement('div');

        content.appendChild(link);

        return html`
        ${content}
        `;
      }
    });

    const cElement = document.createElement(ceName);
    document.body.appendChild(cElement);

    return {
      link,
      removeLink() {
        document.body.removeChild(cElement);
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

          const { link, removeLink } = $w.TestHelpers.appendLink(`/test-${new Date().toJSON()}`);
          const onClick = () => {
            $w.clearTimeout(clickTimer);
            listeners.click.push('click');
            $w.removeEventListener(pushStateEventKey, onClick);
            removeLink();
            y(listeners);
          };

          if (disconnected) {
            link.onclick = (ev: MouseEvent) => {
              if (ev.defaultPrevented) return;
              ev.preventDefault();
            };
          }

          $w.addEventListener(pushStateEventKey, onClick);

          clickTimer = $w.setTimeout(() => {
            listeners.click.push(null);
            removeLink();
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

  async waitForEvent<T extends Event>(
    eventName: string,
    cb?: () => Promise<void> | void
  ): Promise<T | undefined> {
    return new Promise<T>(async (y) => {
      let listenerTimer = -1;

      function onEventFired(ev: T) {
        window.clearTimeout(listenerTimer);
        $w.removeEventListener(eventName as unknown as any, onEventFired);
        y(ev);
      }

      $w.addEventListener(eventName as unknown as any, onEventFired);
      listenerTimer = window.setTimeout(() => {
        $w.removeEventListener(eventName as unknown as any, onEventFired);
        y();
      }, 3e3);

      if (typeof(cb) === 'function') await cb();
    });
  }
}
