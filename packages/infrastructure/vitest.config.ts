import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.spec.ts'
    ],
    exclude: ['lib/**/*', 'node_modules/**/*']
  }
})