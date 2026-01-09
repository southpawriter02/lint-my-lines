/**
 * @fileoverview Enforces minimum and maximum comment length.
 * @author Jules
 */
"use strict";

const { getAllCommentsCached, classifyComment } = require("../utils/comment-utils");
const {
    shouldSkipByContext,
    COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Regex to match URLs
const URL_REGEX = /https?:\/\/[^\s]+/g;

/**
 * Strip comment markers and get the text content
 * @param {Object} comment - The comment object
 * @returns {string} - The comment text without markers
 */
function getCommentText(comment) {
    let text = comment.value;

    if (comment.type === "Block") {
        // Remove leading/trailing whitespace and * prefixes on each line
        text = text
            .split("\n")
            .map(line => line.replace(/^\s*\*?\s?/, "").trim())
            .join(" ")
            .trim();
    }

    return text.trim();
}

/**
 * Calculate the effective length, optionally ignoring URLs
 * @param {string} text - The comment text
 * @param {boolean} ignoreUrls - Whether to ignore URLs
 * @returns {number} - The effective length
 */
function calculateLength(text, ignoreUrls) {
    if (ignoreUrls) {
        // Remove URLs from the text before calculating length
        text = text.replace(URL_REGEX, "").trim();
    }
    return text.length;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce minimum and maximum comment length",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#keep-line-lengths-reasonable"
        },
        schema: [
            {
                type: "object",
                properties: {
                    minLength: {
                        type: "integer",
                        minimum: 0,
                        description: "Minimum comment length (optional)"
                    },
                    maxLength: {
                        type: "integer",
                        minimum: 1,
                        description: "Maximum comment length"
                    },
                    ignoreUrls: {
                        type: "boolean",
                        description: "Whether to ignore URLs in length calculation"
                    },
                    commentContext: COMMENT_CONTEXT_SCHEMA
                },
                additionalProperties: false
            }
        ],
        messages: {
            tooShort: "Comment is too short ({{length}} chars). Minimum is {{min}} characters.",
            tooLong: "Comment is too long ({{length}} chars). Maximum is {{max}} characters."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const minLength = options.minLength;
        const maxLength = options.maxLength || 120;
        const ignoreUrls = options.ignoreUrls !== false; // default true
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

                    // Skip JSDoc and special comments
                    if (text.startsWith("@") || text.startsWith("eslint")) continue;

                    const length = calculateLength(text, ignoreUrls);

                    if (minLength !== undefined && length < minLength) {
                        context.report({
                            node: null,
                            loc: comment.loc,
                            messageId: "tooShort",
                            data: { length, min: minLength }
                        });
                    }

                    if (length > maxLength) {
                        context.report({
                            node: null,
                            loc: comment.loc,
                            messageId: "tooLong",
                            data: { length, max: maxLength }
                        });
                    }
                }
            }
        };
    }
};
