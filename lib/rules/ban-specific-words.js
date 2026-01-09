/**
 * @fileoverview Ban specific words or phrases in comments.
 * @author Jules
 */
"use strict";

const {
    getAllCommentsCached,
    isInsideUrl,
    isInsideInlineCode,
    isInsideCodeBlock,
} = require("../utils/comment-utils");
const { getCachedRegex } = require("../utils/performance-cache");
const {
    shouldSkipByContext,
    COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

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
                    },
                    ignoreUrls: {
                        type: "boolean",
                        description: "Ignore matches inside URLs (default: true)"
                    },
                    ignoreCodeBlocks: {
                        type: "boolean",
                        description: "Ignore matches inside markdown code blocks (default: true)"
                    },
                    ignoreInlineCode: {
                        type: "boolean",
                        description: "Ignore matches inside backtick-wrapped code (default: true)"
                    },
                    ignoreRegex: {
                        type: "string",
                        description: "Custom regex pattern - matches inside are ignored"
                    },
                    commentContext: COMMENT_CONTEXT_SCHEMA
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
        const commentContext = options.commentContext || {};

        // v1.1.2: Ignore options
        const ignoreUrlsOpt = options.ignoreUrls !== false;
        const ignoreCodeBlocksOpt = options.ignoreCodeBlocks !== false;
        const ignoreInlineCodeOpt = options.ignoreInlineCode !== false;
        const ignoreRegexOpt = options.ignoreRegex ? new RegExp(options.ignoreRegex, "gi") : null;

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
                    // v1.1.1: Check if we should skip this comment based on context
                    if (shouldSkipByContext(classified, commentContext)) {
                        continue;
                    }

                    const comment = classified.comment;
                    const text = comment.value;

                    for (const { word, pattern, replacement, reason } of patterns) {
                        // Reset regex lastIndex for global patterns
                        pattern.lastIndex = 0;
                        const match = pattern.exec(text);

                        if (match) {
                            // v1.1.2: Skip based on ignore options
                            if (ignoreUrlsOpt && isInsideUrl(text, match.index)) {
                                continue;
                            }
                            if (ignoreCodeBlocksOpt && isInsideCodeBlock(text, match.index)) {
                                continue;
                            }
                            if (ignoreInlineCodeOpt && isInsideInlineCode(text, match.index)) {
                                continue;
                            }
                            if (ignoreRegexOpt) {
                                // Check if match is inside any custom ignore pattern matches
                                ignoreRegexOpt.lastIndex = 0;
                                let ignoreMatch;
                                let shouldIgnore = false;
                                while ((ignoreMatch = ignoreRegexOpt.exec(text)) !== null) {
                                    if (match.index >= ignoreMatch.index &&
                                        match.index < ignoreMatch.index + ignoreMatch[0].length) {
                                        shouldIgnore = true;
                                        break;
                                    }
                                }
                                if (shouldIgnore) continue;
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
