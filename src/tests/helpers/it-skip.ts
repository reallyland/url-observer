import type { ProductType } from '@web/test-runner-playwright';
import type { PendingTestFunction, TestFunction } from 'mocha';

export function itSkip(
  productTypes: ProductType[],
  browserName: ProductType
): PendingTestFunction | TestFunction {
  return productTypes.some(n => n === browserName) ? it.skip : it;
}
