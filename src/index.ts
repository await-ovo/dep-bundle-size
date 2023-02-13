import path from 'node:path';
import os from 'os';
import enquirer from 'enquirer';
import { table } from 'table';
import pLimit from 'p-limit';
import {
  findWorkspaceProjects,
  formatSize,
  formatTime,
  getDependencies,
  getDepInstalledVersion,
  getTimeFromSize,
  requestStats,
  RuntimeError,
} from './utils';
import { ErrorType } from './constants';

const { prompt } = enquirer;

const doScan = async ({
  projectDir,
  packageArgs,
  interactive,
}: {
  projectDir: string;
  packageArgs?: string[];
  interactive?: boolean;
}) => {
  const deps = getDependencies(path.join(projectDir, 'package.json'));

  let packages = packageArgs?.length ? packageArgs : Object.keys(deps);

  if (interactive) {
    ({ packages } = await prompt({
      type: 'multiselect',
      name: 'packages',
      message: 'Select packages to scan?',
      choices: packages,
    }));
  }

  if (!packages.length) {
    throw new RuntimeError(ErrorType.NoPackagesError);
  }

  const stats = await requestStats(
    packages.map(
      packageName =>
        `${packageName}@${
          getDepInstalledVersion(packageName) ?? deps[packageName] ?? 'latest'
        }`,
    ),
  );

  /* eslint-disable no-console */
  console.log(`Project ${projectDir} scan results:`);
  console.log(
    table(
      [
        ['Name', 'MIN', 'MIN + GZIP', 'SLOW 3G', 'EMERGING 4G'],
        ...stats.map(record => {
          const time = getTimeFromSize(record.gzip);
          return [
            `${record.name}@${record.version}`,
            formatSize(record.size),
            formatSize(record.gzip),
            formatTime(time.threeG),
            formatTime(time.fourG),
          ];
        }),
      ],
      {
        header: {
          alignment: 'center',
          content: 'Scan Results',
        },
      },
    ),
  );
  /* eslint-enable no-console */
};

export const scan = async (
  packageArgs: string[],
  options: { interactive?: boolean; recursive?: boolean },
) => {
  if (options.recursive && options.interactive) {
    throw new RuntimeError(ErrorType.RecursiveWithInteractiveError);
  }

  const rootProjectDir = process.cwd();

  const projects = [rootProjectDir];

  if (options.recursive) {
    projects.push(...(await findWorkspaceProjects(rootProjectDir)));
  }

  const limit = pLimit(os.cpus().length);

  await Promise.all(
    projects.map(projectDir =>
      limit(() =>
        doScan({
          projectDir,
          packageArgs,
          interactive: options.interactive,
        }),
      ),
    ),
  );
};
