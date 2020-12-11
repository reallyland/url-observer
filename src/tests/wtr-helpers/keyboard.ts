import { executeServerCommand } from '@web/test-runner-commands';
import type { Keyboard } from 'playwright';

interface KeyboardActionOption {
  delay?: number;
}
type KeyboardAction = keyof Keyboard;
type KeyboardOption = {
  [K in KeyboardAction]: Parameters<Keyboard[K]> extends [key: string] ?
    { key: string } :
    Parameters<Keyboard[K]> extends [text: string] ?
      { text: string } :
      Parameters<Keyboard[K]> extends [text: string, option?: KeyboardActionOption] ?
        {
          option?: KeyboardActionOption;
          text: string,
        } :
        {
          key: string;
          option?: KeyboardActionOption;
        };
};

export interface KeyboardInstance {
  down(option: KeyboardOption['down']): Promise<void>;
  insertText(option: KeyboardOption['insertText']): Promise<void>;
  press(option: KeyboardOption['press']): Promise<void>;
  type(option: KeyboardOption['type']): Promise<void>;
  up(option: KeyboardOption['up']): Promise<void>;
}

export function keyboard(): KeyboardInstance {
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
