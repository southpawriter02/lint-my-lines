/**
 * @fileoverview Enforces proper spacing in comments.
 * @author Jules
 */
"use strict";

module.exports = {
    meta: {
        type: "layout",
        docs: {
            description: "Enforce proper spacing in comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md"
        },
        fixable: "whitespace",
        schema: [
            {
                type: "object",
                properties: {
                    requireSpaceAfterLine: {
                        type: "boolean",
                        description: "Require space after // in line comments"
                    },
                    requireSpaceAfterBlock: {
                        type: "boolean",
                        description: "Require space after * in block comments"
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            missingSpaceAfterLine: "Expected space after '//'.",
            missingSpaceAfterBlock: "Expected space after '*' in block comment."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const requireSpaceAfterLine = options.requireSpaceAfterLine !== false;
        const requireSpaceAfterBlock = options.requireSpaceAfterBlock !== false;

        return {
            Program() {
                const comments = sourceCode.getAllComments();

                comments.forEach(comment => {
                    if (comment.type === "Line" && requireSpaceAfterLine) {
                        // Check line comments - the value doesn't include //
                        const value = comment.value;

                        // Skip empty comments and special markers
                        if (value === "" || value.startsWith("/")) return;

                        // Check if first char is not a space (and comment is not empty)
                        if (value.length > 0 && value.charAt(0) !== " " && value.charAt(0) !== "\t") {
                            context.report({
                                node: null,
                                loc: comment.loc,
                                messageId: "missingSpaceAfterLine",
                                fix: function (fixer) {
                                    return fixer.replaceText(comment, `// ${value}`);
                                }
                            });
                        }
                    }

                    if (comment.type === "Block" && requireSpaceAfterBlock) {
                        const value = comment.value;
                        const lines = value.split("\n");

                        // For single-line block comments: /* text */
                        if (lines.length === 1) {
                            // Check if there's no space at the start
                            if (value.length > 0 && value.charAt(0) !== " " && value.charAt(0) !== "*" && value.charAt(0) !== "\t") {
                                context.report({
                                    node: null,
                                    loc: comment.loc,
                                    messageId: "missingSpaceAfterBlock",
                                    fix: function (fixer) {
                                        return fixer.replaceText(comment, `/* ${value} */`);
                                    }
                                });
                            }
                        } else {
                            // For multi-line block comments, check each line with *
                            let hasIssue = false;

                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i];
                                // Match lines that start with * followed by non-space
                                const match = line.match(/^(\s*)\*([^\s/*])/);
                                if (match) {
                                    hasIssue = true;
                                    break;
                                }
                            }

                            if (hasIssue) {
                                context.report({
                                    node: null,
                                    loc: comment.loc,
                                    messageId: "missingSpaceAfterBlock",
                                    fix: function (fixer) {
                                        const fixedLines = lines.map(line => {
                                            // Add space after * if missing
                                            return line.replace(/^(\s*)\*([^\s/*])/, "$1* $2");
                                        });
                                        return fixer.replaceText(comment, `/*${fixedLines.join("\n")}*/`);
                                    }
                                });
                            }
                        }
                    }
                });
            }
        };
    }
};
