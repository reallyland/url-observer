import { executeServerCommand } from '@web/test-runner-commands';
import type { Keyboard } from 'playwright';

type KeyboardAction = keyof Keyboard;
type KeyboardOption = {
  [K in KeyboardAction]: Parameters<Keyboard[K]> extends [key: string] ?
    { key: string } :
    Parameters<Keyboard[K]> extends [text: string] ?
      { text: string } :
      Parameters<Keyboard[K]> extends [text: string, option?: any] ?
        {
          option?: {
            delay?: number;
          };
          text: string,
        } :
        {
          key: string;
          option?: {
            delay?: number;
          };
        };
};

export function keyboard(): any {
  const fn = async (
    action: KeyboardAction,
    option?: KeyboardOption[KeyboardAction]
  ): Promise<void> => {
    await executeServerCommand('keyboard', { action, option });
  };

  return {
    async down(option: KeyboardOption['down']) {
      return fn('down', option);
    },
    async insertText(option: KeyboardOption['insertText']) {
      return fn('insertText', option);
    },
    async press(option: KeyboardOption['press']) {
      return fn('press', option);
    },
    async type(option: KeyboardOption['type']) {
      return fn('type', option);
    },
    async up(option: KeyboardOption['up']) {
      return fn('up', option);
    },
  };
}
