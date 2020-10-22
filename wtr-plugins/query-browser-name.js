/**
 * This plugin is used to query the browser name when running tests.
 *
 * Possible values are `Chromium`, `Firefox`, or `Webkit`.
 *
 * @returns {import('@web/test-runner').TestRunnerPlugin} Plugin definition
 */
export function queryBrowserNamePlugin() {
  const commandName = 'query-browser-name';

  return {
    name: commandName,
    async executeCommand({ command, session }) {
      if (command !== commandName || session.browser.type !== 'playwright') return;

      return session.browser.name;
    },
  };
}
