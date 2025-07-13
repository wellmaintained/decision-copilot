import reactConfig from "@decision-copilot/config-eslint/react-internal.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
];