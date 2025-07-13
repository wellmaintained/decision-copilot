import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only include tests from src directory, exclude compiled output
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['lib/**/*', 'dist/**/*', '.next/**/*', 'node_modules/**/*'],
    coverage: {
      provider: 'v8',
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
  }
})