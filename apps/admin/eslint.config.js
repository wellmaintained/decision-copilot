import baseConfig from '@decision-copilot/config-eslint/node.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  }
];