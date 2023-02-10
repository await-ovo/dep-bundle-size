export const BUNDLE_PHOBIA_API = 'https://bundlephobia.com/api/size';

export enum ErrorType {
  ParseJSONError,
}

export const ERROR_MESSAGES = {
  [ErrorType.ParseJSONError]: ({ file }: { file: string }) =>
    `JSON parse failed. file: ${file}`,
};
