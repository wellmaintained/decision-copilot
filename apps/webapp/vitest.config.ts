import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '@decision-copilot/config-vitest/nextjs'

const webappConfig = defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts']
  }
})

export default mergeConfig(baseConfig, webappConfig) 