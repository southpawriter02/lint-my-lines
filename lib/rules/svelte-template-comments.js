/**
 * @fileoverview Rule to lint HTML comments in Svelte component markup.
 * @author Jules
 */
"use strict";

const HTML_COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;

// Default banned words (subset for template context)
const DEFAULT_BANNED_WORDS = [
  { word: "hack", replacement: "workaround" },
  { word: "xxx", replacement: "TODO" },
  { word: "fixme", replacement: "FIXME (reference):" },
  { word: "todo", replacement: "TODO (reference):" },
];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce comment style in Svelte component markup",
      category: "Svelte",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          checkTodoFormat: {
            type: "boolean",
            description: "Check TODO comment format",
            default: true,
          },
          checkFixmeFormat: {
            type: "boolean",
            description: "Check FIXME comment format",
            default: true,
          },
          checkBannedWords: {
            type: "boolean",
            description: "Check for banned words",
            default: true,
          },
          bannedWords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                word: { type: "string" },
                replacement: { type: "string" },
              },
              required: ["word"],
            },
            description: "Custom banned words",
          },
          maxLength: {
            type: "number",
            description: "Maximum comment length",
            default: 0,
          },
          requireCapitalization: {
            type: "boolean",
            description: "Require comments to start with capital letter",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidTodoFormat:
        "Svelte template TODO comment should use format: <!-- TODO (reference): description -->",
      invalidFixmeFormat:
        "Svelte template FIXME comment should use format: <!-- FIXME (reference): description -->",
      bannedWord:
        'Avoid using "{{word}}" in comments. {{suggestion}}',
      commentTooLong:
        "Svelte template comment exceeds {{maxLength}} characters (found {{length}}).",
      notCapitalized:
        "Svelte template comment should start with a capital letter.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const checkTodoFormat = options.checkTodoFormat !== false;
    const checkFixmeFormat = options.checkFixmeFormat !== false;
    const checkBannedWords = options.checkBannedWords !== false;
    const bannedWords = options.bannedWords || DEFAULT_BANNED_WORDS;
    const maxLength = options.maxLength || 0;
    const requireCapitalization = options.requireCapitalization || false;

    const sourceCode = context.getSourceCode();
    const text = sourceCode.getText();

    const TODO_PATTERN = /^TODO\s*\([^)]+\):/i;
    const FIXME_PATTERN = /^FIXME\s*\([^)]+\):/i;

    /**
     * Extract template sections from Svelte component
     * (Everything that's not <script> or <style>)
     * @returns {Array<Object>} Array of template sections
     */
    function getTemplateSections() {
      const sections = [];
      const scriptMatches = [...text.matchAll(/<script[^>]*>[\s\S]*?<\/script>/gi)];
      const styleMatches = [...text.matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)];

      // Collect all non-template sections with their positions
      const excludedRanges = [];

      for (const match of scriptMatches) {
        excludedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
        });
      }

      for (const match of styleMatches) {
        excludedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
        });
      }

      // Sort by start position
      excludedRanges.sort((a, b) => a.start - b.start);

      // Build template sections from gaps
      let lastEnd = 0;
      for (const range of excludedRanges) {
        if (range.start > lastEnd) {
          const content = text.substring(lastEnd, range.start);
          if (content.trim()) {
            sections.push({
              content,
              startIndex: lastEnd,
            });
          }
        }
        lastEnd = range.end;
      }

      // Add final section after last excluded range
      if (lastEnd < text.length) {
        const content = text.substring(lastEnd);
        if (content.trim()) {
          sections.push({
            content,
            startIndex: lastEnd,
          });
        }
      }

      return sections;
    }

    /**
     * Get location from offset in the full source
     * @param {number} offset - Character offset
     * @returns {Object} Location with line and column
     */
    function getLocation(offset) {
      const textBefore = text.substring(0, offset);
      const lines = textBefore.split("\n");
      return {
        line: lines.length,
        column: lines[lines.length - 1].length,
      };
    }

    /**
     * Check a single HTML comment
     * @param {Object} comment - Comment info
     */
    function checkComment(comment) {
      const value = comment.value.trim();
      const loc = getLocation(comment.start);

      // Check TODO format
      if (checkTodoFormat && /^todo/i.test(value)) {
        if (!TODO_PATTERN.test(value)) {
          context.report({
            loc: {
              start: loc,
              end: { line: loc.line, column: loc.column + comment.raw.length },
            },
            messageId: "invalidTodoFormat",
          });
        }
      }

      // Check FIXME format
      if (checkFixmeFormat && /^fixme/i.test(value)) {
        if (!FIXME_PATTERN.test(value)) {
          context.report({
            loc: {
              start: loc,
              end: { line: loc.line, column: loc.column + comment.raw.length },
            },
            messageId: "invalidFixmeFormat",
          });
        }
      }

      // Check banned words
      if (checkBannedWords) {
        for (const banned of bannedWords) {
          const regex = new RegExp(`\\b${banned.word}\\b`, "i");
          if (regex.test(value)) {
            context.report({
              loc: {
                start: loc,
                end: { line: loc.line, column: loc.column + comment.raw.length },
              },
              messageId: "bannedWord",
              data: {
                word: banned.word,
                suggestion: banned.replacement
                  ? `Consider using "${banned.replacement}" instead.`
                  : "",
              },
            });
          }
        }
      }

      // Check max length
      if (maxLength > 0 && value.length > maxLength) {
        context.report({
          loc: {
            start: loc,
            end: { line: loc.line, column: loc.column + comment.raw.length },
          },
          messageId: "commentTooLong",
          data: {
            maxLength: maxLength.toString(),
            length: value.length.toString(),
          },
        });
      }

      // Check capitalization
      if (requireCapitalization && value.length > 0) {
        const firstChar = value.charAt(0);
        if (
          !/^[@#\/\.\-\d]/.test(firstChar) &&
          firstChar !== firstChar.toUpperCase()
        ) {
          context.report({
            loc: {
              start: loc,
              end: { line: loc.line, column: loc.column + comment.raw.length },
            },
            messageId: "notCapitalized",
          });
        }
      }
    }

    return {
      Program() {
        const templateSections = getTemplateSections();

        for (const section of templateSections) {
          // Find all HTML comments in this template section
          HTML_COMMENT_PATTERN.lastIndex = 0;
          let match;

          while ((match = HTML_COMMENT_PATTERN.exec(section.content)) !== null) {
            const comment = {
              value: match[1],
              raw: match[0],
              start: section.startIndex + match.index,
              end: section.startIndex + match.index + match[0].length,
            };

            checkComment(comment);
          }
        }
      },
    };
  },
};
