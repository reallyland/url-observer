import { assert } from '@esm-bundle/chai';

import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';
import { toResult } from './helpers/to-result.js';

describe('methods-remove', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const init = initObserver(observers);

  it(`removes existing route with no before route handler`, () => {
    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
    });

    observer.remove(routes.test);

    assert.strictEqual(observer.routes.size, 0);
  });

  it(`removes existing route with before route handler`, () => {
    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
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

    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
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

    const routes: Record<'test', RegExp> = {
      test: /^\/test$/i,
    };
    const observer = init({
      routes: Object.values(routes),
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
