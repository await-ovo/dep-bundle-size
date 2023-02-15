import path from 'node:path';
import { expect, test } from 'vitest';
import { createConsoleMock } from './utils';
import { add } from '../src/add';

const fixtures = path.join(process.cwd(), 'test/fixtures');

test('should add dependency in monorepo package successfully', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await add(['styled-components@5.3.6 '], {
    dir: path.join(fixtures, 'pnpm-workspace/bar'),
    warning: true,
    dryRun: true,
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});

test('should throw an error about exceeding size config', async () => {
  try {
    await add(['styled-components@5.3.6 '], {
      dir: path.join(fixtures, 'base-project'),
    });
  } catch (err: any) {
    expect(err?.message).toContain('Can not install styled-components@5.3.6');
  }
});

test('should ignore exceeding size error', async () => {
  const { getOutput, startMock, stopMock } = createConsoleMock();
  startMock();
  await add(['styled-components@5.3.6 '], {
    dir: path.join(fixtures, 'base-project'),
    warning: true,
    dryRun: true,
  });
  stopMock();
  expect(getOutput()).toMatchSnapshot();
});
