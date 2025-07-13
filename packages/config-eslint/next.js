import { resolve } from "node:path";
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        JSX: "readonly",
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "@next/next": nextPlugin,
      "only-warn": onlyWarn,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
  {
    ignores: [
      ".*.js",
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
    ],
  },
];