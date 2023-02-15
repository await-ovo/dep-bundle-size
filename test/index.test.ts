import path from 'node:path';
import { expect, test } from 'vitest';
import { createConsoleMock } from './utils';
import { scan } from '../src';

const fixtures = path.join(process.cwd(), 'test/fixtures');

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
