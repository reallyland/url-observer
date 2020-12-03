import type { URLObserverCallbacks, URLObserverOption } from '../../custom_typings.js';
import { URLObserver } from '../../url-observer.js';
import type { URLObserverWithDebug } from '../custom_test_typings.js';

interface InitObserverOption {
  routes: RegExp[];
  observerOption: Partial<URLObserverOption>;
  callback: URLObserverCallbacks['callback'];
}

export function initObserver<T extends URLObserver = URLObserverWithDebug>(
  observersSet: Set<T>
) {
  return function initObserverFn<U extends URLObserver = T>(
    option?: Partial<InitObserverOption>
  ): U {
    const {
      routes,
      callback,
      observerOption,
    } = option ?? {};

    const observer = new URLObserver(callback);

    if (routes) {
      observer.observe(routes, {
        debug: true,
        ...observerOption,
      });
    }

    observersSet.add(observer as T);

    return observer as U;
  };
}
