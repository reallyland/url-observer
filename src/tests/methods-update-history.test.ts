import { assert } from '@esm-bundle/chai';

import type { URLChangedStatus } from '../custom_typings.js';
import type { URLObserverWithDebug } from './custom_test_typings.js';
import { initObserver } from './helpers/init-observer.js';

describe('methods-update-history', () => {
  const observers: Set<URLObserverWithDebug> = new Set();
  const routes: Record<'section' | 'test', RegExp> = {
    section: /^\/test\/(?<test>[^\/]+)$/i,
    test: /^\/test$/i,
  };
  const init = initObserver(observers);

  beforeEach(() => {
    observers.forEach(n => n.disconnect());
    observers.clear();
  });

  it(`updates history programmatically`, async () => {
    const newUrl = '/test/123';
    const observer = init({
      routes: Object.values(routes),
    });

    await observer.updateHistory(newUrl);

    assert.strictEqual(window.location.pathname, newUrl);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'manual']
    );
  });

  it(`updates history programmatically with default before route handler`, async () => {
    type A = string[];

    const newUrl = '/test/123';
    const scopeName = ':default';
    const observer = init({
      routes: Object.values(routes),
    });
    const result: A = [];

    observer.add({
      pathRegExp: routes.section,
      handleEvent() {
        result.push(scopeName);
        return true;
      },
    });

    await observer.updateHistory(newUrl, scopeName);

    assert.strictEqual(window.location.pathname, newUrl);
    assert.deepStrictEqual<A>(result, [scopeName]);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'manual']
    );
  });

  it(`updates history programmatically with scoped before route handler`, async () => {
    type A = string[];

    const newUrl = '/test/123';
    const scopeName = ':test';

    const observer = init({
      routes: Object.values(routes),
    });
    const result: A = [];

    observer.add({
      pathRegExp: routes.section,
      handleEvent() {
        result.push(scopeName);
        return true;
      },
      scope: scopeName,
    });

    await observer.updateHistory(newUrl, scopeName);

    assert.strictEqual(window.location.pathname, newUrl);
    assert.deepStrictEqual<A>(result, [scopeName]);
    assert.deepStrictEqual<URLChangedStatus[]>(
      observer.takeRecords().map(n => n.entryType),
      ['init', 'manual']
    );
  });

});
