import path from 'node:path';
import os from 'os';
import { multiselect, spinner } from '@clack/prompts';
import { table } from 'table';
import pLimit from 'p-limit';
import { bold } from 'kolorist';
import {
  findRootDirectory,
  findWorkspaceProjects,
  formatSize,
  formatTime,
  getDependencies,
  getDepInstalledVersion,
  getTimeFromSize,
  logger,
  requestStats,
  RuntimeError,
} from './utils';
import { ErrorType } from './constants';
import type { Project } from './utils';

const doScan = async ({
  project,
  projects,
  rootProjectDir,
  packageArgs,
  interactive,
}: {
  project: Project;
  projects: Project[];
  rootProjectDir: string;
  packageArgs?: string[];
  interactive?: boolean;
}) => {
  const { path: projectDir } = project;
  const relativeProjectPath = path.relative(rootProjectDir, projectDir);
  const relativeName = relativeProjectPath === '' ? './' : relativeProjectPath;
  const scanSpinner = spinner();

  const deps = await getDependencies(
    path.join(projectDir, 'package.json'),
    projects,
  );

  let packages = packageArgs?.length ? packageArgs : Object.keys(deps);

  if (interactive) {
    packages = (await multiselect({
      message: 'Select packages to scan.',
      options: packages.map(packageName => ({
        value: packageName,
      })),
    })) as string[];
  }

  scanSpinner.start(`Scan ${bold(relativeName)} start`);

  if (!packages.length) {
    logger.warn(`No Packages to scan in project: ${bold(projectDir)}`);
    scanSpinner.stop(`Skip ${bold(relativeName)}`);
    return;
  }

  const stats = await requestStats(
    packages.map(
      packageName =>
        `${packageName}@${
          getDepInstalledVersion(packageName, projectDir) ??
          deps[packageName] ??
          'latest'
        }`,
    ),
  );

  scanSpinner.stop(`Scan ${bold(relativeName)} completed`);

  /* eslint-disable no-console */
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
    '\n',
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

  const rootProjectDir = findRootDirectory(process.cwd());

  const projects: Project[] = [
    {
      name: '.',
      path: rootProjectDir,
    },
  ];

  if (options.recursive) {
    projects.push(...(await findWorkspaceProjects(rootProjectDir)));
  }

  const limit = pLimit(os.cpus().length);

  await Promise.all(
    projects.map(project =>
      limit(() =>
        doScan({
          project,
          rootProjectDir,
          projects,
          packageArgs,
          interactive: options.interactive,
        }),
      ),
    ),
  );
};
