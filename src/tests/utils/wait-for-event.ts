const $w = window;

export function waitForEvent<T extends Event>(
  eventName: string,
  cb?: () => Promise<void> | void
): Promise<T | undefined> {
  return new Promise<T | undefined>(async (resolve) => {
    let listenerTimer = -1;

      const onEventFired = (ev: T) => {
        $w.clearTimeout(listenerTimer);
        $w.removeEventListener(eventName as never, onEventFired);
        resolve(ev);
      };

      $w.addEventListener(eventName as never, onEventFired);

      listenerTimer = $w.setTimeout(() => {
        $w.removeEventListener(eventName as never, onEventFired);
        resolve(undefined);
      }, 2e3);

      if (typeof(cb) === 'function') await cb();
  });
}
