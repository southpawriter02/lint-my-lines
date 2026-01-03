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

module.exports = {
  rules: {
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
  },
};

