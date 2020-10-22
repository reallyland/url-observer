import { executeServerCommand } from '@web/test-runner-commands';
import type { Frame, Page } from 'playwright';

type A = Parameters<Page['frame']>['0'] extends infer T ? T extends string ? never : T : never;
export interface FrameClickOptions extends A {
  selector: Parameters<Frame['click']>['0'];
  options: Parameters<Frame['click']>['1'];
}

export async function frameClick(options: FrameClickOptions): Promise<void> {
  return executeServerCommand('frame-click', { ...options });
}
