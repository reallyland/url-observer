/**
 * This plugin is used to query the browser name when running tests.
 *
 * Possible values are `Chromium`, `Firefox`, or `Webkit`.
 *
 * @returns {import('@web/test-runner').TestRunnerPlugin} Plugin definition
 */
export function frameSetContentPlugin() {
  const commandName = 'frame-set-content';

  return {
    name: commandName,
    async executeCommand({ command, payload, session }) {
      if (command !== commandName || session.browser.type !== 'playwright') return;

      const page = session.browser.getPage(session.id);
      const { content, options } = payload ?? {};

      try {
        const { name, ...restOptions } = options ?? {};

        for (const f of page.mainFrame().childFrames()) {
          if (f.name() !== name) continue;

          await f.setContent(content, {
            waitUntil: 'load',
            ...restOptions,
          });
        }

        return true;
      } catch (e) {
        console.error(new Date().toJSON(), session.browser.name, e);
        return false;
      }
    },
  };
}
