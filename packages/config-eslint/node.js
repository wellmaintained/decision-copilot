import { resolve } from "node:path";
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "only-warn": onlyWarn,
    },
    rules: {
      ...typescript.configs.recommended.rules,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
  prettierConfig,
  {
    ignores: [
      // Ignore dotfiles
      ".*.js",
      "node_modules/",
      "lib/",
      // Ignore compiled files in src directory
      "src/**/*.js",
      "src/**/*.d.ts",
      "src/**/*.d.ts.map",
    ],
  },
];