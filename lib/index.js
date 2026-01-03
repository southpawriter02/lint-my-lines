/**
 * @fileoverview An ESLint plugin to enforce a style guide for code comments.
 * @author Jules
 */
"use strict";

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

const rules = {
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
};

const configs = {
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

module.exports = {
  rules,
  configs,
};
