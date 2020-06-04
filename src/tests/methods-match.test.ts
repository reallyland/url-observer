import type { MatchedRoute } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';
import { itSkip } from './webdriverio-test-helpers.js';

describe('methods-match', () => {
  /** Always load the page to reset URL history */
  beforeEach(async () => {
    await browser.url(HOST);
  });

  afterEach(async () => {
    await browser.executeAsync(async (done) => {
      const obsList: URLObserver[] = window.observerList;

      for (const obs of obsList) obs.disconnect();

      done();
    });
  });

  itSkip(['microsoftedge'])(`finds a matched route`, async () => {
    interface A {
      test: string;
    }
    type B = MatchedRoute<A>;

    const expected: B = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test\/(?<test>[^\/]+)/i],
        observerOption: { debug: true },
      });
      const { link, removeLink } = appendLink('/test/123');

      link.click();
      removeLink();

      done(observer.match<B>());
    });

    expect(expected).toEqual<B>({
      found: true,
      matches: { test: '123' },
    });
  });

  it(`finds no matched route`, async () => {
    interface A {
      test?: string;
    }
    type B = MatchedRoute<A>;

    const expected: B = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const { appendLink, initObserver } = $w.TestHelpers;

      const observer = initObserver({
        routes: [/^\/test$/i],
        observerOption: { debug: true },
      });
      const { link, removeLink } = appendLink('/test/123');

      link.click();
      removeLink();

      done(observer.match<B>());
    });

    expect(expected).toEqual<B>({
      found: false,
      matches: {},
    });
  });

});
