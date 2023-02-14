// vite.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 5000,
    coverage: {
      provider: 'c8', // or 'c8'
    },
  },
});
