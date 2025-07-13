import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '@decision-copilot/config-vitest/node'

const domainConfig = defineConfig({
  test: {
    setupFiles: ['./src/reflect.ts']
  }
})

export default mergeConfig(baseConfig, domainConfig)