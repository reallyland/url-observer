import '@material/mwc-button/mwc-button.js';
import '@material/mwc-dialog/mwc-dialog.js';
import {
  css,
  customElement,
  html,
  LitElement,
} from 'lit-element';

const $name = 'demo-home';

@customElement($name)
export class DemoHome extends LitElement {
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
  <h2>Home</h2>
    `;
  }
}

declare global {
  interface HTMLAnchorElement {
    scope: string;
  }

  interface HTMLElementTagNameMap {
    [$name]: DemoHome;
  }
}
