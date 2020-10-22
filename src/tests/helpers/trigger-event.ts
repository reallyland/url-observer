import { popStateEventKey, pushStateEventKey } from '../../constants';
import { appendLink } from './append-link';

export type TriggerEventsEvents = ['click', 'hashchange', 'popstate'];
export type TriggerEventsName = TriggerEventsEvents[number];

export type TriggerEventListeners = Partial<{
  [T in TriggerEventsName]: (T | null)[];
}>;

const $w = window;

export function triggerEvents(listeners: TriggerEventListeners) {
  return async function triggerEventsFn(
    eventName: TriggerEventsName,
    disconnected: boolean = false
  ): Promise<void> {
    return new Promise((y) => {
      switch (eventName) {
        case 'click': {
          let clickTimer = -1;

          const { link, removeLink } = appendLink(`/test-${new Date().toJSON()}`);
          const onClick = () => {
            $w.clearTimeout(clickTimer);
            (listeners.click ??= []).push('click');
            $w.removeEventListener(pushStateEventKey, onClick);
            removeLink();
            y();
          };

          /**
           * This is to prevent navigation on route change. Without URLObserver, any change in URL
           * will trigger a page redirect.
           */
          if (disconnected) {
            link.onclick = (ev: MouseEvent) => {
              if (ev.defaultPrevented) return;
              ev.preventDefault();
            };
          }

          $w.addEventListener(pushStateEventKey, onClick);

          clickTimer = $w.setTimeout(() => {
            (listeners.click ??= []).push(null);
            removeLink();
            $w.removeEventListener(pushStateEventKey, onClick);
            y();
          }, 2e3);

          link.click();

          break;
        }
        case 'hashchange': {
          let hashchangeTimer = -1;

          const onHashChange = () => {
            $w.clearTimeout(hashchangeTimer);
            (listeners.hashchange ??= []).push('hashchange');
            $w.removeEventListener(pushStateEventKey, onHashChange);
            y();
          };

          $w.addEventListener(pushStateEventKey, onHashChange);

          hashchangeTimer = $w.setTimeout(() => {
            (listeners.hashchange ??= []).push(null);
            $w.removeEventListener(pushStateEventKey, onHashChange);
            y();
          }, 2e3);

          $w.location.hash = `#test-${new Date().toJSON()}`;

          break;
        }
        case 'popstate': {
          let popstateTimer = -1;

          const onPopstate = () => {
            $w.clearTimeout(popstateTimer);
            (listeners.popstate ??= []).push('popstate');
            $w.removeEventListener(popStateEventKey, onPopstate);
            y();
          };

          $w.addEventListener(popStateEventKey, onPopstate);

          popstateTimer = $w.setTimeout(() => {
            (listeners.popstate ??= []).push(null);
            $w.removeEventListener(popStateEventKey, onPopstate);
            y();
          }, 2e3);

          $w.history.pushState({}, '', `/test-${new Date().toJSON()}`);
          $w.history.back();

          break;
        }
        default:
      }
    });
  };
}
