import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './base.js'

const nodeConfig = defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['reflect-metadata']
  }
})

export default mergeConfig(baseConfig, nodeConfig)