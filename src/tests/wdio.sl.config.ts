import type { SauceLabsCapability, WdioConfig } from './wdio_typings.js';

import { config as baseConfig } from './wdio.config.js';

const baseCapability: SauceLabsCapability = {
  browserVersion: 'latest',
  'sauce:options': {
    build: new Date().toJSON(),
    screenResolution: '800x600',
    seleniumVersion: '3.141.59',
  },
  specs: [
    './dist/tests/**/*.test.js',
  ],
  browserName: 'googlechrome',
  platformName: 'windows 10',
};
const sauceLabsAccessKey = process.env.SAUCE_ACCESS_KEY || '';
const sauceLabsUser = process.env.SAUCE_USERNAME || '';

console.warn('1', {
  sauceLabsAccessKey: '*'.repeat(sauceLabsAccessKey.length - 4) + sauceLabsAccessKey.slice(-4),
  sauceLabsUser: '*'.repeat(sauceLabsUser.length - 2) + sauceLabsUser.slice(-2),
});

export const config: WdioConfig = {
  ...baseConfig,
  services: ['sauce'],
  specs: [],
  // specs: [
  //   './dist/tests/**/*.test.js',
  //   // './dist/tests/**/usages-click.test.js',
  // ],
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
    // {
    //   ...baseCapability,
    //   browserName: 'microsoftedge',
    //   browserVersion: '18',
    // },
  ] as SauceLabsCapability[],

  user: sauceLabsUser,
  key: sauceLabsAccessKey,
  region: 'us',
};
