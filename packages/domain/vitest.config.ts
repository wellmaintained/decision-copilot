import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/reflect.ts'],
    coverage: {
      thresholds: {
        global: {
          lines: 85,
          functions: 80,
          branches: 80,
          statements: 85
        }
      },
      reporter: ['text', 'json', 'html']
    }
  },
})