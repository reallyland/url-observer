import type { SauceLabsCapability, WdioConfig } from './wdio_typings.js';

import { config as baseConfig } from './wdio.config.js';

const baseCapability: SauceLabsCapability = {
  browserVersion: 'latest',
  'sauce:options': {
    build: new Date().toJSON(),
    screenResolution: '800x600',
    seleniumVersion: '3.141.59',
  },
  // specs: [
  //   './dist/tests/**/*.test.js',
  // ],
  browserName: 'googlechrome',
  platformName: 'windows 10',
};
const sauceLabsAccessKey = process.env.SAUCE_ACCESS_KEY || '';
const sauceLabsUser = process.env.SAUCE_USERNAME || '';

export const config: WdioConfig = {
  ...baseConfig,
  services: [
    ['sauce', { sauceConnect: true }],
  ],
  // specs: [],
  capabilities: [
    {
      ...baseCapability,
      browserName: 'safari',
      platformName: 'macos 10.13',
      'sauce:options': {
        ...baseCapability['sauce:options'],
        screenResolution: '1024x768',
      },
    },
    {
      ...baseCapability,
      browserName: 'microsoftedge',
      browserVersion: '18',
    },
  ] as SauceLabsCapability[],

  user: sauceLabsUser,
  key: sauceLabsAccessKey,
  region: 'us',
};
