import type { TemplateResult } from 'lit-html';

export function lazyImport(
  filePath: string,
  callback: () => TemplateResult
): () => Promise<TemplateResult> {
  return () => import(filePath).then(callback);
}
