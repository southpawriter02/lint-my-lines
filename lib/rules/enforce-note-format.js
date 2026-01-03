/**
 * @fileoverview Enforces a standard format for NOTE comments.
 * @author Jules
 */
"use strict";

const DEFAULT_PATTERN = "^NOTE\\s*\\(([^)]+)\\):";

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce a standard format for NOTE comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#note-for-explanatory-remarks"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    pattern: {
                        type: "string",
                        description: "Custom regex pattern for NOTE format validation"
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            invalidNoteFormat: "NOTE comments must be in the format 'NOTE (reference): description'."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const patternStr = options.pattern || DEFAULT_PATTERN;
        const noteRegex = new RegExp(patternStr, "i");

        return {
            Program() {
                const comments = sourceCode.getAllComments();

                comments.forEach(comment => {
                    const value = comment.value.trim();

                    if (value.toLowerCase().startsWith("note")) {
                        if (!noteRegex.test(value)) {
                            context.report({
                                node: null,
                                loc: comment.loc,
                                messageId: "invalidNoteFormat",
                                fix: function (fixer) {
                                    // Extract the description after "NOTE" (with optional colon/whitespace)
                                    const match = value.match(/^NOTE\s*:?\s*(.*)$/i);
                                    const description = match ? match[1].trim() : "Add description here";
                                    const isBlock = comment.type === "Block";
                                    const fixedValue = `NOTE (author): ${description || "Add description here"}`;

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
