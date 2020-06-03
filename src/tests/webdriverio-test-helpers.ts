import type { BrowserName } from './wdio_typings';

export const itSkip = (x: BrowserName[]): Mocha.PendingTestFunction | Mocha.TestFunction =>
  x.some(n => browser.capabilities.browserName === n) ? it.skip : it;
