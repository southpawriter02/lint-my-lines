/**
 * @fileoverview Rule to lint HTML comments in Vue template sections.
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
      description: "Enforce comment style in Vue template sections",
      category: "Vue",
      recommended: false,
    },
    fixable: null, // Template comments are harder to autofix
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
        "Vue template TODO comment should use format: <!-- TODO (reference): description -->",
      invalidFixmeFormat:
        "Vue template FIXME comment should use format: <!-- FIXME (reference): description -->",
      bannedWord:
        'Avoid using "{{word}}" in comments. {{suggestion}}',
      commentTooLong:
        "Vue template comment exceeds {{maxLength}} characters (found {{length}}).",
      notCapitalized:
        "Vue template comment should start with a capital letter.",
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
     * Extract template section from Vue SFC
     * @returns {Object|null} Template info
     */
    function getTemplateSection() {
      const match = text.match(/<template[^>]*>([\s\S]*?)<\/template>/);
      if (!match) return null;

      const content = match[1];
      const startIndex = match.index + match[0].indexOf(">") + 1;

      return { content, startIndex };
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
        // Skip if starts with special patterns
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
        const template = getTemplateSection();
        if (!template) return;

        // Find all HTML comments in template
        HTML_COMMENT_PATTERN.lastIndex = 0;
        let match;

        while ((match = HTML_COMMENT_PATTERN.exec(template.content)) !== null) {
          const comment = {
            value: match[1],
            raw: match[0],
            start: template.startIndex + match.index,
            end: template.startIndex + match.index + match[0].length,
          };

          checkComment(comment);
        }
      },
    };
  },
};
