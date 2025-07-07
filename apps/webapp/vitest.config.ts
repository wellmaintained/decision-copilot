import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: [
      'src/**/*.integration.test.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.spec.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/.trunk/**',
      '**/dist/**',
      '**/.next/**',
      '**/lib/**'
    ],
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['verbose'],
    typecheck: {
      enabled: false // Disable experimental typecheck to prevent exit code 130
    },
    coverage: {
      provider: 'v8',
      // TODO: Add thresholds once test foundation is established
      // thresholds: { global: { lines: 85, functions: 80, branches: 80, statements: 85 } },
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
}) 