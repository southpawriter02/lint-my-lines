/**
 * @fileoverview Enforces a standard format for FIXME comments.
 * @author Jules
 */
"use strict";

const DEFAULT_PATTERN = "^FIXME\\s*\\(([^)]+)\\):";

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce a standard format for FIXME comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#fixme-for-known-bugs-that-need-fixing"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    pattern: {
                        type: "string",
                        description: "Custom regex pattern for FIXME format validation"
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            invalidFixmeFormat: "FIXME comments must be in the format 'FIXME (reference): description'."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const patternStr = options.pattern || DEFAULT_PATTERN;
        const fixmeRegex = new RegExp(patternStr, "i");

        /**
         * Check if a comment is inside a JSX expression container
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

                    if (value.toLowerCase().startsWith("fixme")) {
                        if (!fixmeRegex.test(value)) {
                            context.report({
                                node: null,
                                loc: comment.loc,
                                messageId: "invalidFixmeFormat",
                                fix: function (fixer) {
                                    // Extract the description after "FIXME" (with optional colon/whitespace)
                                    const match = value.match(/^FIXME\s*:?\s*(.*)$/i);
                                    const description = match ? match[1].trim() : "Add description here";
                                    const isBlock = comment.type === "Block";
                                    const inJSX = isInsideJSX(comment);
                                    const fixedValue = `FIXME (BUG-XXX): ${description || "Add description here"}`;

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
