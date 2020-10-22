/**
 * This plugin is used to query the browser name when running tests.
 *
 * Possible values are `Chromium`, `Firefox`, or `Webkit`.
 *
 * @returns {import('@web/test-runner').TestRunnerPlugin} Plugin definition
 */
export function pageClickPlugin() {
  const commandName = 'page-click';

  return {
    name: commandName,
    async executeCommand({ command, payload, session }) {
      if (command !== commandName || session.browser.type !== 'playwright') return;

      const page = session.browser.getPage(session.id);
      const { options, selector } = payload ?? {};

      try {
        await page.click(selector, options);
        return true;
      } catch {
        return false;
      }
    },
  };
}
