import { spawn } from 'node:child_process';
import { spinner } from '@clack/prompts';
import {
  detectPackageManager,
  findRootDirectory,
  formatSize,
  getConfig,
  logger,
  requestStats,
} from './utils';
import type { PackageStatsResponse, BundlephobiaConfig } from './utils';

const checkConstraints = ({
  constraints,
  config,
  stats,
  warning,
}: {
  constraints: { key: keyof BundlephobiaConfig; name: string }[];
  stats: PackageStatsResponse[];
  config: BundlephobiaConfig;
  warning?: boolean;
}) => {
  for (const constraint of constraints) {
    const limit = config[constraint.key];
    if (!limit) {
      continue;
    }
    const exceeded = stats.filter(({ size }) => size > limit);

    const hint = `Can not install ${exceeded
      .map(
        ({ name, version, size }) => `${name}@${version}(${formatSize(size)})`,
      )
      .join(',')}, Since their ${
      constraint.name
    } is larger than the configured(${formatSize(limit)}).`;
    if (warning) {
      logger.warn(hint);
    } else {
      throw new Error(hint);
    }
  }

  const { overallSize, overallGzipSize } = stats.reduce<{
    overallSize: number;
    overallGzipSize: number;
  }>(
    (sizes, { size, gzip }) => {
      sizes.overallSize += size;
      sizes.overallGzipSize += gzip;
      return sizes;
    },
    {
      overallSize: 0,
      overallGzipSize: 0,
    },
  );

  if (config.maxOverallSize && overallSize > config.maxOverallSize) {
    const hint = `Can not install ${stats
      .map(
        ({ name, version, size }) => `${name}@${version}(${formatSize(size)})`,
      )
      .join(
        ',',
      )}, Since their total size is larger than the configured(${formatSize(
      config.maxOverallSize,
    )}).`;

    if (warning) {
      logger.warn(hint);
    } else {
      throw new Error(hint);
    }
  }

  if (config.maxGzipSize && overallGzipSize > config.maxGzipSize) {
    const hint = `Can not install ${stats
      .map(
        ({ name, version, gzip }) => `${name}@${version}(${formatSize(gzip)})`,
      )
      .join(
        ',',
      )}, Since their total size is larger than the configured(${formatSize(
      config.maxGzipSize,
    )}).`;
    if (warning) {
      logger.warn(hint);
    } else {
      throw new Error(hint);
    }
  }
};

const doAdd = async ({
  packages,
  cwd,
  rootProjectDir,
}: {
  packages: string[];
  cwd: string;
  rootProjectDir: string;
}) => {
  const packageManager = detectPackageManager(rootProjectDir);

  spawn(
    packageManager,
    [packageManager === 'npm' ? 'install' : 'add', ...packages],
    {
      cwd,
      stdio: 'inherit',
    },
  );
};

export const add = async (
  packages: string[],
  options: {
    warning?: boolean;
  },
) => {
  const checkSpinner = spinner();
  checkSpinner.start('Checking constraints');
  const rootProjectDir = findRootDirectory(process.cwd());
  const config = await getConfig(rootProjectDir);

  const stats = await requestStats(packages);

  checkConstraints({
    constraints: [
      { name: 'max-size', key: 'maxSize' },
      { name: 'max-gzip-size', key: 'maxGzipSize' },
    ],
    config,
    warning: options.warning,
    stats,
  });

  checkSpinner.stop('Checking constraints completed');

  await doAdd({
    packages,
    cwd: process.cwd(),
    rootProjectDir,
  });
};
