import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import os from 'node:os';
import { createRequire } from 'node:module';
import { got, HTTPError } from 'got';
import pLimit from 'p-limit';
import yaml from 'js-yaml';
import glob from 'fast-glob';
import { cyan, yellow, red } from 'kolorist';
import { BUNDLE_PHOBIA_API, ErrorType } from './constants';

const limit = pLimit(6);

export type Project = {
  name?: string;
  path: string;
};

export type BundlephobiaConfig = {
  maxSize?: number;
  maxGzipSize?: number;
  maxOverallSize?: number;
  maxOverallGzipSize?: number;
};

export type PackageStatsResponse = {
  assets: {
    gzip: number;
    name: string;
    size: number;
    type: string;
  }[];
  dependencyCount: number;
  dependencySizes: {
    approximateSize: number;
    name: string;
  }[];
  description: string;
  gzip: number;
  hasJSModule: string;
  hasJSNext: string;
  hasSideEffects: string[];
  name: string;
  isModuleType: boolean;
  repository: string;
  scoped: boolean;
  size: number;
  version: string;
};

/* eslint-disable no-console */
export const logger = {
  log: (...args: any[]) => {
    console.log(cyan('Info: '), util.format(...args));
    console.log('\n');
  },
  error: (...args: any[]) => {
    console.error(red('Error: '), util.format(...args));
    console.log('\n');
  },
  warn: (...args: any[]) => {
    console.log(yellow('Warn: '), util.format(...args));
    console.log('\n');
  },
};
/* eslint-enable no-console */
export class RuntimeError extends Error {
  errorType: ErrorType;
  options?: any;
  constructor(errorType: ErrorType, options?: any) {
    super();
    this.errorType = errorType;
    this.options = options;
  }
}

const memoize = <T>(fn: (...args: string[]) => Promise<T>) => {
  const cached = new Map<string, T>();

  return async (...args: string[]) => {
    const key = args.join('_');
    if (!cached.has(key)) {
      const res = await fn(...args);
      cached.set(key, res);
      return res;
    } else {
      return cached.get(key)!;
    }
  };
};

export const readJSON = memoize(async file => {
  try {
    return JSON.parse(await fs.promises.readFile(file, 'utf8'));
  } catch (err) {
    throw new RuntimeError(ErrorType.ParseJSONError, { file });
  }
});

export const findRootDirectory = (dir: string): string => {
  if (dir === os.homedir()) {
    return process.cwd();
  }
  if (
    fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ||
    fs.existsSync(path.join(dir, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(dir, 'package-lock.json')) ||
    fs.existsSync(path.join(dir, 'yarn.lock'))
  ) {
    return dir;
  } else {
    return findRootDirectory(path.dirname(dir));
  }
};

export const getConfig = async (dir: string): Promise<BundlephobiaConfig> => {
  const { 'bundle-phobia': config = {} } = await readJSON(
    path.join(dir, 'package.json'),
  );
  return {
    maxSize: config['max-size'],
    maxGzipSize: config['max-gzip-size'],
    maxOverallSize: config['max-overall-size'],
    maxOverallGzipSize: config['max-overall-gzip-size'],
  };
};

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export const detectPackageManager = (dir: string): PackageManager => {
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  } else if (fs.existsSync(path.join(dir, 'package-lock.json'))) {
    return 'npm';
  } else if (fs.existsSync(path.join(dir, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
};

export const getDepInstalledVersion = (
  specifier: string,
  dir: string,
): string | undefined => {
  try {
    let packagePath = path.join(dir, `node_modules/${specifier}/package.json`);

    if (!fs.existsSync(packagePath)) {
      const require = createRequire(dir);
      const resolved = require.resolve(specifier);
      packagePath = path.join(
        resolved.substring(
          0,
          resolved.lastIndexOf(`node_modules/${specifier}`),
        ),
        `node_modules/${specifier}/package.json`,
      );
    }

    return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
  } catch (err) {
    logger.warn(
      `Can not get installed version of package ${specifier}, use version listed in package.json or latest instead`,
    );
  }
};

export const getDependencies = async (file: string, projects: Project[]) => {
  const json = await readJSON(file);
  const dependencies = json.dependencies ?? {};

  // remove local dependencies
  return Object.keys(dependencies)
    .filter(depName => !projects.find(project => project.name === depName))
    .reduce<Record<string, string>>((deps, depName) => {
      deps[depName] = dependencies[depName];
      return deps;
    }, {});
};

const requestPackageStats = memoize<PackageStatsResponse>(
  async (specifier: string) => {
    try {
      const packageStats: PackageStatsResponse = await got(
        `${BUNDLE_PHOBIA_API}?package=${specifier}&record=true`,
        {
          headers: {
            'User-Agent': 'bundle-phobia-cli',
            'X-Bundlephobia-User': 'bundle-phobia-cli',
          },
        },
      ).json();
      return packageStats;
    } catch (err) {
      if (err instanceof HTTPError) {
        const { code, message } = JSON.parse(err.response.body as string).error;
        throw new RuntimeError(ErrorType.RequestStatsError, {
          specifier,
          code,
          message,
        });
      } else {
        throw err;
      }
    }
  },
);

export const requestStats = async (specifiers: string[]) =>
  Promise.all(
    specifiers.map(specifier => limit(() => requestPackageStats(specifier))),
  );

export const findWorkspaceProjects = async (
  dir: string,
): Promise<Project[]> => {
  const packageManager = detectPackageManager(dir);

  let workspacePatterns: string[] = [];

  // pnpm workspaces
  if (
    packageManager === 'pnpm' &&
    fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))
  ) {
    const yamlContent = yaml.load(
      fs.readFileSync(path.join(dir, 'pnpm-workspace.yaml'), 'utf8'),
    ) as { packages?: string[] };
    workspacePatterns = yamlContent.packages ?? [];
  } else {
    const json = await readJSON(path.join(dir, 'package.json'));
    workspacePatterns = json.workspaces ?? [];
  }

  return workspacePatterns?.length
    ? (
        await glob(workspacePatterns, {
          onlyDirectories: true,
          unique: true,
          absolute: true,
          cwd: dir,
        })
      )
        .filter(matched => fs.existsSync(path.join(matched, 'package.json')))
        .map(directory => ({
          name: (
            JSON.parse(
              fs.readFileSync(path.join(directory, 'package.json'), 'utf8'),
            ) as { name?: string }
          ).name,
          path: directory,
        }))
    : [];
};

// To be consistent with bundlephobia Web UI, the formatTime and getTimeFromSize utility functions modified from:
// https://github.com/pastelsky/bundlephobia/blob/bundlephobia/utils/index.js#L27
export const formatSize = (value: number) => {
  let unit, size;
  if (Math.log10(value) < 3) {
    unit = 'B';
    size = value;
  } else if (Math.log10(value) < 6) {
    unit = 'kB';
    size = value / 1024;
  } else {
    unit = 'MB';
    size = value / 1024 / 1024;
  }

  return `${size.toFixed(2)}${unit}`;
};

export const formatTime = (value: number) => {
  let unit, size;
  if (value < 0.0005) {
    unit = '??s';
    size = Math.round(value * 1000000);
  } else if (value < 0.5) {
    unit = 'ms';
    size = Math.round(value * 1000);
  } else {
    unit = 's';
    size = value;
  }

  return `${size}${unit}`;
};

export const getTimeFromSize = (sizeInBytes: number) => {
  return {
    threeG: sizeInBytes / 1024 / (400 / 8),
    fourG: sizeInBytes / 1024 / (7000 / 8),
  };
};
