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

    const didRemove = observer.remove(routes.test);

    assert.ok(didRemove);
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

    const didRemove = observer.remove(routes.test);

    assert.ok(didRemove);
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

    const didRemove = observer.remove(routes.test, '');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.ok(didRemove);
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

    const didRemove = observer.remove(routes.test, scopeName);

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.ok(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default']],
    ]);
  });

  it(`removes non-existing default before route handler`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });
    const scopeName = ':test';
    const scopeName2 = ':test2';

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
      scope: scopeName,
    });
    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
      scope: scopeName2,
    });

    const didRemove = observer.remove(routes.test, ':test3');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.notOk(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [scopeName, scopeName2]],
    ]);
  });

  it(`removes non-existing scoped before route handler`, () => {
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

    const didRemove = observer.remove(routes.test, ':test2');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.notOk(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default', scopeName]],
    ]);
  });

  it(`removes non-existing route`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });

    const didRemove = observer.remove(/404/i);

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.notOk(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default']],
    ]);
  });

  it(`removes non-existing route with defined default scope`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });

    const didRemove = observer.remove(/404/i, '');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.notOk(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default']],
    ]);
  });

  it(`removes non-existing route with defined scope`, () => {
    type A = [string, string[]];

    const observer = init({
      routes: [routes.test],
    });

    observer.add({
      pathRegExp: routes.test,
      handleEvent() {
        return true;
      },
    });

    const didRemove = observer.remove(/404/i, ':test');

    const result = toResult<A>(observer.routes, h => Array.from(h.keys()));

    assert.notOk(didRemove);
    assert.deepStrictEqual(result, [
      ['/^\\/test$/i', [':default']],
    ]);
  });

});
