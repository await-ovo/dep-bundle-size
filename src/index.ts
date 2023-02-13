import path from 'node:path';
import os from 'os';
import enquirer from 'enquirer';
import { table } from 'table';
import pLimit from 'p-limit';
import ora from 'ora';
import {
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

const { prompt } = enquirer;

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

  const spinner = ora({
    text: `Project ${relativeName} ...`,
    color: 'yellow',
  }).start();

  const deps = getDependencies(path.join(projectDir, 'package.json'), projects);

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
    logger.warn(`No Packages to scan in project: ${projectDir}`);
    spinner.fail();
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

  spinner.text = `Project ${relativeName} completed:`;
  spinner.succeed();

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
