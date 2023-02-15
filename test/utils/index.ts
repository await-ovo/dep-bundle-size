import { vi } from 'vitest';

export const createConsoleMock = () => {
  let output = '';
  return {
    startMock: () => {
      const fn = (...args: any[]) => (output += args.join(' '));
      vi.stubGlobal('console', {
        log: vi.fn(fn),
        error: vi.fn(fn),
        warn: vi.fn(fn),
      });
    },
    stopMock: () => {
      vi.unstubAllGlobals();
    },
    getOutput: () => output,
  };
};
