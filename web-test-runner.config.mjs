import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

import { pageClickPlugin } from './wtr-plugins/page-click.js';

/** @type {import('@web/test-runner').TestRunnerConfig} */
const config = {
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  browserStartTimeout: 60e3,
  concurrency: 3,
  concurrentBrowsers: 9,
  coverage: true,
  coverageConfig: {
    report: true,
    threshold: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    nativeInstrumentation: true,
    exclude: [
      './src/tests/**',
    ],
  },
  files: [
    // './src/tests/**/*.test.ts',

    './src/tests/**/methods-add.test.ts',
    './src/tests/**/methods-disconnect.test.ts',
    './src/tests/**/methods-match.test.ts',
    './src/tests/**/methods-observe.test.ts',
    './src/tests/**/methods-remove.test.ts',
    './src/tests/**/methods-take-records.test.ts',
    './src/tests/**/methods-update-history.test.ts',

    './src/tests/**/url-observer.test.ts',
    './src/tests/**/url-observer-entry.test.ts',
    './src/tests/**/url-observer-entry-list.test.ts',

    './src/tests/**/usages-click.test.ts',
    './src/tests/**/usages-hashchange.test.ts',
    './src/tests/**/usages-history.test.ts',
    './src/tests/**/usages-popstate.test.ts',
    './src/tests/**/usages-route-handler.test.ts',
    './src/tests/**/usages-route-match.test.ts',

    './src/tests/helpers/*.test.ts',
  ],
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'firefox82', /** FF82 does not support private fields */
    }),
    pageClickPlugin(),
  ],
  testFramework: {
    config: {
      checkLeaks: true,
      fullTrace: true,
      retries: 3,
      timeout: 60e3,
      ui: 'bdd',
    }
  },
};

export default config;
