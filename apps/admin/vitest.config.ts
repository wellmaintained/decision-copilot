import { defineConfig } from 'vitest/config'
import baseConfig from '@decision-copilot/config-vitest/base'

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'node'
  }
})