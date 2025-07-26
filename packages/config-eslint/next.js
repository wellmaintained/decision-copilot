import { resolve } from "node:path";
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import onlyWarn from "eslint-plugin-only-warn";
import importPlugin from "eslint-plugin-import";
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
      "import": importPlugin,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": "warn",
      
      // 🚨 ESM Compliance Rules - Firebase OAuth Dependency
      // These rules prevent CommonJS regression that breaks Firebase OAuth authentication
      
      // Forbid CommonJS imports/exports that break Firebase SDK
      "import/no-commonjs": "error",
      "@typescript-eslint/no-require-imports": "error", 
      "@typescript-eslint/no-var-requires": "error",
      
      // Prefer ES6 imports over CommonJS
      "import/no-nodejs-modules": "off", // Allow Node.js built-ins via ES6 imports
      "import/prefer-default-export": "off", // Don't force default exports
      "import/no-default-export": "off", // Allow default exports when needed
      
      // Enforce ES6 import/export syntax
      "import/first": "error", // Imports should come first
      "import/no-duplicates": "error", // No duplicate imports
      "import/order": ["error", {
        "groups": [
          "builtin",   // Node.js built-ins
          "external",  // npm packages  
          "internal",  // Internal modules
          "parent",    // Parent directories
          "sibling",   // Same directory
          "index"      // Index files
        ],
        "newlines-between": "never",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
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