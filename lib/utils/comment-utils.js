/**
 * @fileoverview Shared comment processing utilities with caching.
 * @author Jules
 */
"use strict";

const { commentCache } = require("./performance-cache");

/**
 * Check if a comment is a JSDoc comment.
 * @param {Object} comment - ESLint comment object
 * @returns {boolean} True if JSDoc comment
 */
function isJSDocComment(comment) {
  return comment.type === "Block" && comment.value.startsWith("*");
}

/**
 * Extract clean text from a comment.
 * For block comments, joins all lines and strips leading asterisks.
 *
 * @param {Object} comment - ESLint comment object
 * @returns {string} Cleaned comment text
 */
function getCommentText(comment) {
  let text = comment.value.trim();

  if (comment.type === "Block") {
    const lines = text
      .split("\n")
      .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
      .filter((line) => line.length > 0);
    text = lines.join(" ");
  }

  return text;
}

/**
 * Normalize text for comparison by lowercasing and removing punctuation.
 *
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classify a comment with pre-computed properties.
 *
 * @param {Object} comment - ESLint comment object
 * @returns {Object} Classified comment with properties
 */
function classifyComment(comment) {
  const text = getCommentText(comment);
  return {
    comment,
    text,
    isJSDoc: isJSDocComment(comment),
    isTodo: /\bTODO\b/i.test(comment.value),
    isFixme: /\bFIXME\b/i.test(comment.value),
    isNote: /\bNOTE\b/i.test(comment.value),
    isAction: /\b(TODO|FIXME|NOTE)\b/i.test(comment.value),
    isDirective: /^\s*eslint/.test(comment.value),
    isUrl: /https?:\/\//.test(comment.value),
    // v1.1.1: Enhanced classification properties
    isFileHeader: /^\s*\*?\s*@file/i.test(comment.value),
    isCopyright: /^\s*\*?\s*(copyright|license)/i.test(comment.value),
    isBlock: comment.type === "Block",
    isLine: comment.type === "Line",
  };
}

/**
 * Get all comments with caching and pre-classification.
 * Comments are cached per sourceCode object using WeakMap,
 * so they're automatically garbage collected when the file is done processing.
 *
 * @param {Object} sourceCode - ESLint sourceCode object
 * @returns {Array<Object>} Array of classified comments
 */
function getAllCommentsCached(sourceCode) {
  if (commentCache.has(sourceCode)) {
    return commentCache.get(sourceCode);
  }

  const comments = sourceCode.getAllComments();
  const classified = comments.map(classifyComment);

  commentCache.set(sourceCode, classified);
  return classified;
}

/**
 * Get only the raw ESLint comment objects (uncached, for backwards compatibility).
 * Prefer getAllCommentsCached for better performance.
 *
 * @param {Object} sourceCode - ESLint sourceCode object
 * @returns {Array<Object>} Array of comment objects
 */
function getAllCommentsRaw(sourceCode) {
  return sourceCode.getAllComments();
}

/**
 * Filter classified comments by type.
 *
 * @param {Array<Object>} classifiedComments - Array from getAllCommentsCached
 * @param {Object} filters - Filter options
 * @param {boolean} [filters.jsdoc] - Include JSDoc comments
 * @param {boolean} [filters.action] - Include TODO/FIXME/NOTE comments
 * @param {boolean} [filters.directive] - Include ESLint directives
 * @returns {Array<Object>} Filtered classified comments
 */
function filterComments(classifiedComments, filters = {}) {
  return classifiedComments.filter((c) => {
    if (filters.jsdoc === false && c.isJSDoc) return false;
    if (filters.action === false && c.isAction) return false;
    if (filters.directive === false && c.isDirective) return false;
    if (filters.jsdoc === true && !c.isJSDoc) return false;
    if (filters.action === true && !c.isAction) return false;
    if (filters.directive === true && !c.isDirective) return false;
    return true;
  });
}

/**
 * Get the first meaningful line of a block comment.
 *
 * @param {Object} comment - ESLint comment object
 * @returns {string} First non-empty line
 */
function getFirstCommentLine(comment) {
  if (comment.type === "Line") {
    return comment.value.trim();
  }

  const lines = comment.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .filter((line) => line.length > 0);

  return lines[0] || "";
}

// ---------------------------------------------------------------------------
// v1.1.2: Ignore Pattern Utilities
// ---------------------------------------------------------------------------

/**
 * URL regex pattern for detection.
 * Matches http and https URLs.
 *
 * @type {RegExp}
 */
const URL_PATTERN = /https?:\/\/[^\s)>\]]+/gi;

/**
 * Markdown code block pattern (triple backticks).
 * Matches ```lang\ncode\n``` or ```code```
 *
 * @type {RegExp}
 */
const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

/**
 * Check if a position in text is inside a URL.
 *
 * @param {string} text - The text to check
 * @param {number} position - The character position to check
 * @returns {boolean} True if position is inside a URL
 *
 * @example
 * isInsideUrl("See https://example.com for info", 10);  // true
 * isInsideUrl("See https://example.com for info", 0);   // false
 */
function isInsideUrl(text, position) {
  if (!text || typeof text !== "string" || position < 0) {
    return false;
  }

  const urlPattern = /https?:\/\/[^\s)>\]]+/gi;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (position >= start && position < end) {
      return true;
    }
  }

  return false;
}

/**
 * Remove URLs from text.
 *
 * @param {string} text - The text to process
 * @returns {string} Text with URLs removed
 *
 * @example
 * stripUrls("See https://example.com for info");
 * // "See  for info"
 */
function stripUrls(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.replace(URL_PATTERN, "");
}

/**
 * Check if a position in text is inside a markdown code block (triple backticks).
 *
 * @param {string} text - The text to check
 * @param {number} position - The character position to check
 * @returns {boolean} True if position is inside a code block
 *
 * @example
 * isInsideCodeBlock("See ```code``` for info", 7);  // true
 * isInsideCodeBlock("See ```code``` for info", 0);  // false
 */
function isInsideCodeBlock(text, position) {
  if (!text || typeof text !== "string" || position < 0) {
    return false;
  }

  const codeBlockPattern = /```[\s\S]*?```/g;
  let match;

  while ((match = codeBlockPattern.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (position >= start && position < end) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a position in text is inside inline code (single backticks).
 *
 * @param {string} text - The text to check
 * @param {number} position - The character position to check
 * @returns {boolean} True if position is inside inline code
 *
 * @example
 * isInsideInlineCode("See `code` for info", 6);  // true
 * isInsideInlineCode("See `code` for info", 0);  // false
 */
function isInsideInlineCode(text, position) {
  if (!text || typeof text !== "string" || position < 0) {
    return false;
  }

  // Match single backticks but not triple backticks
  const inlineCodePattern = /(?<!`)`(?!``)[^`]+`(?!`)/g;
  let match;

  while ((match = inlineCodePattern.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (position >= start && position < end) {
      return true;
    }
  }

  return false;
}

/**
 * Remove markdown code blocks (triple backticks) from text.
 *
 * @param {string} text - The text to process
 * @returns {string} Text with code blocks removed
 *
 * @example
 * stripCodeBlocks("See ```Array.map()``` for details");
 * // "See  for details"
 */
function stripCodeBlocks(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.replace(CODE_BLOCK_PATTERN, "");
}

/**
 * Remove inline code (single backticks) from text.
 *
 * @param {string} text - The text to process
 * @returns {string} Text with inline code removed
 *
 * @example
 * stripInlineCode("Call `myFunction` here");
 * // "Call  here"
 */
function stripInlineCode(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Match single backticks but not triple backticks
  return text.replace(/(?<!`)`(?!``)[^`]+`(?!`)/g, "");
}

/**
 * Apply a custom ignore regex pattern to strip matched content from text.
 *
 * @param {string} text - The text to process
 * @param {string|RegExp} pattern - The pattern to remove (string or RegExp)
 * @returns {string} Text with matched content removed
 *
 * @example
 * applyIgnoreRegex("Check @see UserClass for info", "@see\\s+\\S+");
 * // "Check  for info"
 */
function applyIgnoreRegex(text, pattern) {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (!pattern) {
    return text;
  }

  try {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, "gi");
    return text.replace(regex, "");
  } catch {
    // Invalid regex pattern, return original text
    return text;
  }
}

/**
 * Process text with multiple ignore options applied.
 * Removes URLs, code blocks, and custom regex patterns as configured.
 *
 * @param {string} text - The text to process
 * @param {Object} options - Ignore options
 * @param {boolean} [options.ignoreUrls=false] - Remove URLs
 * @param {boolean} [options.ignoreCodeBlocks=false] - Remove code blocks
 * @param {boolean} [options.ignoreInlineCode=false] - Remove inline code
 * @param {string} [options.ignoreRegex] - Custom regex pattern to remove
 * @returns {string} Processed text with ignored content removed
 *
 * @example
 * processTextWithIgnores(
 *   "See https://example.com and ```code``` for info",
 *   { ignoreUrls: true, ignoreCodeBlocks: true }
 * );
 * // "See  and  for info"
 */
function processTextWithIgnores(text, options = {}) {
  if (!text || typeof text !== "string") {
    return "";
  }

  let result = text;

  if (options.ignoreCodeBlocks) {
    result = stripCodeBlocks(result);
  }

  if (options.ignoreInlineCode) {
    result = stripInlineCode(result);
  }

  if (options.ignoreUrls) {
    result = stripUrls(result);
  }

  if (options.ignoreRegex) {
    result = applyIgnoreRegex(result, options.ignoreRegex);
  }

  return result;
}

module.exports = {
  // Core comment utilities
  isJSDocComment,
  getCommentText,
  normalizeText,
  classifyComment,
  getAllCommentsCached,
  getAllCommentsRaw,
  filterComments,
  getFirstCommentLine,

  // v1.1.2: Ignore pattern utilities
  URL_PATTERN,
  CODE_BLOCK_PATTERN,
  isInsideUrl,
  stripUrls,
  isInsideCodeBlock,
  isInsideInlineCode,
  stripCodeBlocks,
  stripInlineCode,
  applyIgnoreRegex,
  processTextWithIgnores,
};
