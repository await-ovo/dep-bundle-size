import fs from 'node:fs';
import path from 'node:path';
import { got, HTTPError } from 'got';
import pLimit from 'p-limit';
import yaml from 'js-yaml';
import glob from 'fast-glob';
import { BUNDLE_PHOBIA_API, ErrorType, NPM_REGISTRY } from './constants';

const limit = pLimit(6);

export type Project = {
  name?: string;
  path: string;
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

export const logger = {
  log: (...args: any[]) => {
    process.stdout.write('\nINFO: ');
    // eslint-disable-next-line no-console
    console.log('[INFO]: ', ...args);
  },

  error: (...args: any[]) => {
    process.stderr.write('\nERROR: ');
    // eslint-disable-next-line no-console
    console.error(...args);
  },
  warn: (...args: any[]) => {
    process.stdout.write('\nWARN: ');
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
};

export class RuntimeError extends Error {
  errorType: ErrorType;
  options?: any;
  constructor(errorType: ErrorType, options?: any) {
    super();
    this.errorType = errorType;
    this.options = options;
  }
}

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export const detectPackageManager = (dir: string) => {
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
  dir?: string,
): string | undefined => {
  try {
    const packagePath = path.join(
      dir ?? process.cwd(),
      `node_modules/${specifier}/package.json`,
    );

    return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
  } catch (err) {
    logger.warn(
      `Can not get installed version of package ${specifier}, use version listed in package.json or latest instead`,
    );
  }
};

export const getDependencies = (file: string, projects: Project[]) => {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    const dependencies = json.dependencies ?? {};

    // remove local dependencies
    return Object.keys(dependencies)
      .filter(depName => !projects.find(project => project.name === depName))
      .reduce<Record<string, string>>((deps, depName) => {
        deps[depName] = dependencies[depName];
        return deps;
      }, {});
  } catch (err) {
    throw new RuntimeError(ErrorType.ParseJSONError, { file });
  }
};

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
    const json = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
    );

    workspacePatterns = json.workspaces ?? [];
  }

  return workspacePatterns?.length
    ? (
        await glob(workspacePatterns, {
          onlyDirectories: true,
          unique: true,
          absolute: true,
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
    unit = 'μs';
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
