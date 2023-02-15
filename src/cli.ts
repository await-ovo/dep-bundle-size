#!/usr/bin/env node
import { cac } from 'cac';
import { scan } from '.';
import { add } from './add';
import { logger, RuntimeError } from './utils';
import { ERROR_MESSAGES } from './constants';
import { version } from '../package.json';

const errorHandler = (err: any) => {
  if (err instanceof RuntimeError) {
    logger.error(ERROR_MESSAGES[err.errorType](err.options), '\n', err.stack);
  } else {
    logger.error('%o', err);
  }
  process.exit(1);
};

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

const cli = cac('dep-bundle-size');

cli.help();
cli.version(version);

cli
  .command('[...packages]')
  .option('-i, --interactive', 'Select packages to scan')
  .option('-r, --recursive', 'Scan packages in every project of monorepo')
  .option('-d, --dir [dir]', 'Specify project root directory')
  .action(scan);

cli
  .command('add <...packages>')
  .option('-w, --warning', 'Use warning instead throw an error if ')
  .option('-d, --dir [dir]', 'Specify project root directory')
  .action(add);

cli.parse();
