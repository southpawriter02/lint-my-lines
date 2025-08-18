/**
 * @fileoverview Enforces a standard format for TODO comments.
 * @author Jules
 */
"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a standard format for TODO comments",
      category: "Stylistic Issues",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#2-standardize-todo-comments"
    },
    schema: [], // no options
    messages: {
      invalidTodoFormat: "TODO comments must be in the format 'TODO (reference): description'."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const todoRegex = /^TODO\b\s*\(([^)]+)\):/i;

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          const value = comment.value.trim();

          if (value.toLowerCase().startsWith("todo")) {
            if (!todoRegex.test(value)) {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "invalidTodoFormat"
              });
            }
          }
        });
      }
    };
  }
};
