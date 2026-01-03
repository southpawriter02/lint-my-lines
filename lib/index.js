/**
 * @fileoverview An ESLint plugin to enforce a style guide for code comments.
 * @author Jules
 */
"use strict";

// Core rules
const enforceTodoFormat = require("./rules/enforce-todo-format");
const enforceFixmeFormat = require("./rules/enforce-fixme-format");
const enforceNoteFormat = require("./rules/enforce-note-format");
const noCommentedCode = require("./rules/no-commented-code");
const enforceCommentLength = require("./rules/enforce-comment-length");
const enforceCapitalization = require("./rules/enforce-capitalization");
const commentSpacing = require("./rules/comment-spacing");
const noObviousComments = require("./rules/no-obvious-comments");
const banSpecificWords = require("./rules/ban-specific-words");
const requireExplanationComments = require("./rules/require-explanation-comments");
const requireJsdoc = require("./rules/require-jsdoc");
const validJsdoc = require("./rules/valid-jsdoc");
const jsdocTypeSyntax = require("./rules/jsdoc-type-syntax");
const requireFileHeader = require("./rules/require-file-header");

// Language-specific rules (v0.10.0)
const validTsdoc = require("./rules/valid-tsdoc");
const vueTemplateComments = require("./rules/vue-template-comments");
const svelteTemplateComments = require("./rules/svelte-template-comments");

// Processors (v0.10.0)
const vueProcessor = require("./processors/vue");
const svelteProcessor = require("./processors/svelte");
const markdownProcessor = require("./processors/markdown");

const rules = {
  // Core rules
  "enforce-todo-format": enforceTodoFormat,
  "enforce-fixme-format": enforceFixmeFormat,
  "enforce-note-format": enforceNoteFormat,
  "no-commented-code": noCommentedCode,
  "enforce-comment-length": enforceCommentLength,
  "enforce-capitalization": enforceCapitalization,
  "comment-spacing": commentSpacing,
  "no-obvious-comments": noObviousComments,
  "ban-specific-words": banSpecificWords,
  "require-explanation-comments": requireExplanationComments,
  "require-jsdoc": requireJsdoc,
  "valid-jsdoc": validJsdoc,
  "jsdoc-type-syntax": jsdocTypeSyntax,
  "require-file-header": requireFileHeader,
  // Language-specific rules (v0.10.0)
  "valid-tsdoc": validTsdoc,
  "vue-template-comments": vueTemplateComments,
  "svelte-template-comments": svelteTemplateComments,
};

// Processors for Vue, Svelte, and Markdown
const processors = {
  ".vue": vueProcessor,
  ".svelte": svelteProcessor,
  ".md": markdownProcessor,
};

// Legacy configs (for .eslintrc format)
const legacyConfigs = {
  minimal: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
    },
  },

  recommended: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
    },
  },

  strict: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "error",
      "lint-my-lines/enforce-fixme-format": "error",
      "lint-my-lines/enforce-note-format": "error",
      "lint-my-lines/no-commented-code": "error",
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
      "lint-my-lines/enforce-capitalization": "error",
      "lint-my-lines/comment-spacing": "error",
      "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],
      "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],
      "lint-my-lines/require-explanation-comments": ["warn", {
        requireFor: ["regex", "bitwise"],
      }],
      "lint-my-lines/require-jsdoc": "warn",
      "lint-my-lines/valid-jsdoc": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
      "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }],
    },
  },
};

// Create plugin object for flat config
const plugin = { rules };

// Flat configs (for eslint.config.js format - ESLint v9+)
const flatConfigs = {
  "flat/minimal": {
    name: "lint-my-lines/flat/minimal",
    plugins: { "lint-my-lines": plugin },
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
    },
  },

  "flat/recommended": {
    name: "lint-my-lines/flat/recommended",
    plugins: { "lint-my-lines": plugin },
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
    },
  },

  "flat/strict": {
    name: "lint-my-lines/flat/strict",
    plugins: { "lint-my-lines": plugin },
    rules: {
      "lint-my-lines/enforce-todo-format": "error",
      "lint-my-lines/enforce-fixme-format": "error",
      "lint-my-lines/enforce-note-format": "error",
      "lint-my-lines/no-commented-code": "error",
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
      "lint-my-lines/enforce-capitalization": "error",
      "lint-my-lines/comment-spacing": "error",
      "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],
      "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],
      "lint-my-lines/require-explanation-comments": ["warn", {
        requireFor: ["regex", "bitwise"],
      }],
      "lint-my-lines/require-jsdoc": "warn",
      "lint-my-lines/valid-jsdoc": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
      "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }],
    },
  },
};

// Language-specific flat configs (v0.10.0)
const languageConfigs = {
  // TypeScript preset
  "flat/typescript": {
    name: "lint-my-lines/flat/typescript",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
      "lint-my-lines/valid-tsdoc": "warn",
    },
  },

  // TypeScript strict preset
  "flat/typescript-strict": {
    name: "lint-my-lines/flat/typescript-strict",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "lint-my-lines/enforce-todo-format": "error",
      "lint-my-lines/enforce-fixme-format": "error",
      "lint-my-lines/enforce-note-format": "error",
      "lint-my-lines/no-commented-code": "error",
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
      "lint-my-lines/enforce-capitalization": "error",
      "lint-my-lines/comment-spacing": "error",
      "lint-my-lines/jsdoc-type-syntax": ["error", { prefer: "typescript" }],
      "lint-my-lines/valid-tsdoc": ["error", { requireTypeParam: true }],
      "lint-my-lines/require-jsdoc": "warn",
      "lint-my-lines/valid-jsdoc": "warn",
    },
  },

  // React/JSX preset
  "flat/react": {
    name: "lint-my-lines/flat/react",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.jsx", "**/*.tsx"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
    },
  },

  // Vue preset
  "flat/vue": {
    name: "lint-my-lines/flat/vue",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.vue"],
    processor: "lint-my-lines/.vue",
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/vue-template-comments": "warn",
    },
  },

  // Svelte preset
  "flat/svelte": {
    name: "lint-my-lines/flat/svelte",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.svelte"],
    processor: "lint-my-lines/.svelte",
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/svelte-template-comments": "warn",
    },
  },

  // Markdown preset
  "flat/markdown": {
    name: "lint-my-lines/flat/markdown",
    plugins: { "lint-my-lines": plugin },
    files: ["**/*.md"],
    processor: "lint-my-lines/.md",
    rules: {
      // Relaxed rules for documentation code blocks
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/no-commented-code": "off", // Often intentional in docs
      "lint-my-lines/enforce-capitalization": "off", // Relaxed for examples
    },
  },
};

module.exports = {
  rules,
  processors,
  configs: {
    ...legacyConfigs,
    ...flatConfigs,
    ...languageConfigs,
  },
};
