/**
 * @fileoverview Enhanced comment context classification utilities for lint-my-lines.
 * @author lint-my-lines
 *
 * This module provides utilities for distinguishing between documentation comments
 * (JSDoc, file headers, API documentation) and inline comments (code explanations,
 * TODOs, etc.). It also extracts the WHY_INDICATORS pattern from no-obvious-comments
 * for reuse across rules.
 *
 * @example
 * const { isDocumentationComment, hasWhyIndicator } = require("./comment-context-utils");
 *
 * // Check if a comment is documentation
 * if (isDocumentationComment(classified)) {
 *   // Apply different rules
 * }
 *
 * // Check if comment explains "why"
 * if (hasWhyIndicator(commentText)) {
 *   // This is a valuable explanatory comment
 * }
 */
"use strict";

const { commentContextCache } = require("./performance-cache");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Words and phrases that indicate a comment explains "why" rather than "what".
 * These indicate valuable comments that shouldn't be flagged as obvious.
 *
 * Extracted from no-obvious-comments.js for reuse across rules.
 *
 * @type {string[]}
 */
const WHY_INDICATORS = [
  // Causal explanations
  "because",
  "since",
  "due to",
  "as a result",
  "therefore",

  // Problem/solution context
  "workaround",
  "bug",
  "issue",
  "fix for",
  "fixes",
  "hack",

  // Requirements
  "needed for",
  "required for",
  "necessary",
  "must",
  "should",

  // Importance markers
  "important",
  "critical",
  "crucial",
  "essential",

  // Warnings and notes
  "note:",
  "caveat",
  "warning",
  "caution",
  "beware",
  "careful",

  // Intentionality
  "intentional",
  "deliberately",
  "purposely",
  "on purpose",

  // Performance
  "performance",
  "optimization",
  "optimized",
  "faster",
  "slower",

  // Compatibility
  "compatibility",
  "backwards compatible",
  "legacy",
  "deprecated",
  "polyfill",

  // Temporary state
  "temporary",
  "temp",
  "until",
  "when",

  // Business/domain
  "business",
  "rule",
  "requirement",
  "spec",
  "specification",

  // Safety
  "safety",
  "security",
  "prevent",
  "avoid",
  "protect",

  // Edge cases
  "edge case",
  "corner case",
  "special case",
  "exception",

  // References
  "see",
  "refer to",
  "according to",
];

/**
 * Patterns that identify documentation-style comments.
 * These are typically formal API documentation, not inline explanations.
 *
 * @type {RegExp[]}
 */
const DOC_COMMENT_PATTERNS = [
  // JSDoc tags
  /^\s*\*?\s*@\w+/,

  // File headers
  /^\s*\*?\s*@file/i,
  /^\s*\*?\s*@fileoverview/i,
  /^\s*\*?\s*@overview/i,

  // Copyright/license headers
  /^\s*\*?\s*(copyright|license|licensed)/i,
  /^\s*\*?\s*\(c\)\s*\d{4}/i,
  /^\s*\*?\s*all rights reserved/i,

  // Module/package documentation
  /^\s*\*?\s*@module/i,
  /^\s*\*?\s*@package/i,
  /^\s*\*?\s*@namespace/i,

  // API documentation
  /^\s*\*?\s*@api/i,
  /^\s*\*?\s*@public/i,
  /^\s*\*?\s*@private/i,
  /^\s*\*?\s*@protected/i,

  // Type documentation
  /^\s*\*?\s*@typedef/i,
  /^\s*\*?\s*@interface/i,
  /^\s*\*?\s*@class/i,
  /^\s*\*?\s*@constructor/i,
];

/**
 * Patterns that identify inline explanatory comments.
 * These explain code behavior, not API contracts.
 *
 * @type {RegExp[]}
 */
const INLINE_COMMENT_PATTERNS = [
  // Action items
  /^\s*(TODO|FIXME|NOTE|HACK|XXX|BUG)\b/i,

  // ESLint directives
  /^\s*eslint/i,
  /^\s*@ts-/i,
  /^\s*prettier-/i,

  // Code flow explanations
  /^\s*(if|when|because|since|for|to)\s/i,
];

// ---------------------------------------------------------------------------
// Classification Functions
// ---------------------------------------------------------------------------

/**
 * Check if comment text contains a "why" indicator.
 * These indicate comments that explain reasoning, not just restate code.
 *
 * @param {string} text - Comment text to check
 * @returns {boolean} True if contains a why indicator
 *
 * @example
 * hasWhyIndicator("because the API requires it");  // true
 * hasWhyIndicator("increment the counter");         // false
 */
function hasWhyIndicator(text) {
  if (!text || typeof text !== "string") {
    return false;
  }

  const lowerText = text.toLowerCase();
  return WHY_INDICATORS.some((indicator) => lowerText.includes(indicator));
}

/**
 * Check if a classified comment is a documentation comment.
 * Documentation comments are JSDoc blocks, file headers, API docs, etc.
 *
 * @param {Object} classified - Classified comment object from comment-utils
 * @returns {boolean} True if this is a documentation comment
 *
 * @example
 * // JSDoc comment
 * isDocumentationComment({ isJSDoc: true });  // true
 *
 * // File header
 * isDocumentationComment({ text: "@fileoverview Main entry" });  // true
 *
 * // Inline comment
 * isDocumentationComment({ isLine: true, text: "increment counter" });  // false
 */
function isDocumentationComment(classified) {
  if (!classified) {
    return false;
  }

  // JSDoc comments are always documentation
  if (classified.isJSDoc) {
    return true;
  }

  // File headers and copyright are documentation
  if (classified.isFileHeader || classified.isCopyright) {
    return true;
  }

  // Check for documentation patterns in text
  const text = classified.text || "";
  return DOC_COMMENT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Check if a classified comment is an inline comment.
 * Inline comments are code explanations, TODOs, directives, etc.
 *
 * @param {Object} classified - Classified comment object from comment-utils
 * @returns {boolean} True if this is an inline comment
 *
 * @example
 * // Line comment
 * isInlineComment({ isLine: true });  // true
 *
 * // TODO comment
 * isInlineComment({ isTodo: true });  // true
 *
 * // JSDoc comment
 * isInlineComment({ isJSDoc: true });  // false
 */
function isInlineComment(classified) {
  if (!classified) {
    return false;
  }

  // If it's a documentation comment, it's not inline
  if (isDocumentationComment(classified)) {
    return false;
  }

  // Line comments are typically inline
  if (classified.isLine) {
    return true;
  }

  // Action items are inline
  if (classified.isAction || classified.isTodo || classified.isFixme || classified.isNote) {
    return true;
  }

  // Directives are inline
  if (classified.isDirective) {
    return true;
  }

  // Check for inline patterns
  const text = classified.text || "";
  return INLINE_COMMENT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Possible comment purposes.
 *
 * @typedef {'documentation'|'explanation'|'todo'|'directive'|'noise'} CommentPurpose
 */

/**
 * Determine the purpose of a comment.
 *
 * @param {Object} classified - Classified comment object from comment-utils
 * @returns {CommentPurpose} The determined purpose
 *
 * @example
 * getCommentPurpose({ isJSDoc: true });           // "documentation"
 * getCommentPurpose({ isTodo: true });            // "todo"
 * getCommentPurpose({ isDirective: true });       // "directive"
 * getCommentPurpose({ text: "because X" });       // "explanation"
 * getCommentPurpose({ text: "increment i" });     // "noise"
 */
function getCommentPurpose(classified) {
  if (!classified) {
    return "noise";
  }

  // Documentation comments (JSDoc, file headers, etc.)
  if (isDocumentationComment(classified)) {
    return "documentation";
  }

  // Action items (TODO, FIXME, NOTE)
  if (classified.isAction || classified.isTodo || classified.isFixme || classified.isNote) {
    return "todo";
  }

  // ESLint/tool directives
  if (classified.isDirective) {
    return "directive";
  }

  // Check for explanatory content
  const text = classified.text || "";
  if (hasWhyIndicator(text)) {
    return "explanation";
  }

  // Default to noise (potentially obvious/redundant)
  return "noise";
}

/**
 * Enhanced comment classification with context.
 *
 * @typedef {Object} EnhancedClassification
 * @property {boolean} isDocumentationComment - Is a documentation comment
 * @property {boolean} isInlineComment - Is an inline/code comment
 * @property {CommentPurpose} purpose - The comment's purpose
 * @property {boolean} hasWhyIndicator - Contains explanatory keywords
 */

/**
 * Get enhanced classification for a comment.
 * Results are cached for performance.
 *
 * @param {Object} classified - Classified comment object from comment-utils
 * @returns {EnhancedClassification} Enhanced classification
 *
 * @example
 * const enhanced = classifyCommentContext(classified);
 * if (enhanced.isDocumentationComment) {
 *   // Handle documentation differently
 * }
 */
function classifyCommentContext(classified) {
  if (!classified) {
    return {
      isDocumentationComment: false,
      isInlineComment: false,
      purpose: "noise",
      hasWhyIndicator: false,
    };
  }

  // Try cache first (use comment location as key)
  const comment = classified.comment;
  if (comment && comment.loc) {
    const cacheKey = `${comment.loc.start.line}:${comment.loc.start.column}`;
    if (commentContextCache.has(cacheKey)) {
      return commentContextCache.get(cacheKey);
    }

    const result = {
      isDocumentationComment: isDocumentationComment(classified),
      isInlineComment: isInlineComment(classified),
      purpose: getCommentPurpose(classified),
      hasWhyIndicator: hasWhyIndicator(classified.text || ""),
    };

    commentContextCache.set(cacheKey, result);
    return result;
  }

  // No caching possible without location
  return {
    isDocumentationComment: isDocumentationComment(classified),
    isInlineComment: isInlineComment(classified),
    purpose: getCommentPurpose(classified),
    hasWhyIndicator: hasWhyIndicator(classified.text || ""),
  };
}

/**
 * Check if a comment should be skipped based on context options.
 *
 * @param {Object} classified - Classified comment object
 * @param {Object} contextOptions - Comment context options
 * @param {string} [contextOptions.documentationComments='normal'] - How to handle doc comments
 * @param {string} [contextOptions.inlineComments='normal'] - How to handle inline comments
 * @returns {boolean} True if the comment should be skipped
 *
 * @example
 * // Skip documentation comments
 * shouldSkipByContext(classified, { documentationComments: "skip" });
 *
 * // Skip inline comments
 * shouldSkipByContext(classified, { inlineComments: "skip" });
 */
function shouldSkipByContext(classified, contextOptions = {}) {
  const docHandling = contextOptions.documentationComments || "normal";
  const inlineHandling = contextOptions.inlineComments || "normal";

  const isDoc = isDocumentationComment(classified);
  const isInline = isInlineComment(classified);

  if (isDoc && docHandling === "skip") {
    return true;
  }

  if (isInline && inlineHandling === "skip") {
    return true;
  }

  return false;
}

/**
 * Get severity adjustment based on comment context.
 * Used for "strict" mode handling.
 *
 * @param {Object} classified - Classified comment object
 * @param {Object} contextOptions - Comment context options
 * @returns {'strict'|'normal'} Effective severity
 */
function getContextSeverity(classified, contextOptions = {}) {
  const docHandling = contextOptions.documentationComments || "normal";
  const inlineHandling = contextOptions.inlineComments || "normal";

  const isDoc = isDocumentationComment(classified);
  const isInline = isInlineComment(classified);

  if (isDoc && docHandling === "strict") {
    return "strict";
  }

  if (isInline && inlineHandling === "strict") {
    return "strict";
  }

  return "normal";
}

// ---------------------------------------------------------------------------
// Schema Constant
// ---------------------------------------------------------------------------

/**
 * JSON Schema for commentContext option.
 * Reusable across rules that support comment context.
 *
 * @type {Object}
 */
const COMMENT_CONTEXT_SCHEMA = {
  type: "object",
  properties: {
    documentationComments: {
      type: "string",
      enum: ["strict", "normal", "skip"],
      description: "How to handle JSDoc and documentation comments",
    },
    inlineComments: {
      type: "string",
      enum: ["strict", "normal", "skip"],
      description: "How to handle inline and trailing comments",
    },
  },
  additionalProperties: false,
};

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  WHY_INDICATORS,
  DOC_COMMENT_PATTERNS,
  INLINE_COMMENT_PATTERNS,
  COMMENT_CONTEXT_SCHEMA,

  // Classification functions
  hasWhyIndicator,
  isDocumentationComment,
  isInlineComment,
  getCommentPurpose,
  classifyCommentContext,

  // Context handling helpers
  shouldSkipByContext,
  getContextSeverity,
};
