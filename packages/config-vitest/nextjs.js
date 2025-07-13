import { defineConfig, mergeConfig } from 'vitest/config'
import path from 'path'
import baseConfig from './base.js'

const nextjsConfig = defineConfig({
  test: {
    include: [
      'src/**/*.integration.test.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      '__tests__/**/*.test.ts',
      '__tests__/**/*.spec.ts'
    ],
    environment: 'node',
    testTimeout: 10000,
    reporters: ['verbose'],
    typecheck: {
      enabled: false // Disable experimental typecheck to prevent exit code 130
    },
    coverage: {
      // Override to disable thresholds for Next.js apps during development
      thresholds: undefined,
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
      '@': path.resolve(process.cwd(), './')
    }
  }
})

export default mergeConfig(baseConfig, nextjsConfig)