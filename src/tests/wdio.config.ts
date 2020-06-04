import type { WdioConfig } from './wdio_typings.js';

export const config: WdioConfig = {
  runner: 'local',
  specs: [
    './dist/tests/**/*.test.js',
  ],
  exclude: [],
  maxInstances: 36,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--disable-background-timer-throttling',
          '--disable-gpu',
          '--disable-renderer-backgrounding',
          '--auto-open-devtools-for-tabs',
          '--headless',
          '--no-sandbox',
          '--window-size=800,600',
          // '--window-size=1734,707',
        ],
        w3c: true,
      },
      maxInstances: 10,
    },
    {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: [
          '--window-size=800,600',
          '--headless',
        ],
      },
      maxInstances: 10,
    },
  ],
  logLevel: 'error',
  bail: 1,
  baseUrl: 'http://localhost',
  waitforTimeout: 10e3,
  connectionRetryCount: 2,

  services: ['selenium-standalone'],
  seleniumLogs: 'logs',

  framework: 'mocha',
  specFileRetries: 1,
  reporters: ['spec'],
  mochaOpts: {
    asyncOnly: true,
    bail: true,
    checkLeaks: true,
    fullTrace: true,
    inlineDiffs: true,
    require: ['@babel/register'],
    timeout: 30e3, /** Increase timeout does help in resolving some odd timeout issues */
    ui: 'bdd',
  },
};
