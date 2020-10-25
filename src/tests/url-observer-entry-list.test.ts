import { assert } from '@esm-bundle/chai';

import type { URLObserverEntryProperty } from '../custom_typings.js';
import { URLObserverEntryList } from '../url-observer-entry-list.js';

describe('url-observer-entry', () => {
  const property: URLObserverEntryProperty = {
    entryType: 'init',
    scope: ':default',
    startTime: window.performance.now(),
    url: 'http://localhost:3000/',
  };
  const clickProperties: URLObserverEntryProperty[] = [
    {
      ...property,
      entryType: 'click',
      startTime: window.performance.now(),
    },
    {
      ...property,
      entryType: 'click',
      startTime: window.performance.now(),
    },
  ];

  it(`returns correct name`, () => {
    const entryList = new URLObserverEntryList();

    assert.strictEqual(entryList[Symbol.toStringTag], 'URLObserverEntryList');
    assert.strictEqual(Object.prototype.toString.call(entryList), '[object URLObserverEntryList]');
  });

  it(`returns entries`, () => {
    const entryList = new URLObserverEntryList();

    assert.deepStrictEqual(entryList.getEntries(), []);
  });

  it(`returns entries by entry scope`, () => {
    const entryList = new URLObserverEntryList();

    entryList.addEntry({
      ...property,
    });
    clickProperties.forEach(n => entryList.addEntry(n));

    assert.deepStrictEqual(entryList.getEntriesByEntryScope(':default'), [property]);
  });

  it(`returns entries by entry type`, () => {
    const entryList = new URLObserverEntryList();

    entryList.addEntry(property);
    clickProperties.forEach(n => entryList.addEntry(n));

    assert.deepStrictEqual(entryList.getEntriesByEntryType('click'), clickProperties);
  });

  it(`adds entry`, () => {
    const entryList = new URLObserverEntryList();

    entryList.addEntry(property);

    assert.deepStrictEqual(entryList.getEntries(), [property]);
  });

  it(`deletes entries`, () => {
    const entryList = new URLObserverEntryList();

    entryList.addEntry(property);
    entryList.deleteEntries();

    assert.deepStrictEqual(entryList.getEntries(), []);
  });

});
