import { assert } from '@esm-bundle/chai';

import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { historyFixture } from './helpers/history-fixture.js';
import { initObserver } from './helpers/init-observer.js';
import { toResult } from './helpers/to-result.js';

describe('methods-remove', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`removes existing route with no before route handler`, () => {
    const observer = init({
      routes: [routes.test],
    });

    observer.remove(routes.test);

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`removes existing route with before route handler`, () => {
    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });
    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
      scope: ':test',
    });

    observer.remove(routes.test);

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`removes existing default before route handler`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });
    const scopeName = ':test';

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });
    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
      scope: scopeName,
    });

    observer.remove(routes.test, '');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [scopeName]],
    ]);
  });

  it(`removes existing scoped before route handler`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });
    const scopeName = ':test';

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });
    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
      scope: scopeName,
    });

    observer.remove(routes.test, scopeName);

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default']],
    ]);
  });

});
