/**
 * This plugin is used to query the browser name when running tests.
 *
 * Possible values are `Chromium`, `Firefox`, or `Webkit`.
 *
 * @returns {import('@web/test-runner').TestRunnerPlugin} Plugin definition
 */
export function keyboardPlugin() {
  const commandName = 'keyboard';

  return {
    name: commandName,
    async executeCommand({ command, payload, session }) {
      if (command !== commandName || session.browser.type !== 'playwright') return;

      const page = session.browser.getPage(session.id);
      const { action, option } = payload ?? {};

      try {
        switch (action) {
          case 'down': {
            await page.keyboard.down(option?.key);
            break;
          }
          case 'insertText': {
            await page.keyboard.insertText(option?.text);
            break;
          }
          case 'press': {
            await page.keyboard.press(option?.key, option?.option);
            break;
          }
          case 'up': {
            await page.keyboard.up(option?.key);
            break;
          }
          case 'type': {
            await page.keyboard.type(option?.text, option?.option);
            break;
          }
          default:
            return false;
        }

        return true;
      } catch {
        return false;
      }
    },
  };
}
