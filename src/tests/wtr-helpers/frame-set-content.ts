import { executeServerCommand } from '@web/test-runner-commands';
import type { Frame } from 'playwright';

type A = Parameters<Frame['setContent']>;
interface B extends NonNullable<A[1]> {
  name?: string;
}

export async function frameSetContent(content: A[0], options?: B): Promise<void> {
  return executeServerCommand('frame-set-content', { content, options });
}
