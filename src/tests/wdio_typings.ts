export type BrowserName = 'chrome' | 'firefox' | 'microsoftedge' | 'safari';

type ChromeOptions = WebDriver.DesiredCapabilities['chromeOptions'] & {
  w3c?: boolean;
};

interface ChromeCapability {
  browserName: 'chrome';
  'goog:chromeOptions'?: ChromeOptions;
}
interface FirefoxCapability extends
  WebDriver.Capabilities,
  Pick<WebDriver.DesiredCapabilities, 'moz:firefoxOptions'>
{
  browserName: 'firefox';
}
interface SafariCapability {
  browserName: 'safari';
  'apple:safari.options'?: {
    technologyPreview: boolean;
  };
}

interface EdgeCapability extends
  WebDriver.Capabilities,
  Pick<WebDriver.DesiredCapabilities, 'ms:inPrivate' | 'ms:extensionPaths' | 'ms:startPage'>
{
  browserName: 'microsoftedge';
}

type BrowsersCapability =
  | ChromeCapability
  | FirefoxCapability
  | SafariCapability
  | EdgeCapability;

interface BaseCapability extends Partial<Pick<WdioConfig, 'specs'>> {
  maxInstances?: number;
}

export type Capability = BaseCapability & BrowsersCapability;

interface SauceLabsBrowserCapability extends Partial<Pick<BaseConfig, 'specs'>> {
  browserVersion: string;
  platformName: string;
  'sauce:options'?: SauceLabsOptions;
}

/** @see https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options */
export interface SauceLabsOptions {
  ['custom-data']?: Record<string, unknown>;
  build?: string;
  name?: string;
  passed?: boolean;
  screenResolution?: string;
  seleniumVersion?: string;
  tags?: string[];
  timeZone?: string;
  tunnelIdentifier?: string;
}

interface SauceLabsChromeCapability extends SauceLabsBrowserCapability, Omit<ChromeCapability, 'browserName'> {
  browserName: 'googlechrome';
}

type SauceLabsFirefoxCapability = SauceLabsBrowserCapability & FirefoxCapability;

type SauceLabsSafariCapability = SauceLabsBrowserCapability & SafariCapability;

type SauceLabsEdgeCapability = SauceLabsBrowserCapability & EdgeCapability;

export type SauceLabsCapability =
  | SauceLabsChromeCapability
  | SauceLabsFirefoxCapability
  | SauceLabsSafariCapability
  | SauceLabsEdgeCapability;

/**
 * Mocha CLI commands
 *
 * @see https://mochajs.org/#command-line-usage
 */
interface MochaFramework {
  framework: 'mocha';
  mochaOpts: {
    allowUncaught?: boolean;
    asyncOnly?: boolean;
    bail?: boolean;
    checkLeaks?: boolean;
    fullTrace?: boolean;
    inlineDiffs?: boolean;
    reporter?: string;
    require?: string[];
    timeout?: number;
    ui: 'bdd' | 'tdd';
  };
}
interface JasmineFramework {
  framework: 'jasmine';
  jasmineNodeOpts: {
    defaultTimeoutInterval: number;
    grep: null;
    invertGrep: null;
    expectationResultHandler(passed: unknown, assertion: unknown): void;
  };
}
// interface CucumberFramework {
//   require: string[];
//   backtrace: boolean;
//   requireModule: string[];
//   dryRun: boolean;
//   failFast: boolean;
//   format: string[];
//   colors: true;
//   snippets: boolean;
//   source: boolean;
//   profile: string[];
//   strict: boolean;
//   tags: string[];
//   timeout: number;
//   ignoreUndefinedDefinitions: boolean;

//   /** Cucumber specific overloads */
//   beforeHook(test: unknown, context: unknown, stepData: unknown): void
//   beforeHook(test: unknown, context: unknown, stepData: unknown, world: unknown): void

//   /** Cucumber specific overloads */
//   afterHook(
//     test: unknown,
//     context: unknown,
//     { error, result, duration, passed, retries }: any,
//     stepData: unknown,
//     world?: unknown
//   ): void;

//   beforeFeature(uri: string, feature: unknown, scenarios: unknown): void;
//   beforeScenario(
//     uri: string, feature: unknown, scenarios: unknown, sourceLocation: string): void;
//   beforeStep(uri: string, feature: unknown, stepData: unknown, context: unknown): void;
//   afterStep(
//     uri: string,
//     feature: unknown,
//     { error, result, duration, passed }: any,
//     stepData: unknown,
//     context: unknown
//   ): void;
//   afterScenario(
//     uri: string, feature: unknown, scenarios: unknown, sourceLocation: string): void;
//   afterFeature(uri: string, feature: unknown, scenarios: unknown): void;
// }

export type Framework = MochaFramework | JasmineFramework;

// type Services =
//   | 'selenium-standalone'
//   | 'sauce';

type Reporters =
  | 'spec';

export type ReportersConfig = [Reporters, Record<string, unknown>];

interface BaseConfig {
  runner: 'local';
  hostname?: string;
  port?: number;
  path?: string;
  protocol?: 'http' | 'https';
  specs: string[];
  exclude: string[];
  maxInstances: number;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
  outputDir?: string;
  baseUrl: string;
  bail: 0 | 1;
  waitforTimeout: number;
  connectionRetryCount: number;
  // services: string[];
  specFileRetries: number;
  reporters: (Reporters | ReportersConfig)[];
  filesToWatch?: string[];

  onPrepare?(config: WdioConfig, capabilities: WdioConfig['capabilities']): void;
  beforeSession?(config: WdioConfig, capabilities: WdioConfig['capabilities'], specs: WdioConfig['specs']): void;
  before?(config: WdioConfig, capabilities: WdioConfig['capabilities']): void;
  beforeSuite?(suite: object): void;
  beforeHook?(test: unknown, context: unknown): void;
  afterHook?(
    test: unknown, context: unknown, { error, result, duration, passed, retries }: any): void;
  beforeTest?(test: unknown, context: unknown): void;
  beforeCommand?(commandName: string, args: string[]): void;
  afterCommand?(commandName: string, args: string[], result: 0 | 1, error: Error): void;
  afterTest?(
    test: unknown, context: unknown, { error, result, duration, passed, retries }: any): void;
  afterSuite?(suite: object): void;
  after?(result: 0 | 1, capabilities: WdioConfig['capabilities'], specs: WdioConfig['specs']): void;
  afterSession?(config: WdioConfig, capabilities: WdioConfig['capabilities'], specs: WdioConfig['specs']): void;
  onComplete?(
    exitCode: 0 | 1,
    config: WdioConfig,
    capabilities: WdioConfig['capabilities'],
    results: object
  ): void;
  onReload?(oldSessionId: string, newSessionId: string): void;
}

interface SeleniumArgsDrivers {
  version: string;
}
interface SeleniumArgs {
  drivers: Record<'chrome' | 'firefox', SeleniumArgsDrivers>;
}
interface SeleniumConfig extends BaseConfig {
  capabilities: Capability[];
  services: ['selenium-standalone'];
  seleniumLogs: 'logs';
  seleniumInstallArgs?: SeleniumArgs;
  seleniumArgs?: SeleniumArgs;
}

/** Refer to https://github.com/bermi/sauce-connect-launcher#advanced-usage. */
interface SauceLabsConfig extends BaseConfig {
  capabilities: SauceLabsCapability[];
  key?: string;
  region?: 'us' | 'eu';
  services: ['sauce'] | ['sauce', SauceLabsServiceOption][];
  user?: string;
}

interface SauceLabsSauceConnectOptions {
  username?: string;
  accessKey?: string;
  verbose?: boolean;
  verboseDebugging?: boolean;
  vv?: boolean;
  port?: number;
  proxy?: string;
  logfile?: string;
  logStats?: number;
  maxLogsize?: number;
  doctor?: boolean;
  tunnelIdentifier?: string;
  fastFailRegexps?: RegExp | RegExp[];
  directDomains?: string | string[];
  logger?(message: string): void;
  readyFileId?: string;
  connectRetries?: number;
  connectRetryTimeout?: number;
  downloadRetries?: number;
  downloadRetryTimeout?: number;
  exe?: string;
  detached?: boolean;
  connectVersion?: string;
}

interface SauceLabsServiceOption {
  sauceConnect?: boolean;
  sauceConnectOpts?: SauceLabsSauceConnectOptions;
}

interface LocalConfig extends BaseConfig, Pick<SeleniumConfig, 'capabilities'> {
  services: [];
}

type Config = LocalConfig | SauceLabsConfig | SeleniumConfig;

export type WdioConfig = Config & Framework;
