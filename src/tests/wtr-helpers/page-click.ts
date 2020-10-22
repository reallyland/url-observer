import { executeServerCommand } from '@web/test-runner-commands';
import type { Page } from 'playwright';

export async function pageClick(...[selector, options]: Parameters<Page['click']>): Promise<void> {
  return executeServerCommand('page-click', { options, selector });
}
