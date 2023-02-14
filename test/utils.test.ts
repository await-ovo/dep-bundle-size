import path from 'node:path';
import { expect, test } from 'vitest';
import {
  detectPackageManager,
  findRootDirectory,
  findWorkspaceProjects,
  getConfig,
  getDepInstalledVersion,
  readJSON,
  requestStats,
} from '../src/utils';
import { ErrorType } from '../src/constants';

const fixtures = path.join(process.cwd(), 'test/fixtures');

test('read json with error', async () => {
  try {
    await readJSON(path.join(fixtures, 'base-project/pnpm-lock.yaml'));
  } catch (err: any) {
    expect(err.errorType).toBe(ErrorType.ParseJSONError);
  }
});

test('find root package directory', () => {
  const baseProject = path.join(fixtures, 'base-project');
  expect(findRootDirectory(baseProject)).toBe(baseProject);

  expect(
    findRootDirectory(
      path.join(fixtures, 'pnpm-workspace/packages/bar/node_modules'),
    ),
  ).toBe(path.join(fixtures, 'pnpm-workspace'));
});

test('get bundlephoia config', async () => {
  expect(await getConfig(path.join(fixtures, 'base-project'))).toEqual({
    maxSize: 100000,
  });
});

test('detect package manager', () => {
  expect(detectPackageManager(path.join(fixtures, 'base-project'))).toBe('npm');
  expect(detectPackageManager(path.join(fixtures, 'pnpm-workspace'))).toBe(
    'pnpm',
  );
  expect(detectPackageManager(path.join(fixtures, 'yarn-workspace'))).toBe(
    'yarn',
  );
});

test('should get installed version from node_modules', () => {
  expect(
    getDepInstalledVersion('react', path.join(fixtures, 'base-project')),
  ).toBe('18.2.0');
  expect(
    getDepInstalledVersion('react-intl', path.join(fixtures, 'pnpm-workspace')),
  ).toBe('6.2.8');
  expect(
    getDepInstalledVersion('react-intl', path.join(fixtures, 'yarn-workspace')),
  ).toBe('6.2.8');

  expect(
    getDepInstalledVersion(
      'react-dom',
      path.join('fixtures', 'pnpm-workspace'),
    ),
  ).toBe(undefined);

  expect(
    getDepInstalledVersion(
      'lodash',
      path.join(fixtures, 'yarn-workspace/packages/bar'),
    ),
  ).toBe('4.17.21');

  expect(
    getDepInstalledVersion(
      'lodash',
      path.join(fixtures, 'yarn-workspace/packages/foo'),
    ),
  ).toBe('3.10.1');

  expect(
    getDepInstalledVersion(
      'lodash',
      path.join(fixtures, 'yarn-workspace/packages/zoo'),
    ),
  ).toBe('4.17.21');
});

test('should response packages stats successfully', async () => {
  const stats = await requestStats([
    'qs@6.11.0',
    'lodash@4.17.21',
    'redux@4.2.1',
  ]);

  expect(stats).toMatchObject([
    {
      name: 'qs',
      size: 31782,
      gzip: 10047,
    },
    {
      name: 'lodash',
      size: 71563,
      gzip: 25060,
    },
    {
      name: 'redux',
      size: 5060,
      gzip: 1840,
    },
  ]);
});

test('should return all matched workspace packages', async () => {
  expect(
    await findWorkspaceProjects(path.join(fixtures, 'pnpm-workspace')),
  ).toMatchObject([
    {
      name: '@pkg/bar',
      path: path.join(fixtures, 'pnpm-workspace/packages/bar'),
    },
    {
      name: '@pkg/foo',
      path: path.join(fixtures, 'pnpm-workspace/packages/foo'),
    },
  ]);
  expect(
    await findWorkspaceProjects(path.join(fixtures, 'yarn-workspace')),
  ).toMatchObject([
    {
      name: '@pkg/bar',
      path: path.join(fixtures, 'yarn-workspace/packages/bar'),
    },
    {
      name: '@pkg/foo',
      path: path.join(fixtures, 'yarn-workspace/packages/foo'),
    },
    {
      name: '@pkg/zoo',
      path: path.join(fixtures, 'yarn-workspace/packages/zoo'),
    },
    {
      name: 'app-native-lib',
      path: path.join(fixtures, 'yarn-workspace/apps/native/lib'),
    },
  ]);
});
