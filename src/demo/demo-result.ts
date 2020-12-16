import '@material/mwc-button/mwc-button.js';
import '@material/mwc-dialog/mwc-dialog.js';
import {
  css,
  customElement,
  html,
  LitElement,
} from 'lit-element';

import { cache } from 'lit-html/directives/cache.js';
import { linkScopeKey, pushStateEventKey } from '../constants.js';
import type { Page } from './custom_demo_typings.js';
import { routes } from './demo.js';
import { router } from './router.js';

interface RouteMatch {
  page: Page;
  result: string;
}

const $name = 'demo-result';
const $w = window;

@customElement($name)
export class DemoResult extends LitElement {
  #handleResult!: () => void;
  #result: string = '';

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

  public constructor() {
    super();

    this.#handleResult = () => this._handlerResult();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    $w.removeEventListener(pushStateEventKey, this.#handleResult);
  }

  protected firstUpdated() {
    router.add({ pathRegExp: routes.result });

    this._handlerResult();
    $w.addEventListener(pushStateEventKey, this.#handleResult);
  }

  protected render() {
    return html`
  <h2>Results</h2>

  <ul>
    <li>
      <a href="/result/hello world">Hello World</a>
    </li>
    <li>
      <a href="/result/test">Test</a>
    </li>
  </ul>

  ${cache(
    this.#result ?
      html`
      <h3>Result (<code>${this.#result}</code>)</h3>
      ` :
      html`
      <code>
        <pre>Query</pre>
        <pre>${
        $w.location.search.slice(1).split('&').map((n) => {
          const [k, v] = n.split('=');

          const v2 = Number.isNaN(Number(v)) ? `'${v}'` : Number(v);

          return `${k}: ${v2}`;
        }).join('\n')
        }</pre>

        <pre>Hash</pre>
        <pre>${
          $w.location.hash.slice(1).split('&').map(n => `'${n}'`).join(', ')
        }</pre>
      </code>
      `
  )}
    `;
  }

  private _handlerResult() {
    const {
      found,
      params,
    } = router.match<RouteMatch>();

    if (found) {
      const { result } = params;

      this.#result = $w.decodeURI(result).replace(/ /gi, '+');
    } else {
      this.#result = '';
    }

    this.requestUpdate();
  }
}

declare global {
  interface HTMLAnchorElement {
    [linkScopeKey]: string;
  }

  interface HTMLElementTagNameMap {
    [$name]: DemoResult;
  }
}
