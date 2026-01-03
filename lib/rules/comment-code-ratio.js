/**
 * @fileoverview Rule to enforce comment-to-code ratio in files.
 * @author Jules
 */
"use strict";

const { isJSDocComment } = require("../utils/jsdoc-utils");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce minimum and maximum comment-to-code ratio",
      category: "Best Practices",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          minRatio: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Minimum comment-to-code ratio (default: 0.05 = 5%)",
          },
          maxRatio: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Maximum comment-to-code ratio (default: 0.40 = 40%)",
          },
          minFileLines: {
            type: "integer",
            minimum: 1,
            description: "Only check files with at least this many lines (default: 20)",
          },
          excludeJSDoc: {
            type: "boolean",
            description: "Exclude JSDoc comments from ratio (default: false)",
          },
          excludeTodo: {
            type: "boolean",
            description: "Exclude TODO/FIXME/NOTE comments from ratio (default: false)",
          },
          countBlankLines: {
            type: "boolean",
            description: "Include blank lines in total line count (default: false)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooFewComments:
        "File has too few comments ({{actual}}%, minimum: {{min}}%). {{codeLines}} code lines, {{commentLines}} comment lines.",
      tooManyComments:
        "File has too many comments ({{actual}}%, maximum: {{max}}%). Consider if all comments add value.",
      noComments:
        "File has no comments. Consider adding documentation for complex logic.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const minRatio = options.minRatio !== undefined ? options.minRatio : 0.05;
    const maxRatio = options.maxRatio !== undefined ? options.maxRatio : 0.40;
    const minFileLines = options.minFileLines || 20;
    const excludeJSDoc = options.excludeJSDoc || false;
    const excludeTodo = options.excludeTodo || false;
    const countBlankLines = options.countBlankLines || false;

    const sourceCode = context.getSourceCode();

    /**
     * Check if a comment is a TODO/FIXME/NOTE
     * @param {Object} comment - ESLint comment object
     * @returns {boolean} True if action comment
     */
    function isActionComment(comment) {
      return /\b(TODO|FIXME|NOTE)\b/i.test(comment.value);
    }

    /**
     * Count comment lines, optionally excluding JSDoc and action comments
     * @param {Array} comments - Array of comment objects
     * @returns {number} Number of comment lines
     */
    function countCommentLines(comments) {
      let totalLines = 0;

      for (const comment of comments) {
        // Skip JSDoc if configured
        if (excludeJSDoc && isJSDocComment(comment)) {
          continue;
        }

        // Skip action comments if configured
        if (excludeTodo && isActionComment(comment)) {
          continue;
        }

        // Count lines in this comment
        const startLine = comment.loc.start.line;
        const endLine = comment.loc.end.line;
        totalLines += endLine - startLine + 1;
      }

      return totalLines;
    }

    /**
     * Count non-blank, non-comment lines
     * @param {Array} lines - Source lines
     * @param {Set} commentLineNumbers - Set of line numbers that are comments
     * @returns {Object} Object with codeLines and blankLines counts
     */
    function countCodeLines(lines, commentLineNumbers) {
      let codeLines = 0;
      let blankLines = 0;

      for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        const line = lines[i].trim();

        if (line === "") {
          blankLines++;
        } else if (!commentLineNumbers.has(lineNum)) {
          codeLines++;
        }
        // Lines that are part of comments are counted separately
      }

      return { codeLines, blankLines };
    }

    /**
     * Build a set of line numbers that are part of comments
     * @param {Array} comments - Array of comment objects
     * @returns {Set} Set of line numbers
     */
    function buildCommentLineSet(comments) {
      const lineSet = new Set();

      for (const comment of comments) {
        for (
          let line = comment.loc.start.line;
          line <= comment.loc.end.line;
          line++
        ) {
          lineSet.add(line);
        }
      }

      return lineSet;
    }

    return {
      "Program:exit"(node) {
        const lines = sourceCode.lines;
        const totalLines = lines.length;

        // Skip small files
        if (totalLines < minFileLines) {
          return;
        }

        const comments = sourceCode.getAllComments();
        const commentLineSet = buildCommentLineSet(comments);
        const commentLines = countCommentLines(comments);
        const { codeLines, blankLines } = countCodeLines(lines, commentLineSet);

        // Calculate base for ratio (code lines, optionally including blanks)
        const baseLines = countBlankLines ? codeLines + blankLines : codeLines;

        // Avoid division by zero
        if (baseLines === 0) {
          return;
        }

        const ratio = commentLines / baseLines;
        const percentage = Math.round(ratio * 100);

        // Check for no comments
        if (commentLines === 0 && minRatio > 0) {
          context.report({
            node,
            messageId: "noComments",
          });
          return;
        }

        // Check minimum ratio
        if (ratio < minRatio) {
          context.report({
            node,
            messageId: "tooFewComments",
            data: {
              actual: percentage.toString(),
              min: Math.round(minRatio * 100).toString(),
              codeLines: codeLines.toString(),
              commentLines: commentLines.toString(),
            },
          });
          return;
        }

        // Check maximum ratio
        if (ratio > maxRatio) {
          context.report({
            node,
            messageId: "tooManyComments",
            data: {
              actual: percentage.toString(),
              max: Math.round(maxRatio * 100).toString(),
            },
          });
        }
      },
    };
  },
};
