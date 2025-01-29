import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/.trunk/**',
      '**/dist/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
}) 