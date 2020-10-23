/**
 * This plugin is used to query the browser name when running tests.
 *
 * Possible values are `Chromium`, `Firefox`, or `Webkit`.
 *
 * @returns {import('@web/test-runner').TestRunnerPlugin} Plugin definition
 */
export function frameClickPlugin() {
  const commandName = 'frame-click';

  return {
    name: commandName,
    async executeCommand({ command, payload, session }) {
      if (command !== commandName || session.browser.type !== 'playwright') return;

      const page = session.browser.getPage(session.id);
      const { options, selector, name, url } = payload ?? {};

      try {
        const el = await page.frame({ url, name }).$(selector);

        if (el == null) return false;

        await el.click(options);

        /**
         * FIXME: The following code does not work as reliably.
         */
        // await page.frame({ name, url })?.click(selector, options);

        return true;
      } catch (e) {
        console.error(new Date().toJSON(), session.browser.name, e);
        return false;
      }
    },
  };
}
