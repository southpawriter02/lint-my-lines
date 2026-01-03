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
                                    const fixedValue = `FIXME (BUG-XXX): ${description || "Add description here"}`;

                                    if (isBlock) {
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
