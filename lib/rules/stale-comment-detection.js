/**
 * @fileoverview Rule to detect comments referencing non-existent code.
 * @author Jules
 */
"use strict";

const { getAllCommentsCached } = require("../utils/comment-utils");
const { collectIdentifiersCached } = require("../utils/ast-utils");
const { getCachedRegex } = require("../utils/performance-cache");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Detect comments that reference identifiers not in the file",
      category: "Best Practices",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          checkBacktickRefs: {
            type: "boolean",
            description: "Check backtick-quoted identifiers (default: true)",
          },
          checkExplicitRefs: {
            type: "boolean",
            description: "Check 'the X function' patterns (default: true)",
          },
          ignorePatterns: {
            type: "array",
            items: { type: "string" },
            description: "Regex patterns for identifiers to ignore",
          },
          minIdentifierLength: {
            type: "integer",
            minimum: 1,
            description: "Minimum identifier length to check (default: 3)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      staleRef:
        "Comment references '{{identifier}}' which does not exist in this file.",
      possibleStaleRef:
        "Comment may reference '{{identifier}}' which was not found. Consider updating.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const checkBacktickRefs = options.checkBacktickRefs !== false;
    const checkExplicitRefs = options.checkExplicitRefs !== false;
    const minIdentifierLength = options.minIdentifierLength || 3;

    const sourceCode = context.getSourceCode();

    // Compile ignore patterns with caching
    const ignorePatterns = (options.ignorePatterns || []).map((p) => {
      const result = getCachedRegex(p);
      return result.regex;
    }).filter(Boolean);

    // Use cached identifier collection (will be populated on first access)
    let identifiers = null;

    // Common words to ignore (not code identifiers)
    const COMMON_WORDS = new Set([
      "the",
      "this",
      "that",
      "will",
      "does",
      "should",
      "must",
      "can",
      "may",
      "might",
      "would",
      "could",
      "has",
      "have",
      "had",
      "been",
      "being",
      "are",
      "were",
      "was",
      "for",
      "with",
      "from",
      "into",
      "when",
      "where",
      "what",
      "which",
      "while",
      "about",
      "above",
      "below",
      "between",
      "before",
      "after",
      "during",
      "through",
      "also",
      "only",
      "just",
      "more",
      "most",
      "other",
      "some",
      "such",
      "each",
      "every",
      "both",
      "all",
      "any",
      "few",
      "many",
      "much",
      "own",
      "same",
      "too",
      "very",
      "well",
      "then",
      "than",
      "now",
      "here",
      "there",
      "not",
      "but",
      "and",
      "yet",
      "nor",
      "how",
      "why",
      "use",
      "used",
      "using",
      "see",
      "get",
      "set",
      "new",
      "old",
      "add",
      "remove",
      "delete",
      "update",
      "check",
      "test",
      "call",
      "return",
      "value",
      "data",
      "type",
      "name",
      "code",
      "file",
      "line",
      "case",
      "note",
      "todo",
      "fixme",
      "bug",
      "fix",
      "issue",
      "error",
      "warning",
      "info",
      "log",
      "debug",
      "api",
      "url",
      "html",
      "css",
      "dom",
      "http",
      "json",
      "xml",
      "sql",
    ]);

    // Patterns for explicit references like "the X function"
    const EXPLICIT_REF_PATTERNS = [
      /the\s+`([A-Za-z_$][A-Za-z0-9_$]*)`/gi,
      /`([A-Za-z_$][A-Za-z0-9_$]*)`\s+(?:function|method|class|variable|constant|property)/gi,
      /(?:see|call|use|invoke)\s+`([A-Za-z_$][A-Za-z0-9_$]*)`/gi,
    ];

    // Pattern for backtick-quoted identifiers
    const BACKTICK_REF_PATTERN = /`([A-Za-z_$][A-Za-z0-9_$]*)`/g;

    /**
     * Check if identifier should be ignored
     * @param {string} id - Identifier to check
     * @returns {boolean} True if should be ignored
     */
    function shouldIgnore(id) {
      // Check length
      if (id.length < minIdentifierLength) {
        return true;
      }

      // Check common words
      if (COMMON_WORDS.has(id.toLowerCase())) {
        return true;
      }

      // Check ignore patterns
      for (const pattern of ignorePatterns) {
        if (pattern.test(id)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Extract backtick-quoted identifiers from comment
     * @param {string} text - Comment text
     * @returns {Array<string>} Array of identifiers
     */
    function extractBacktickRefs(text) {
      const refs = [];
      let match;

      BACKTICK_REF_PATTERN.lastIndex = 0;
      while ((match = BACKTICK_REF_PATTERN.exec(text)) !== null) {
        refs.push(match[1]);
      }

      return refs;
    }

    /**
     * Extract explicit references from comment
     * @param {string} text - Comment text
     * @returns {Array<string>} Array of identifiers
     */
    function extractExplicitRefs(text) {
      const refs = [];

      for (const pattern of EXPLICIT_REF_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
          refs.push(match[1]);
        }
      }

      return refs;
    }

    /**
     * Check a comment for stale references
     * @param {Object} comment - ESLint comment object
     */
    function checkComment(comment) {
      const text = comment.value;
      const refsToCheck = new Set();

      // Extract backtick references
      if (checkBacktickRefs) {
        for (const ref of extractBacktickRefs(text)) {
          refsToCheck.add(ref);
        }
      }

      // Extract explicit references
      if (checkExplicitRefs) {
        for (const ref of extractExplicitRefs(text)) {
          refsToCheck.add(ref);
        }
      }

      // Check each reference
      for (const ref of refsToCheck) {
        if (shouldIgnore(ref)) {
          continue;
        }

        if (!identifiers.has(ref)) {
          // Determine message based on how strong the reference is
          const isBacktickRef = new RegExp(`\`${ref}\``).test(text);
          const messageId = isBacktickRef ? "staleRef" : "possibleStaleRef";

          context.report({
            node: null,
            loc: comment.loc,
            messageId,
            data: {
              identifier: ref,
            },
          });
        }
      }
    }

    return {
      // Check comments at the end (using cached utilities)
      "Program:exit"() {
        // Use cached identifier collection
        identifiers = collectIdentifiersCached(sourceCode);

        // Use cached comment collection
        const classifiedComments = getAllCommentsCached(sourceCode);
        for (const classified of classifiedComments) {
          checkComment(classified.comment);
        }
      },
    };
  },
};
