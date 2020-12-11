import { assert } from '@esm-bundle/chai';

import type { Routes } from '../../custom_typings.js';
import { findMatchedRoute } from '../../helpers/find-matched-route.js';

type A = 'page' | 'page2' | 'subPage' | 'section' | 'subSection';

describe('find-matched-route', () => {
  const allRoutes: Record<A, RegExp> = {
    page: /^\/test$/i,
    page2: /^\/test/i,
    subPage: /^\/test\/(?<subPage>[^/]+)$/i,
    section: /^\/test\/(?<subPage>[^/]+)\/(?<section>[^/]+)$/i,
    subSection: /^\/test\/(?<subPage>[^/]+)\/(?<section>[^/]+)\/(?<subSection>[^/]+)$/i,
  };
  const routesMap: Routes = new Map();

  Object.keys(allRoutes).forEach((n) => {
    routesMap.set(n, {
      pathRegExp: allRoutes[n as A],
      beforeRouteHandlers: new Map(),
    });
  });

  it('matches longest route', () => {
    const result: [string, undefined | RegExp][] = [];
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
      const match = findMatchedRoute(routesMap, n);

      result.push([n, match?.pathRegExp]);
    }

    assert.deepEqual(result, [
      ['/test', allRoutes.page],
      ['/test/123', allRoutes.subPage],
      ['/test/123/456', allRoutes.section],
      ['/test/123/456/789', allRoutes.subSection],
      ['/test/123/456/789/0ab', allRoutes.page2],
      ['/test-1', allRoutes.page2],
      ['/test-1/123', allRoutes.page2],
      ['/page', undefined],
      ['/page/123', undefined],
    ]);
  });

});
