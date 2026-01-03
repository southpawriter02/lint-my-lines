/**
 * @fileoverview An ESLint plugin to enforce a style guide for code comments.
 * @author Jules
 */
"use strict";

const enforceTodoFormat = require("./rules/enforce-todo-format");
const enforceFixmeFormat = require("./rules/enforce-fixme-format");
const enforceNoteFormat = require("./rules/enforce-note-format");

module.exports = {
  rules: {
    "enforce-todo-format": enforceTodoFormat,
    "enforce-fixme-format": enforceFixmeFormat,
    "enforce-note-format": enforceNoteFormat,
  },
};

