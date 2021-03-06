import { assert } from '@esm-bundle/chai';

import { routes } from './config.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { historyFixture } from './utils/history-fixture.js';
import { initObserver } from './utils/init-observer.js';
import { toResult } from './utils/to-result.js';

describe('methods-add', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);
  const restoreHistory = historyFixture();

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
    restoreHistory();
  });

  it(`adds first route`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [],
    });

    observer.add({
      pathRegExp: routes.test,
    });

    const result: A[] = toResult<A>(observer.routes, h => !h.size);

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(`adds first route with default before route handler`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [],
    });

    observer.add({
      handleEvent() { return true; },
      pathRegExp: routes.test,
    });

    const result: A[] = toResult<A>(observer.routes, h => h.has(':default'));

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(`adds first route with scoped before route handler`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [],
    });
    const scopeName = ':test';

    observer.add({
      handleEvent() {
        return true;
      },
      pathRegExp: routes.test,
      scope: scopeName,
    });

    const result: A[] = toResult<A>(observer.routes, h => h.has(scopeName));

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(`adds new route`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: /^\/test1/i,
    });

    const result: A[] = toResult<A>(observer.routes, h => !h.size);

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
      ['/^\\/test1/i', true],
    ]);
  });

  it(`does not add new route to existing route`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: routes.test,
    });

    const result: A[] = toResult<A>(observer.routes, h => !h.size);

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(`does not override existing route`, () => {
    type A = [string, boolean];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      handleEvent() {
        return true;
      },
      pathRegExp: routes.test,
    });
    observer.add({
      pathRegExp: routes.test,
    });

    const result: A[] = toResult<A>(observer.routes, h => h.size === 1 && h.has(':default'));

    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', true],
    ]);
  });

  it(
    `adds default before route handler to existing route with existing before route handlers`,
    () => {
      type A = [string, boolean];

      const observer = init({
        routes: [routes.test],
      });
      const scopeName = ':test';

      observer.add({
        handleEvent() {
          return true;
        },
        pathRegExp: routes.test,
        scope: scopeName,
      });
      observer.add({
        handleEvent() {
          return true;
        },
        pathRegExp: routes.test,
      });

      const result: A[] = toResult<A>(
        observer.routes,
        h => h.size === 2 && [':default', scopeName].every(n => h.has(n))
      );

      assert.deepStrictEqual(result, [
        ['/^\\/test$/i', true],
      ]);
    }
  );

  it(
    `adds scoped before route handler to existing route with existing before route handlers`,
    () => {
      type A = [string, boolean];

      const observer = init({
        routes: [/^\/test/i],
      });
      const scopeName = ':test';

      observer.add({
        handleEvent() {
          return true;
        },
        pathRegExp: /^\/test/i,
      });
      observer.add({
        handleEvent() {
          return true;
        },
        pathRegExp: /^\/test/i,
        scope: scopeName,
      });

      const result: A[] = toResult<A>(
        observer.routes,
        h => h.size === 2 && [':default', scopeName].every(n => h.has(n))
      );

      assert.deepStrictEqual(result, [
        ['/^\\/test/i', true],
      ]);
    }
  );

});
