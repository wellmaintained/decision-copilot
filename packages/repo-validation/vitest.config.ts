import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '@decision-copilot/config-vitest/base'

// Override to remove reflect-metadata setup since we don't need it for filesystem tests
const esmValidationConfig = defineConfig({
  test: {
    environment: 'node',
    // Remove reflect-metadata setup - not needed for file system validation
    setupFiles: []
  }
})

export default mergeConfig(baseConfig, esmValidationConfig)