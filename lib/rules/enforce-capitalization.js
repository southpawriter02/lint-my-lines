/**
 * @fileoverview Enforces capitalization at the start of comments.
 * @author Jules
 */
"use strict";

const { getAllCommentsCached } = require("../utils/comment-utils");
const {
    shouldSkipByContext,
    COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Patterns to skip (don't require capitalization)
const SKIP_PATTERNS = [
    // JSDoc tags
    /^@\w+/,
    // URLs
    /^https?:\/\//,
    // eslint directives
    /^eslint/,
    // Code in backticks at start
    /^`[^`]+`/,
    // File paths
    /^[./\\]/,
    // Known lowercase keywords that are acceptable
    /^(e\.g\.|i\.e\.|etc\.|vs\.)/i,
];

/**
 * Check if a character is a lowercase letter
 * @param {string} char - The character to check
 * @returns {boolean} - True if lowercase letter
 */
function isLowerCase(char) {
    return /^[a-z]$/.test(char);
}

/**
 * Get the comment text content
 * @param {Object} comment - The comment object
 * @returns {string} - The comment text
 */
function getCommentText(comment) {
    let text = comment.value.trim();

    if (comment.type === "Block") {
        // Get first meaningful line for block comments
        const lines = text.split("\n").map(line =>
            line.replace(/^\s*\*?\s?/, "").trim()
        ).filter(line => line.length > 0);

        text = lines[0] || "";
    }

    return text;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce capitalization at the start of comments",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    ignoreInlineCode: {
                        type: "boolean",
                        description: "Ignore comments starting with backtick-wrapped code"
                    },
                    ignorePatterns: {
                        type: "array",
                        items: { type: "string" },
                        description: "Additional patterns to ignore"
                    },
                    commentContext: COMMENT_CONTEXT_SCHEMA
                },
                additionalProperties: false
            }
        ],
        messages: {
            notCapitalized: "Comments should start with an uppercase letter."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const ignoreInlineCode = options.ignoreInlineCode !== false;
        const ignorePatterns = (options.ignorePatterns || []).map(p => new RegExp(p));
        const commentContext = options.commentContext || {};

        return {
            Program() {
                const classifiedComments = getAllCommentsCached(sourceCode);

                for (const classified of classifiedComments) {
                    // v1.1.1: Check if we should skip this comment based on context
                    if (shouldSkipByContext(classified, commentContext)) {
                        continue;
                    }

                    const comment = classified.comment;
                    const text = getCommentText(comment);

                    // Skip empty comments
                    if (!text) continue;

                    // Check built-in skip patterns
                    let shouldSkip = false;
                    for (const pattern of SKIP_PATTERNS) {
                        if (pattern.test(text)) {
                            shouldSkip = true;
                            break;
                        }
                    }
                    if (shouldSkip) continue;

                    // Check custom ignore patterns
                    for (const pattern of ignorePatterns) {
                        if (pattern.test(text)) {
                            shouldSkip = true;
                            break;
                        }
                    }
                    if (shouldSkip) continue;

                    // Check if starts with inline code
                    if (ignoreInlineCode && text.startsWith("`")) continue;

                    // Find first letter
                    const firstChar = text.charAt(0);

                    // Only flag if it starts with a lowercase letter
                    if (isLowerCase(firstChar)) {
                        context.report({
                            node: null,
                            loc: comment.loc,
                            messageId: "notCapitalized",
                            fix: function (fixer) {
                                const originalValue = comment.value;
                                // Find the position of the first lowercase letter
                                const match = originalValue.match(/[a-z]/);
                                if (!match) return null;

                                const index = match.index;
                                const fixed = originalValue.substring(0, index) +
                                    originalValue.charAt(index).toUpperCase() +
                                    originalValue.substring(index + 1);

                                if (comment.type === "Block") {
                                    return fixer.replaceText(comment, `/*${fixed}*/`);
                                } else {
                                    return fixer.replaceText(comment, `//${fixed}`);
                                }
                            }
                        });
                    }
                }
            }
        };
    }
};
