import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/vitest.setup.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.spec.ts'
    ],
    exclude: ['lib/**/*', 'node_modules/**/*']
  }
})