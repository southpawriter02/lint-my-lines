/**
 * ESLint configuration for lint-my-lines project.
 * Uses standard ESLint rules for project linting.
 */
module.exports = {
  env: {
    node: true,
    es2020: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended"],
  rules: {
    // Standard ESLint rules for the project
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": "off", // Allow console for CLI and warnings
  },
  ignorePatterns: ["node_modules/", "coverage/", "tests/fixtures/"],
};
