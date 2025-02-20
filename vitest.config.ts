import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: [
      'lib/**/*.integration.test.ts',
      'lib/**/*.test.ts',
      'lib/**/*.spec.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/.trunk/**',
      '**/dist/**',
      '**/.next/**'
    ],
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['verbose'],
    typecheck: {
      enabled: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
}) 