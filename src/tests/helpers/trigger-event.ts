import { popStateEventKey, pushStateEventKey } from '../../constants';
import { pageClick } from '../wtr-helpers/page-click.js';
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
    return new Promise(async (y) => {
      switch (eventName) {
        case 'click': {
          const newUrl = `/test-${new Date().toJSON()}`;

          let clickTimer = -1;

          const { removeLink } = appendLink(newUrl);
          const onClick = () => {
            $w.clearTimeout(clickTimer);
            (listeners.click ??= []).push('click');
            $w.removeEventListener(pushStateEventKey, onClick);
            $w.removeEventListener('click', onPreventClick);
            removeLink();
            y();
          };
          const onPreventClick = (ev: MouseEvent) => {
            if (ev.defaultPrevented) return;
            ev.preventDefault();
            $w.removeEventListener('click', onPreventClick);
          };

          /**
           * This is to prevent navigation on route change. Without URLObserver, any change in URL
           * will trigger a page redirect.
           */
          if (disconnected) $w.addEventListener('click', onPreventClick);

          $w.addEventListener(pushStateEventKey, onClick);

          clickTimer = $w.setTimeout(() => {
            (listeners.click ??= []).push(null);
            $w.removeEventListener(pushStateEventKey, onClick);
            $w.removeEventListener('click', onPreventClick);
            removeLink();
            y();
          }, 2e3);

          await pageClick(`a[href="${newUrl}"]`, {
            button: 'left',
          });

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
