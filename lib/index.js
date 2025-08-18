/**
 * @fileoverview An ESLint plugin to enforce a style guide for code comments.
 * @author Jules
 */
"use strict";

const enforceTodoFormat = require("./rules/enforce-todo-format");

module.exports = {
  rules: {
    "enforce-todo-format": enforceTodoFormat,
  },
};
