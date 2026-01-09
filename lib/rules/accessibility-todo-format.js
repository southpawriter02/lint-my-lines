/**
 * @fileoverview Enforces a standard format for accessibility TODO comments.
 * @author Jules
 */
"use strict";

const DEFAULT_PATTERN = "^(?:A11Y-TODO|ALLY-TODO)\\s*\\(([^)]+)\\):";
const WCAG_PATTERN = "WCAG-\\d+\\.\\d+\\.\\d+";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a standard format for accessibility TODO comments",
      category: "Accessibility",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/accessibility-todo-format.md"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Custom regex pattern for A11Y-TODO format validation"
          },
          requireWcagReference: {
            type: "boolean",
            description: "Require WCAG guideline reference in the TODO"
          },
          allowedPrefixes: {
            type: "array",
            items: { type: "string" },
            description: "Accepted prefixes for accessibility TODOs (default: A11Y-TODO)"
          },
          wcagPattern: {
            type: "string",
            description: "Custom pattern for WCAG references"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      invalidA11yTodoFormat: "Accessibility TODO must follow format 'A11Y-TODO (reference): description'.",
      missingWcagReference: "Accessibility TODO should include a WCAG guideline reference (e.g., WCAG-2.1.1)."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};
    const patternStr = options.pattern || DEFAULT_PATTERN;
    const requireWcagReference = options.requireWcagReference || false;
    const allowedPrefixes = options.allowedPrefixes || ["A11Y-TODO", "ALLY-TODO"];
    const wcagPatternStr = options.wcagPattern || WCAG_PATTERN;

    const a11yTodoRegex = new RegExp(patternStr, "i");
    const wcagRegex = new RegExp(wcagPatternStr, "i");

    // Build regex to detect any accessibility TODO prefix
    const prefixPattern = allowedPrefixes.map(p => p.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|");
    const detectA11yTodo = new RegExp(`^(${prefixPattern})`, "i");

    /**
     * Check if a comment is inside a JSX expression container.
     * In JSX, comments must be block comments wrapped in braces.
     * @param {Object} comment - ESLint comment object
     * @returns {boolean} True if inside JSX expression
     */
    function isInsideJSX(comment) {
      const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });
      const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });

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

          // Check if this is an accessibility TODO
          if (detectA11yTodo.test(value)) {
            // Check if it matches the proper format
            if (!a11yTodoRegex.test(value)) {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "invalidA11yTodoFormat",
                fix: function(fixer) {
                  // Extract the description after the prefix
                  const match = value.match(/^(?:A11Y-TODO|ALLY-TODO)\s*:?\s*(.*)$/i);
                  const description = match ? match[1].trim() : "Add description here";
                  const isBlock = comment.type === "Block";
                  const inJSX = isInsideJSX(comment);
                  const fixedValue = `A11Y-TODO (WCAG-X.X.X): ${description || "Add description here"}`;

                  if (isBlock || inJSX) {
                    return fixer.replaceText(comment, `/* ${fixedValue} */`);
                  } else {
                    return fixer.replaceText(comment, `// ${fixedValue}`);
                  }
                }
              });
            } else if (requireWcagReference) {
              // Check if it has a WCAG reference
              const referenceMatch = value.match(/\(([^)]+)\)/);
              if (referenceMatch && !wcagRegex.test(referenceMatch[1])) {
                context.report({
                  node: null,
                  loc: comment.loc,
                  messageId: "missingWcagReference"
                });
              }
            }
          }
        });
      }
    };
  }
};
