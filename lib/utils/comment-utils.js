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

module.exports = {
  isJSDocComment,
  getCommentText,
  normalizeText,
  classifyComment,
  getAllCommentsCached,
  getAllCommentsRaw,
  filterComments,
  getFirstCommentLine,
};
