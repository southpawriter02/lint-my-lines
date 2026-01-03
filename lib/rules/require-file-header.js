/**
 * @fileoverview Rule to require file header comments with configurable tags.
 * @author Jules
 */
"use strict";

const path = require("path");

// Default templates for each style
const DEFAULT_TEMPLATES = {
  jsdoc: `/**
 * @file {filename}
 */`,
  block: `/*
 * @file {filename}
 */`,
  line: `// @file {filename}`
};

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require file header comments with configurable required tags",
      category: "JSDoc",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/require-file-header.md"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["jsdoc", "block", "line"],
            description: "Comment style for the header"
          },
          requiredTags: {
            type: "array",
            items: { type: "string" },
            description: "Tags required in the header (e.g., @file, @author)"
          },
          template: {
            type: "string",
            description: "Custom template for generating headers"
          },
          allowShebang: {
            type: "boolean",
            description: "Allow shebang (#!) before header"
          },
          maxLinesBeforeHeader: {
            type: "integer",
            minimum: 0,
            description: "Maximum lines allowed before header (after shebang if present)"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingHeader: "File is missing a header comment.",
      missingTag: "File header is missing required tag '{{tag}}'.",
      invalidHeaderStyle: "File header should use {{expected}} style, not {{actual}}.",
      headerTooFarFromStart: "File header must be within the first {{max}} lines."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const style = options.style || "jsdoc";
    const requiredTags = options.requiredTags || ["@file"];
    const template = options.template || DEFAULT_TEMPLATES[style];
    const allowShebang = options.allowShebang !== false;
    const maxLinesBeforeHeader = options.maxLinesBeforeHeader || 0;

    /**
     * Check if a line is a shebang
     * @param {string} line - The line to check
     * @returns {boolean} True if line is a shebang
     */
    function isShebang(line) {
      return line.startsWith("#!");
    }

    /**
     * Get the first significant line number (after shebang if allowed)
     * @returns {number} The line number where header should start (1-indexed)
     */
    function getExpectedHeaderLine() {
      const text = sourceCode.getText();
      const lines = text.split("\n");

      if (allowShebang && lines.length > 0 && isShebang(lines[0])) {
        return 2; // Line after shebang
      }
      return 1;
    }

    /**
     * Get the first comment in the file
     * @returns {Object|null} The first comment or null
     */
    function getFirstComment() {
      const comments = sourceCode.getAllComments();
      if (comments.length === 0) return null;

      const text = sourceCode.getText();
      const lines = text.split("\n");
      const hasShebangLine = allowShebang && lines.length > 0 && isShebang(lines[0]);

      // Find first comment that's not on shebang line
      for (const comment of comments) {
        if (hasShebangLine && comment.loc.start.line === 1) {
          continue;
        }
        return comment;
      }

      return null;
    }

    /**
     * Determine the style of a comment
     * @param {Object} comment - ESLint comment object
     * @returns {string} "jsdoc", "block", or "line"
     */
    function getCommentStyle(comment) {
      if (comment.type === "Line") {
        return "line";
      }
      // Block comment - check if JSDoc (starts with *)
      if (comment.value.startsWith("*")) {
        return "jsdoc";
      }
      return "block";
    }

    /**
     * Extract tags from comment text
     * @param {string} text - The comment text
     * @returns {Set<string>} Set of tags found
     */
    function extractTags(text) {
      const tags = new Set();
      const tagPattern = /@([a-zA-Z]+)/g;
      let match;

      while ((match = tagPattern.exec(text)) !== null) {
        tags.add("@" + match[1]);
      }

      return tags;
    }

    /**
     * Generate header from template
     * @param {string} tmpl - The template string
     * @returns {string} Generated header
     */
    function generateHeader(tmpl) {
      const filename = path.basename(context.getFilename());
      const date = new Date().toISOString().split("T")[0];
      const year = new Date().getFullYear().toString();

      return tmpl
        .replace(/\{filename\}/g, filename)
        .replace(/\{date\}/g, date)
        .replace(/\{year\}/g, year)
        .replace(/\{author\}/g, "[Author]");
    }

    /**
     * Get insert position for header
     * @returns {number} Character index where to insert
     */
    function getInsertPosition() {
      const text = sourceCode.getText();
      const lines = text.split("\n");

      if (allowShebang && lines.length > 0 && isShebang(lines[0])) {
        // Insert after shebang line
        return lines[0].length + 1; // +1 for newline
      }
      return 0;
    }

    /**
     * Check for consecutive line comments that form a header
     * @returns {Array<Object>|null} Array of line comments or null
     */
    function getLineCommentHeader() {
      const comments = sourceCode.getAllComments();
      const lineComments = [];
      const text = sourceCode.getText();
      const lines = text.split("\n");
      const hasShebangLine = allowShebang && lines.length > 0 && isShebang(lines[0]);
      const startLine = hasShebangLine ? 2 : 1;

      for (const comment of comments) {
        if (comment.type !== "Line") continue;
        if (hasShebangLine && comment.loc.start.line === 1) continue;

        // Check if this is consecutive or first
        if (lineComments.length === 0) {
          if (comment.loc.start.line <= startLine + maxLinesBeforeHeader) {
            lineComments.push(comment);
          }
        } else {
          const lastComment = lineComments[lineComments.length - 1];
          if (comment.loc.start.line === lastComment.loc.end.line + 1) {
            lineComments.push(comment);
          } else {
            break;
          }
        }
      }

      return lineComments.length > 0 ? lineComments : null;
    }

    return {
      Program(node) {
        const expectedLine = getExpectedHeaderLine();
        let firstComment = getFirstComment();
        let actualStyle;
        let commentText;
        let commentLoc;

        // For line style, collect consecutive line comments
        if (style === "line") {
          const lineComments = getLineCommentHeader();
          if (lineComments && lineComments.length > 0) {
            // Treat consecutive line comments as the header
            commentText = lineComments.map(c => c.value).join("\n");
            commentLoc = {
              start: lineComments[0].loc.start,
              end: lineComments[lineComments.length - 1].loc.end
            };
            actualStyle = "line";
            firstComment = lineComments[0]; // For position checks
          } else {
            firstComment = null;
          }
        } else if (firstComment) {
          actualStyle = getCommentStyle(firstComment);
          commentText = firstComment.value;
          commentLoc = firstComment.loc;
        }

        // Check if header exists
        if (!firstComment) {
          const insertPos = getInsertPosition();
          const header = generateHeader(template);
          const suffix = "\n\n";

          context.report({
            loc: { line: expectedLine, column: 0 },
            messageId: "missingHeader",
            fix: function(fixer) {
              return fixer.insertTextAfterRange(
                [insertPos, insertPos],
                header + suffix
              );
            }
          });
          return;
        }

        // Check header position
        const headerLine = firstComment.loc.start.line;
        const maxAllowedLine = expectedLine + maxLinesBeforeHeader;

        if (headerLine > maxAllowedLine) {
          context.report({
            loc: commentLoc || firstComment.loc,
            messageId: "headerTooFarFromStart",
            data: { max: maxLinesBeforeHeader + 1 }
          });
          return;
        }

        // Check style (only for block comments when expecting jsdoc/block)
        if (style !== "line" && actualStyle !== style) {
          context.report({
            loc: commentLoc || firstComment.loc,
            messageId: "invalidHeaderStyle",
            data: {
              expected: style,
              actual: actualStyle
            }
          });
        }

        // Check required tags
        const tags = extractTags(commentText);
        for (const requiredTag of requiredTags) {
          if (!tags.has(requiredTag)) {
            context.report({
              loc: commentLoc || firstComment.loc,
              messageId: "missingTag",
              data: { tag: requiredTag }
            });
          }
        }
      }
    };
  }
};
