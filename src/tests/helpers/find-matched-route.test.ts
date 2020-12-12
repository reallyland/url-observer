import { assert } from '@esm-bundle/chai';

import type { FindMatchedRouteResult, RouteEvent, Routes } from '../../custom_typings.js';
import { findMatchedRoute } from '../../helpers/find-matched-route.js';
import { urlParamMatcher } from '../../helpers/url-param-matcher.js';

type A = 'page' | 'page2' | 'subPage' | 'section' | 'subSection';

describe('find-matched-route', () => {
  const allRoutes: Record<A, RegExp> = {
    page: /^\/test$/i,
    page2: /^\/test/i,
    subPage: /^\/test\/(?<subPage>[^\/]+)$/i,
    section: /^\/test\/(?<subPage>[^\/]+)\/(?<section>[^\/]+)$/i,
    subSection: /^\/test\/(?<subPage>[^\/]+)\/(?<section>[^\/]+)\/(?<subSection>[^\/]+)$/i,
  };
  const routesMap: Routes = new Map();

  Object.keys(allRoutes).forEach((n) => {
    routesMap.set(n, {
      pathRegExp: allRoutes[n as A],
      beforeRouteHandlers: new Map(),
    });
  });

  it('matches longest route', () => {
    type B = Partial<Record<Exclude<A, 'page' | 'page2'>, string>>;

    const result: [string, FindMatchedRouteResult<B>][] = [];
    const urls: string[] = [
      '/test',
      '/test/123',
      '/test/123/456',
      '/test/123/456/789',
      '/test/123/456/789/0ab',
      '/test-1',
      '/test-1/123',
      '/page',
      '/page/123',
    ];

    for (const n of urls) {
      const match = findMatchedRoute<B>(routesMap, {
        matcherCallback: urlParamMatcher,
        scope: '',
        status: 'manual',
        url: new URL(n, 'https://example.com'),
      });

      result.push([n, match]);
    }

    const defaultExpected: FindMatchedRouteResult<B> = {
      beforeRouteHandlers: new Map(),
      found: true,
      params: {} as B,
      pathRegExp: undefined,
      scope: '',
      status: 'manual',
      url: '',
    };
    assert.deepEqual(result, [
      [
        '/test',
        {
          ...defaultExpected,
          pathRegExp: allRoutes.page,
          url: 'https://example.com/test'
        }
      ],
      [
        '/test/123',
        {
          ...defaultExpected,
          params: { subPage: '123' },
          pathRegExp: allRoutes.subPage,
          url: 'https://example.com/test/123'
        }
      ],
      [
        '/test/123/456',
        {
          ...defaultExpected,
          params: { section: '456', subPage: '123' },
          pathRegExp: allRoutes.section,
          url: 'https://example.com/test/123/456',
        }
      ],
      [
        '/test/123/456/789',
        {
          ...defaultExpected,
          params: { section: '456', subPage: '123', subSection: '789' },
          pathRegExp: allRoutes.subSection,
          url: 'https://example.com/test/123/456/789',
        }
      ],
      [
        '/test/123/456/789/0ab',
        {
          ...defaultExpected,
          pathRegExp: allRoutes.page2,
          url: 'https://example.com/test/123/456/789/0ab',
        }
      ],
      [
        '/test-1',
        {
          ...defaultExpected,
          pathRegExp: allRoutes.page2,
          url: 'https://example.com/test-1',
        }
      ],
      [
        '/test-1/123',
        {
          ...defaultExpected,
          pathRegExp: allRoutes.page2,
          url: 'https://example.com/test-1/123',
        }
      ],
      [
        '/page',
        {
          ...defaultExpected,
          beforeRouteHandlers: undefined,
          found: false,
          pathRegExp: undefined,
          url: 'https://example.com/page',
        }
      ],
      [
        '/page/123',
        {
          ...defaultExpected,
          beforeRouteHandlers: undefined,
          found: false,
          pathRegExp: undefined,
          url: 'https://example.com/page/123',
        }
      ],
    ]);
  });

});
