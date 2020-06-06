import '@material/mwc-button/mwc-button.js';
import '@material/mwc-dialog/mwc-dialog.js';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';
import { cache } from 'lit-html/directives/cache.js';
import { until } from 'lit-html/directives/until.js';

import { popStateEventKey, pushStateEventKey } from '../constants.js';
import type { RouteEvent } from '../custom_typings.js';
import type { DialogClosedEvent, Page, RouteMatch as RouteMatch } from './custom_demo_typings.js';
import { routes } from './demo.js';
import { lazyImport } from './helpers/lazy-import.js';
import { router } from './router.js';

const $name = 'demo-view';
const $w = window;

@customElement($name)
export class DemoView extends LitElement {
  #updateNavigationPrompt!: (value: boolean) => Promise<void>;

  @property({ type: Boolean })
  private _navigationPrompt: boolean = false;

  @property({ type: Boolean })
  private _navigationPromptOpen: boolean = false;

  @property({ type: Boolean })
  private _notFound: boolean = false;

  @property({ type: String })
  private _page!: Page;

  #onLoad!: (ev: CustomEvent<RouteEvent<RouteMatch>>) => void;

  #pages = new Map<Page, () => Promise<TemplateResult>>([
    ['about', lazyImport('/dist/demo/demo-about.js', () => html`<demo-about></demo-about>`)],
    ['home', lazyImport('/dist/demo/demo-home.js', () => html`<demo-home></demo-home>`)],
    ['not-found', lazyImport('/dist/demo/demo-not-found.js', () => html`<demo-not-found></demo-not-found>`)],
    ['result', lazyImport('/dist/demo/demo-result.js', () => html`<demo-result></demo-result>`)],
  ]);

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

    this.#onLoad = ev => this._onLoad(ev);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    $w.removeEventListener(popStateEventKey, this.#onLoad);
    $w.removeEventListener(pushStateEventKey, this.#onLoad);
  }

  protected firstUpdated() {
    router.add<RouteMatch>({
      pathRegExp: routes.pages,
      scope: $name,
      handleEvent: async (matches) => {
        if (!this._navigationPrompt) this._navigationPrompt = true;

        this._navigationPromptOpen = true;

        return new Promise<boolean>((resolve) => {
          this.#updateNavigationPrompt = async (confirm: boolean) => {
            resolve(confirm);

            if (!confirm) return;

            this._page = matches.page || 'home';
          };
        });
      },
    });

    $w.addEventListener(popStateEventKey, this.#onLoad);
    $w.addEventListener(pushStateEventKey, this.#onLoad);
  }

  protected render() {
    return html`
  <h1>Pages</h1>

  <ul>
    <li>
      <a href="/" scope="${$name}">Home</a>
    </li>
    <li>
      <a href="/result?search=hello world+foo?+bar&size=10&page=0#result" scope="${$name}">Result with ?query and #hash</a>
    </li>
    <li>
      <a href="/about" scope="${$name}">About</a>
    </li>
    <li>
      <a href="/not-found" scope="${$name}">Not Found</a>
    </li>
  </ul>

  <section>
    ${cache(until(
      this.#pages.get(this._notFound ? 'not-found' : this._page)?.(),
      html`<div>Loading page...</div>`
    ))}
  </section>

  ${this._navigationPrompt ? (
  html`
  <mwc-dialog .open="${this._navigationPromptOpen}" @closed="${this._onNavigationPromptClosed}">
    <div>Navigate away?</div>
    <mwc-button slot="secondaryAction" dialogAction="dismiss">Cancel</mwc-button>
    <mwc-button slot="primaryAction" dialogAction="confirm" dialogInitialFocus>OK</mwc-button>
  </mwc-dialog>
  `
  ) : null}
    `;
  }

  private async _onLoad(ev: CustomEvent<RouteEvent<RouteMatch>>) {
    const { found, matches } = ev.detail;

    if (found) this._page = matches.page || 'home';
  }

  private _onNavigationPromptClosed(ev: CustomEvent<DialogClosedEvent>) {
    const didConfirm = ev.detail.action === 'confirm';

    this.#updateNavigationPrompt(didConfirm);
    this._navigationPromptOpen = false;
  }
}

declare global {
  interface HTMLAnchorElement {
    scope: string;
  }

  interface HTMLElementTagNameMap {
    [$name]: DemoView;
  }

  interface HTMLElementEventMap {
    'closed': CustomEvent<DialogClosedEvent>;
  }
}
