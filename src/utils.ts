import fs from 'node:fs';
import path from 'node:path';
import { got } from 'got';
import pLimit from 'p-limit';
import { BUNDLE_PHOBIA_API, ErrorType } from './constants';

export class RuntimeError extends Error {
  errorType: ErrorType;
  options?: Record<string, string>;
  constructor(errorType: ErrorType, options?: Record<string, string>) {
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

export const findRootDirectory = () => {};

export const getWorkspacePackages = () => {};

export const getDepInstalledVersion = (specifier: string) => {
  const packagePath = path.join(
    process.cwd(),
    `node_modules/${specifier}/package.json`,
  );

  return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
};

export const getDependencies = (file: string) => {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Object.keys(json.dependencies ?? {});
  } catch (err) {
    throw new RuntimeError(ErrorType.ParseJSONError, { file });
  }
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

const requestPackageStats = async (specifier: string) => {
  const packageStats: PackageStatsResponse = await got(
    `${BUNDLE_PHOBIA_API}?package=${specifier}&record=true`,
  ).json();
  return packageStats;
};

export const requestStats = async (specifiers: string[]) => {
  const limit = pLimit(6);

  return await Promise.all(
    specifiers.map(specifier => limit(() => requestPackageStats(specifier))),
  );
};
