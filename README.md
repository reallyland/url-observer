<div align="center" style="text-align: center;">
  <h1 style="border-bottom: none;">url-observer</h1>

  <p>URLObserver observes URL changes in a web browser</p>
</div>

<hr />

<!-- [![Follow me][follow-me-badge]][follow-me-url] -->

[![Version][version-badge]][version-url]
[![lit-element][lit-element-version-badge]][lit-element-url]
[![Node version][node-version-badge]][node-version-url]
[![MIT License][mit-license-badge]][mit-license-url]

[![Downloads][downloads-badge]][downloads-url]
[![Total downloads][total-downloads-badge]][downloads-url]
[![Packagephobia][packagephobia-badge]][packagephobia-url]
[![Bundlephobia][bundlephobia-badge]][bundlephobia-url]

[![Dependency Status][daviddm-badge]][daviddm-url]
<!-- [![CircleCI][circleci-badge]][circleci-url] -->

[![codebeat badge][codebeat-badge]][codebeat-url]
[![Codacy Badge][codacy-badge]][codacy-url]
[![Language grade: JavaScript][lgtm-badge]][lgtm-url]
[![Code of Conduct][coc-badge]][coc-url]

> Better element for the web

## Table of contents <!-- omit in toc -->

- [Pre-requisites](#pre-requisites)
- [Installation](#installation)
- [Usage](#usage)
  - [HTML (with native ES modules)](#html-with-native-es-modules)
  - [JS/ TS file (w/ native ES modules)](#js-ts-file-w-native-es-modules)
- [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
- [License](#license)

## Pre-requisites

- [Java 8][java-url] _(`web-component-tester` works without any issue with Java 8)_
- [Node.js][nodejs-url] >= 8.16.0
- [NPM][npm-url] >= 6.4.1 ([NPM][npm-url] comes with [Node.js][nodejs-url], no separate installation is required.)
- (Optional for non-[VS Code][vscode-url] users) [Syntax Highlighting for lit-html in VS Code][vscode-lit-html-url]
- [web-component-tester][web-component-tester-url] >= 6.9.2 (For running tests, it's recommended to install globally on your system due to its insanely huge install size by running `npm i -g web-component-tester`.)

## Installation

```sh
# Install via NPM
$ npm install url-observer
```

## Usage

### HTML (with native ES modules)

```html
<!-- For the sake of brevity, the HTML below is just for reference -->
<!doctype html>
<html>
  <head>
    <!-- Native ES modules -->
    <script type="module" src="/path/to/my-element.js"></script>
  </head>

  <body>
    <!-- Element declaration -->
    <my-element></my-element>
  </body>
</html>
```

### JS/ TS file (w/ native ES modules)

```ts
import { css, html, LitElement } from 'lit-element';
import 'url-observer.js';

class MainApp extends LitElement {
  public static styles = [
    css`
    :host {
      display: block;
    }

    * {
      box-sizing: border-box;
    }
    `,
  ];

  protected render() {
    return html`
    <my-element></my-element>
    `;
  }
}
```

## Contributing

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct][coc-url]. By participating in this project you agree to abide by its terms.

## License

[MIT License](https://motss.mit-license.org/) © Rong Sen Ng

<!-- References -->
[typescript-url]: https://github.com/Microsoft/TypeScript
[java-url]: https://www.java.com/en/download
[nodejs-url]: https://nodejs.org
[npm-url]: https://www.npmjs.com
[node-releases-url]: https://nodejs.org/en/download/releases
[vscode-url]: https://code.visualstudio.com
[vscode-lit-html-url]: https://github.com/mjbvz/vscode-lit-html
[web-component-tester-url]: https://github.com/Polymer/tools/tree/master/packages/web-component-tester
[lit-element-url]: https://github.com/Polymer/lit-element

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
<!-- [follow-me-badge]: https://flat.badgen.net/twitter/follow/Rong Sen Ng?icon=twitter -->

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
<!-- [follow-me-url]: https://twitter.com/Rong Sen Ng?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=url-observer -->

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
