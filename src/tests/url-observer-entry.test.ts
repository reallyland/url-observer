import { assert } from '@esm-bundle/chai';

import type { URLObserverEntryProperty } from '../custom_typings.js';
import { URLObserverEntry } from '../url-observer-entry.js';

describe('url-observer-entry', () => {
  const property: URLObserverEntryProperty = {
    entryType: 'init',
    scope: ':default',
    startTime: window.performance.now(),
    url: 'http://localhost:3000/',
  };

  it(`returns correct name`, () => {
    const entry = new URLObserverEntry(property);

    assert.strictEqual(entry[Symbol.toStringTag], 'URLObserverEntry');
    assert.strictEqual(Object.prototype.toString.call(entry), '[object URLObserverEntry]');
  });

  it(`returns JSON object via .toJSON()`, () => {
    const entry = new URLObserverEntry(property);

    assert.deepStrictEqual(entry.toJSON(), property);
  });
});
