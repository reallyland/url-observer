import '@material/mwc-button/mwc-button.js';
import '@material/mwc-dialog/mwc-dialog.js';
import {
  css,
  customElement,
  html,
  LitElement,
} from 'lit-element';
import type { TemplateResult } from 'lit-element';

import type { linkScopeKey } from '../constants.js';
import { router } from './router';

const $name = 'demo-not-found';

@customElement($name)
export class DemoNotFound extends LitElement {
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

  protected render(): TemplateResult {
    return html`
  <h2>Not Found</h2>
  <mwc-button @click=${this._goHome}>Go to home</mwc-button>
    `;
  }

  private _goHome() {
    router.updateHistory('/');
  }
}

declare global {
  interface HTMLAnchorElement {
    [linkScopeKey]: string;
  }

  interface HTMLElementTagNameMap {
    [$name]: DemoNotFound;
  }
}
