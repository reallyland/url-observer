import { assert } from '@esm-bundle/chai';

import { urlParamMatcher } from '../../helpers/url-param-matcher.js';
import { routes } from '../config.js';

describe('url-param-matcher', () => {
  it('matches URL params', () => {
    interface A {
      test: string;
    }

    const result = urlParamMatcher<A>('/test/123', routes.section);

    assert.deepEqual(result, {
      test: '123',
    });
  });

  it('matches no URL params', () => {
    const result = urlParamMatcher<Record<string, never>>('/test/123', routes.test);

    assert.deepEqual(result, {});
  });
});
