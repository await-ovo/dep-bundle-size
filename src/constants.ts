export const BUNDLE_PHOBIA_API = 'https://bundlephobia.com/api/size';

export enum ErrorType {
  ParseJSONError,
  RequestStatsError,
  NoPackagesError,
  RecursiveWithInteractiveError,
}

export const ERROR_MESSAGES = {
  [ErrorType.ParseJSONError]: ({ file }: { file: string }) =>
    `JSON parse failed. file: ${file}`,
  [ErrorType.RequestStatsError]: ({
    code,
    message,
    specifier,
  }: {
    code: string;
    message: string;
    specifier: string;
  }) =>
    `Request ${specifier} failed.\n         code: ${code}.\n         message: ${message}`,
  [ErrorType.NoPackagesError]: () =>
    'No Packages to scan, the packages to be scanned can be specified in the following way:\n1. dependencies in package.json 2. set packages manually, e.g. dep-bundle-size react react-dom',
  [ErrorType.RecursiveWithInteractiveError]: () =>
    'Can not use --recursive(-r) and packages --interactive(-i) at the same time',
};
