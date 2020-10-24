import { executeServerCommand } from '@web/test-runner-commands';
import type { Frame } from 'playwright';

type A = Parameters<Frame['click']>;
interface B extends NonNullable<A[1]> {
  name?: string;
}

export async function frameClick(selector: A[0], options?: B): Promise<void> {
  return executeServerCommand('frame-click', { selector, options });
}
