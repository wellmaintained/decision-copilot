/** @type {import("eslint").Linter.Config[]} */
module.exports = (async () => {
  const { default: nodeConfig } = await import("@decision-copilot/config-eslint/node.js");
  
  return [
    ...nodeConfig,
    {
      languageOptions: {
        parserOptions: {
          project: true,
        },
      },
    },
  ];
})();