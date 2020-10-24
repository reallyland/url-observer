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
      const { options, selector } = payload ?? {};

      try {
        const { name, ...restOptions } = options ?? {};

        for (const f of page.mainFrame().childFrames()) {
          if (f.name() !== name) continue;

          await f.click(selector, restOptions);
        }

        return true;
      } catch (e) {
        console.error(new Date().toJSON(), session.browser.name, e);
        return false;
      }
    },
  };
}
