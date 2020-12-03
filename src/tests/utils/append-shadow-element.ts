import { html, LitElement } from 'lit-element';

import type { AppendElementResult } from './append-element.js';

export interface AppendShadowElementResult<T extends HTMLElement> extends AppendElementResult<T> {
  component: HTMLElement;
}

export function appendShadowElement<T extends HTMLElement>(
  elementName: string,
  option?: Record<string, unknown>
): AppendShadowElementResult<T> {
  const element = document.createElement(elementName) as T;

  if (option) {
    for (const [k, v] of Object.entries(option)) {
      if (k.startsWith('.')) {
        (element as any)[k.slice(1)] = v;
      } else {
        element.setAttribute(k, String(v));
      }
    }
  }

  const ceName = `test-${Math.random().toString(16).slice(-7)}`;

  window.customElements.define(ceName, class extends LitElement {
    protected render() {
      return html`${element}`;
    }
  });

  const cElement = document.createElement(ceName);

  document.body.appendChild(cElement);

  return {
    element,
    component: cElement,
    removeElement() {
      if (cElement.parentElement) document.body.removeChild(cElement);
    },
  };
}
