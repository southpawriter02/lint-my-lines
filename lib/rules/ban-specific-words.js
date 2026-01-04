/**
 * @fileoverview Ban specific words or phrases in comments.
 * @author Jules
 */
"use strict";

const { getAllCommentsCached } = require("../utils/comment-utils");
const { getCachedRegex } = require("../utils/performance-cache");

// Default banned words with optional replacements and reasons
const DEFAULT_BANNED_WORDS = [
    // Vague/unhelpful terms
    { word: "magic number", replacement: "named constant", reason: "Use named constants instead" },
    { word: "magic value", replacement: "named constant", reason: "Use named constants instead" },

    // Temporary markers that should use proper format
    { word: "fix later", replacement: "TODO (TICKET-XXX):", reason: "Use proper TODO format" },
    { word: "fix this", replacement: "FIXME (TICKET-XXX):", reason: "Use proper FIXME format" },
    { word: "hack", replacement: "workaround", reason: "Use 'workaround' with explanation" },
    { word: "kludge", replacement: "workaround", reason: "Use 'workaround' with explanation" },

    // Obsolete markers
    { word: "xxx", replacement: "TODO", reason: "Use standard TODO format" },

    // Unclear references
    { word: "obvious", reason: "If it's obvious, the comment may be unnecessary" },
    { word: "self-explanatory", reason: "If it's self-explanatory, the comment may be unnecessary" },
    { word: "clearly", reason: "Avoid assuming clarity; explain instead" },

    // Non-inclusive language
    { word: "whitelist", replacement: "allowlist", reason: "Use inclusive language" },
    { word: "blacklist", replacement: "blocklist", reason: "Use inclusive language" },
    { word: "master", replacement: "main/primary", reason: "Use inclusive language" },
    { word: "slave", replacement: "secondary/replica", reason: "Use inclusive language" },
];

/**
 * Escape special regex characters in a string
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if position is inside a URL
 * @param {string} text - The comment text
 * @param {number} matchIndex - The index of the match
 * @returns {boolean} - True if inside a URL
 */
function isInsideUrl(text, matchIndex) {
    const urlPattern = /https?:\/\/[^\s]+/g;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
        if (matchIndex >= match.index && matchIndex < match.index + match[0].length) {
            return true;
        }
    }
    return false;
}

/**
 * Check if position is inside backtick-wrapped code
 * @param {string} text - The comment text
 * @param {number} matchIndex - The index of the match
 * @returns {boolean} - True if inside backticks
 */
function isInsideBackticks(text, matchIndex) {
    const backtickPattern = /`[^`]+`/g;
    let match;
    while ((match = backtickPattern.exec(text)) !== null) {
        if (matchIndex >= match.index && matchIndex < match.index + match[0].length) {
            return true;
        }
    }
    return false;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Ban specific words or phrases in comments",
            category: "Best Practices",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    bannedWords: {
                        type: "array",
                        items: {
                            oneOf: [
                                { type: "string" },
                                {
                                    type: "object",
                                    properties: {
                                        word: { type: "string" },
                                        replacement: { type: "string" },
                                        reason: { type: "string" }
                                    },
                                    required: ["word"],
                                    additionalProperties: false
                                }
                            ]
                        },
                        description: "Words or phrases to ban"
                    },
                    caseSensitive: {
                        type: "boolean",
                        description: "Whether matching is case-sensitive (default: false)"
                    },
                    includeDefaults: {
                        type: "boolean",
                        description: "Include default banned words (default: true)"
                    },
                    wholeWord: {
                        type: "boolean",
                        description: "Match whole words only (default: true)"
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            bannedWord: "The word '{{word}}' is banned in comments. {{reason}}",
            bannedWordWithReplacement: "The word '{{word}}' is banned. Consider using '{{replacement}}' instead. {{reason}}"
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};

        const caseSensitive = options.caseSensitive === true;
        const includeDefaults = options.includeDefaults !== false;
        const wholeWord = options.wholeWord !== false;

        // Build banned words list
        const bannedWords = [];

        if (includeDefaults) {
            bannedWords.push(...DEFAULT_BANNED_WORDS);
        }

        // Add user-configured words
        if (options.bannedWords) {
            for (const item of options.bannedWords) {
                if (typeof item === "string") {
                    bannedWords.push({ word: item, replacement: null, reason: null });
                } else {
                    bannedWords.push(item);
                }
            }
        }

        // Pre-compile regex patterns with caching
        const patterns = bannedWords.map(item => {
            const flags = caseSensitive ? "g" : "gi";
            const escapedWord = escapeRegExp(item.word);
            const patternStr = wholeWord
                ? `\\b${escapedWord}\\b`
                : escapedWord;

            // Use cached regex compilation
            const result = getCachedRegex(patternStr, flags);
            return { ...item, pattern: result.regex };
        }).filter(item => item.pattern !== null);

        return {
            Program() {
                // Use cached comment collection
                const classifiedComments = getAllCommentsCached(sourceCode);

                for (const classified of classifiedComments) {
                    const comment = classified.comment;
                    const text = comment.value;

                    for (const { word, pattern, replacement, reason } of patterns) {
                        // Reset regex lastIndex for global patterns
                        pattern.lastIndex = 0;
                        const match = pattern.exec(text);

                        if (match) {
                            // Skip if inside URL or backticks
                            if (isInsideUrl(text, match.index) || isInsideBackticks(text, match.index)) {
                                continue;
                            }

                            const messageId = replacement ? "bannedWordWithReplacement" : "bannedWord";
                            const reasonText = reason || "This word/phrase is not recommended.";

                            context.report({
                                node: null,
                                loc: comment.loc,
                                messageId,
                                data: {
                                    word,
                                    replacement: replacement || "",
                                    reason: reasonText
                                },
                                fix: replacement ? function (fixer) {
                                    // Replace all occurrences of the banned word
                                    const fixPattern = new RegExp(
                                        wholeWord ? `\\b${escapeRegExp(word)}\\b` : escapeRegExp(word),
                                        caseSensitive ? "g" : "gi"
                                    );
                                    const newText = text.replace(fixPattern, replacement);
                                    const prefix = comment.type === "Block" ? "/*" : "//";
                                    const suffix = comment.type === "Block" ? "*/" : "";
                                    return fixer.replaceText(comment, `${prefix}${newText}${suffix}`);
                                } : null
                            });

                            // Only report first match per comment to avoid noise
                            break;
                        }
                    }
                }
            }
        };
    }
};
