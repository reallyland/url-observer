import type { MatchedRoute } from '../custom_typings.js';
import type { URLObserver } from '../url-observer.js';
import { HOST } from './config.js';

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

  it(`finds a matched route`, async () => {
    interface A {
      test: string;
    }
    type B = MatchedRoute<A>;

    const expected: B = await browser.executeAsync(async (done) => {
      const $w = window as unknown as Window;
      const observer = new $w.URLObserver();

      $w.observerList.push(observer);
      observer.observe([/^\/test\/(?<test>[^\/]+)/i], { debug: true });

      const link = document.createElement('a');
      const linkPath = '/test/123';

      link.href = link.textContent = linkPath;
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

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
      const observer = new $w.URLObserver();

      $w.observerList.push(observer);
      observer.observe([/^\/test$/i], { debug: true });

      const link = document.createElement('a');
      const linkPath = '/test/123';

      link.href = link.textContent = linkPath;
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

      done(observer.match<B>());
    });

    expect(expected).toEqual<B>({
      found: false,
      matches: {},
    });
  });

});
