import nodeConfig from "@decision-copilot/config-eslint/node.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
];