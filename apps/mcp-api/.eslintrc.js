/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@decision-copilot/config-eslint/node.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};