import path from 'node:path';
import { expect, test, vi } from 'vitest';
import { scan } from '../src';

const fixtures = path.join(process.cwd(), 'test/fixtures');

const createConsoleMock = () => {
  let output = '';
  return {
    startMock: () => {
      vi.stubGlobal('console', {
        log: vi.fn((...args: any[]) => (output += args.join(' '))),
        error: vi.fn((...args: any[]) => (output += args.join(' '))),
        warn: vi.fn((...args: any[]) => (output += args.join(' '))),
      });
    },
    stopMock: () => {
      vi.unstubAllGlobals();
    },
    getOutput: () => output,
  };
};

test('auto scan deps in single project', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await scan([], {
    dir: path.join(fixtures, 'base-project'),
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});

test('specify packages to scan in single project', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await scan(['react', 'dayjs'], {
    dir: path.join(fixtures, 'base-project'),
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});

test('recursive scan deps in pnpm workspaces', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await scan([], {
    dir: path.join(fixtures, 'pnpm-workspace'),
    recursive: true,
    workspaceConcurrency: 1,
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});

test('specify packages to scan in all packages', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await scan(['react', 'dayjs'], {
    dir: path.join(fixtures, 'pnpm-workspace'),
    recursive: true,
    workspaceConcurrency: 1,
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});

test('recursive scan deps in yarn workspaces', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await scan([], {
    dir: path.join(fixtures, 'yarn-workspace'),
    recursive: true,
    workspaceConcurrency: 1,
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});
