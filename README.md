<div align="center" style="text-align: center;">
  <h1 style="border-bottom: none;">url-observer</h1>

  <p>URLObserver observes URL changes in web browsers</p>
</div>

<hr />

<a href="https://www.buymeacoffee.com/RLmMhgXFb" target="_blank" rel="noopener noreferrer"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 20px !important;width: auto !important;" ></a>
[![tippin.me][tippin-me-badge]][tippin-me-url]
[![Follow me][follow-me-badge]][follow-me-url]

[![Version][version-badge]][version-url]
[![MIT License][mit-license-badge]][mit-license-url]

[![Downloads][downloads-badge]][downloads-url]
[![Total downloads][total-downloads-badge]][downloads-url]
[![Packagephobia][packagephobia-badge]][packagephobia-url]
[![Bundlephobia][bundlephobia-badge]][bundlephobia-url]

[![Dependency Status][daviddm-badge]][daviddm-url]

[![codebeat badge][codebeat-badge]][codebeat-url]
[![Codacy Badge][codacy-badge]][codacy-url]
[![Language grade: JavaScript][lgtm-badge]][lgtm-url]
[![Code of Conduct][coc-badge]][coc-url]

> Inspired by PerformanceObserver but for observing history on browsers.

## Table of contents <!-- omit in toc -->

- [Pre-requisites](#pre-requisites)
- [Installation](#installation)
- [Usage](#usage)
- [API References](#api-references)
- [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
- [License](#license)

## Pre-requisites

- ES2018+ (_This module uses [RegExp named capture groups] for route matching._)

## Installation

```sh
# Install via NPM
$ npm install url-observer
```

## Usage

```ts
import 'url-observer';

const observer = new URLObserver((list, observer) => {
  for (const entry of list.getEntries()) {
    /** Process entry for each URL update */ 
  }
});
const routes = [
  /^\/test$\//i,
  /^\/test\/(?<test>[^\/]+)$/i,
];
const options = {
  dwellTime: 2e3, /** Default dwellTime. Set -1 to always push new URL */
  debug: false, /** Set to enable debug mode. This exposes hidden `routes` property. */
  matcherCallback() {
    /**
     * Override how route matching works internally.
     * By default, ES2018's RegExp named capture groups are used.
     */
  },
};

/** Call .observe() to start observing history */
observe.observe(routes, options);

/** Call .add() to add new route or before route handler to existing registered route */
observer.add({
  handleEvent: () => {
    /** Do anything before route changes. Return true to navigate to new route. */
    return true;
  }
  pathRegExp: routes[0],
  /**
   * A scoped route handler enables multiple before route handler to be registered to the
   * same route. E.g.
   * 
   * A .scope property or `scope` attribute can be set in an anchor tag so that URLObserver
   * knows which before route handler it needs to trigger before navigating to a new URL.
   * 
   * When .scope (or `scope`) is an empty string, it defaults to ':default', which is the 
   * default scope value when registering a route unless specified.
   * 
   * 1. <a href="/test/123">/test/456</a>
   *    - No before route handler will be triggered on link click as it is not a scoped link.
   * 
   * 2. <a href="/test/123" scope>/test/123</a>
   *    - Only before route handler registered to ':default' scope will be triggered.
   * 
   * 3. <a href="/test/123" scope="456">/test/456</a>
   *    - Only before route handler registered to '456' scope will be triggered.
   * 
   */
  scope: '',
});

/** Dynamically add new route without before route handler */
observer.add({ pathRegExp: /^\/test2$/i });

/** Call .disconnect() to stop observing history */
observer.disconnect();

/** Call .match() to determine if current URL is being observed by URLObserver */
const {
  /** Return true for a matched route */
  found,
  /**
   * Return URL parameters after matching the route RegExp with current URL. E.g.
   * 
   * 1. /^\/test/i
   *    - This does not output any matches
   * 2. /^\/test\/(?<test>[^\/]+)$/i
   *    - This matches URL like '/test/123' and returns { test: 123  }. However, this requires
   *      ES2018's RegExp named capture groups to work as expected.
   */
  matches,
} = observer.match();

/** Remove a route from the observer */
observer.remove(routes[0]);

/** Remove a before route handler from an observing route */
observer.remove(routes[1], '456');

/** Return the history entries */
observer.takeRecords();

/** Async-ly call .updateHistory to manually update to new URL */
await observer.updateHistory('/test/789');

/** 
 * Async-ly call .updateHistory to manually update to new URL and trigger before route handler
 * with defined scope value.
 */
await observer.updateHistory('/test/456', '456');
```

## API References

* [URLObserver]

## Contributing

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct][coc-url]. By participating in this project you agree to abide by its terms.

## License

[MIT License](https://motss.mit-license.org/) © Rong Sen Ng

<!-- References -->
[npm-url]: https://www.npmjs.com
[RegExp named capture groups]: https://github.com/tc39/proposal-regexp-named-groups
[typescript-url]: https://github.com/Microsoft/TypeScript
[URLObserver]: /API_REFERENCES.md
[vscode-url]: https://code.visualstudio.com

<!-- MDN -->
[array-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[boolean-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[function-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[map-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[number-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[object-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[promise-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[regexp-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[set-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[string-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String

<!-- Badges -->
[tippin-me-badge]: https://badgen.net/badge/%E2%9A%A1%EF%B8%8Ftippin.me/@igarshmyb/F0918E
[follow-me-badge]: https://flat.badgen.net/twitter/follow/igarshmyb?icon=twitter


[version-badge]: https://flat.badgen.net/npm/v/url-observer?icon=npm
[lit-element-version-badge]: https://flat.badgen.net/npm/v/lit-element/latest?icon=npm&label=lit-element
[node-version-badge]: https://flat.badgen.net/npm/node/url-observer
[mit-license-badge]: https://flat.badgen.net/npm/license/url-observer

[downloads-badge]: https://flat.badgen.net/npm/dm/url-observer
[total-downloads-badge]: https://flat.badgen.net/npm/dt/url-observer?label=total%20downloads
[packagephobia-badge]: https://flat.badgen.net/packagephobia/install/url-observer
[bundlephobia-badge]: https://flat.badgen.net/bundlephobia/minzip/url-observer

[daviddm-badge]: https://flat.badgen.net/david/dep/reallyland/url-observer
<!-- [circleci-badge]: https://flat.badgen.net/circleci/github/reallyland/url-observer?icon=circleci -->

[codebeat-badge]: https://codebeat.co/badges/123
[codacy-badge]: https://api.codacy.com/project/badge/Grade/123
[lgtm-badge]: https://flat.badgen.net/lgtm/grade/javascript/g/reallyland/url-observer?icon=lgtm
[coc-badge]: https://flat.badgen.net/badge/code%20of/conduct/pink

<!-- Links -->
[tippin-me-url]: https://tippin.me/@igarshmyb
[follow-me-url]: https://twitter.com/igarshmyb

[version-url]: https://www.npmjs.com/package/url-observer
[node-version-url]: https://nodejs.org/en/download
[mit-license-url]: /LICENSE

[downloads-url]: https://www.npmtrends.com/url-observer
[packagephobia-url]: https://packagephobia.now.sh/result?p=url-observer
[bundlephobia-url]: https://bundlephobia.com/result?p=url-observer

[circleci-url]: https://circleci.com/gh/reallyland/url-observer/tree/master
[daviddm-url]: https://david-dm.org/reallyland/url-observer

[codebeat-url]: https://codebeat.co/projects/<codebeat_path>
[codacy-url]: https://www.codacy.com/app/<codacy_path>
[lgtm-url]: https://lgtm.com/projects/g/<lgtm_path>
[coc-url]: /CODE-OF-CONDUCT.md
