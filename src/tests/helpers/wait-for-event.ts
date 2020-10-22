const $w = window;

export function waitForEvent<T extends Event>(
  eventName: string,
  cb?: () => Promise<void> | void
): Promise<T | undefined> {
  return new Promise<T>(async (y) => {
    let listenerTimer = -1;

    const onEventFired = (ev: T) => {
      $w.clearTimeout(listenerTimer);
      $w.removeEventListener(eventName as unknown as any, onEventFired);
      y(ev);
    };

    $w.addEventListener(eventName as unknown as any, onEventFired);

    listenerTimer = $w.setTimeout(() => {
      $w.removeEventListener(eventName as unknown as any, onEventFired);
      y();
    }, 2e3);

    if (typeof(cb) === 'function') await cb();
  });
}
