import type { TemplateResult } from 'lit-html';

export function lazyImport(
  filePath: string,
  callback: () => TemplateResult
): () => Promise<TemplateResult> {
  return async () => {
    await import(filePath)

    return callback();
  }
}
