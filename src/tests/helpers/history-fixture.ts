import type { MockRecord } from './history-mock.js';

export function historyFixture(url?: string, type?: MockRecord['type']) {
  const originalUrl = url ?? window.location.href;

  return function restore() {
    if ((type ?? 'push') === 'push') {
      window.history.pushState({}, '', originalUrl);
    } else {
      window.history.replaceState({}, '', originalUrl);
    }
  };
}
