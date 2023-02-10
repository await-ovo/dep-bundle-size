#!/usr/bin/env node
import { cac } from 'cac';
import { scan } from '.';
import { add } from './add';
import { version } from '../package.json';

const cli = cac('dep-bundle-size');

cli.help();
cli.version(version);

cli
  .command('[...packages]')
  .option('-i, --interactive', 'Select packages to scan')
  .option('-r, --recursive', 'Select packages to scan')
  .action(scan);

cli
  .command('add <...packages>')
  .option('-i, --interactive', 'should report interactiveliy')
  .option('-w, --warning', 'use warning instead error')
  .action(add);

cli.parse();
