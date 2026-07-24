import { Mock, vi } from 'vitest';

/**
 * Typed replacement for Jasmine's `createSpyObj`/`SpyObj` under Vitest:
 * an object whose listed methods are `vi.fn()` mocks, usable both as the
 * mocked service (structurally) and for per-method mock assertions.
 */
export type SpyObj<T> = T & {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? T[K] & Mock : T[K];
};

export const createSpyObj = <T>(methodNames: (keyof T)[]): SpyObj<T> => {
  const spyObj: Record<PropertyKey, Mock> = {};
  methodNames.forEach(name => {
    spyObj[name] = vi.fn();
  });
  return spyObj as SpyObj<T>;
};
