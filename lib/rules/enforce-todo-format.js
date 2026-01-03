/**
 * @fileoverview Enforces a standard format for TODO comments.
 * @author Jules
 */
"use strict";

const DEFAULT_PATTERN = "^TODO\\s*\\(([^)]+)\\):";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a standard format for TODO comments",
      category: "Stylistic Issues",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#2-standardize-todo-comments"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Custom regex pattern for TODO format validation"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      invalidTodoFormat: "TODO comments must be in the format 'TODO (reference): description'."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};
    const patternStr = options.pattern || DEFAULT_PATTERN;
    const todoRegex = new RegExp(patternStr, "i");

    /**
     * Check if a comment is inside a JSX expression container.
     * In JSX, comments must be block comments wrapped in braces.
     * @param {Object} comment - ESLint comment object
     * @returns {boolean} True if inside JSX expression
     */
    function isInsideJSX(comment) {
      const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });
      const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });

      // Check if wrapped in JSX expression container braces
      return (
        tokenBefore && tokenBefore.value === "{" &&
        tokenAfter && tokenAfter.value === "}"
      );
    }

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
                messageId: "invalidTodoFormat",
                fix: function(fixer) {
                  // Extract the description after "TODO" (with optional colon/whitespace)
                  const match = value.match(/^TODO\s*:?\s*(.*)$/i);
                  const description = match ? match[1].trim() : "Add description here";
                  const isBlock = comment.type === "Block";
                  const inJSX = isInsideJSX(comment);
                  const fixedValue = `TODO (TICKET-XXX): ${description || "Add description here"}`;

                  // Always use block comments in JSX context
                  if (isBlock || inJSX) {
                    return fixer.replaceText(comment, `/* ${fixedValue} */`);
                  } else {
                    return fixer.replaceText(comment, `// ${fixedValue}`);
                  }
                }
              });
            }
          }
        });
      }
    };
  }
};
