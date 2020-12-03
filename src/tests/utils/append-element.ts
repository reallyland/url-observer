export interface AppendElementResult<T extends HTMLElement> {
  element: T;
  removeElement(): void;
}

export function appendElement<T extends HTMLElement>(
  elementName: string,
  option?: Record<string, unknown>
): AppendElementResult<T> {
  const el = document.createElement(elementName) as T;

  if (option) {
    for (const [k, v] of Object.entries(option)) {
      if (k.startsWith('.')) {
        (el as any)[k.slice(1)] = v;
      } else {
        el.setAttribute(k, typeof(v) === 'string' ? v : JSON.stringify(v));
      }
    }
  }

  document.body.appendChild(el);

  return {
    element: el,
    removeElement() {
      const p = el.parentElement;

      try {
        if (p) document.body.removeChild(el);
      } catch {
        /** Do nothing */
        throw p;
      }
    },
  };
}
