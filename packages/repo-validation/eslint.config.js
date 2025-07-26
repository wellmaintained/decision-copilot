import baseConfig from '@decision-copilot/config-eslint/node.js'

export default [
  ...baseConfig,
  {
    ignores: ['vitest.config.ts', 'lib/', 'dist/', '**/*.tsbuildinfo']
  }
]