import { appendElement } from './append-element.js';

export interface AppendLinkResult {
  link: HTMLAnchorElement;
  removeLink(): void;
}

export function appendLink(href: string, option?: Record<string, unknown>): AppendLinkResult {
  const {
    element,
    removeElement,
  } = appendElement<HTMLAnchorElement>('a', {
    href: href ?? option?.href,
    '.textContent': href ?? option?.textContent,
    ...option,
  });

  return {
    link: element,
    removeLink: removeElement,
  };
}
