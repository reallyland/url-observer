import { executeServerCommand } from '@web/test-runner-commands';
import type { ProductType } from '@web/test-runner-playwright';

export async function queryBrowserName(): Promise<ProductType | undefined> {
  return executeServerCommand('query-browser-name');
}
