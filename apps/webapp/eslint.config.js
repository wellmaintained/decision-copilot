import nextConfig from "@decision-copilot/config-eslint/next.js";
import typescriptParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true,
      },
    },
  },
];