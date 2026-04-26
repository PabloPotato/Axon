import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts']
    }
  }
});
