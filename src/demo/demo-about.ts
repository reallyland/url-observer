import '@material/mwc-button/mwc-button.js';
import '@material/mwc-dialog/mwc-dialog.js';
import {
  css,
  customElement,
  html,
  LitElement,
  TemplateResult,
} from 'lit-element';

const $name = 'demo-about';

@customElement($name)
export class DemoAbout extends LitElement {
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
  <h2>About</h2>
    `;
  }
}

declare global {
  interface HTMLAnchorElement {
    scope: string;
  }

  interface HTMLElementTagNameMap {
    [$name]: DemoAbout;
  }
}
