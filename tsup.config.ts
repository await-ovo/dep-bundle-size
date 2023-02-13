import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['./src/cli.ts'],
  format: ['esm'],
  dts: true,
  target: 'esnext',
  external: ['fast-glob'],
});
