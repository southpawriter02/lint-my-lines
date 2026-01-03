/**
 * @fileoverview ESLint processor for Svelte component template comments.
 * @author Jules
 */
"use strict";

const HTML_COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;
const SCRIPT_PATTERN = /<script[^>]*>[\s\S]*?<\/script>/gi;
const STYLE_PATTERN = /<style[^>]*>[\s\S]*?<\/style>/gi;

/**
 * Extract the template/markup section from Svelte component
 * (Everything that's not <script> or <style>)
 * @param {string} text - Svelte component source code
 * @returns {Array<Object>} Array of template sections
 */
function extractTemplateSections(text) {
  const sections = [];
  let processedText = text;

  // Remove script and style sections to get template content
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
          endIndex: range.start,
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
        endIndex: text.length,
      });
    }
  }

  return sections;
}

/**
 * Extract HTML comments from template content
 * @param {string} content - Template content
 * @param {number} offset - Offset in original file
 * @returns {Array<Object>} Array of comment objects
 */
function extractHTMLComments(content, offset) {
  const comments = [];
  let match;

  // Reset regex state
  HTML_COMMENT_PATTERN.lastIndex = 0;

  while ((match = HTML_COMMENT_PATTERN.exec(content)) !== null) {
    const value = match[1];
    const start = offset + match.index;
    const end = start + match[0].length;

    comments.push({
      value: value.trim(),
      raw: match[0],
      start,
      end,
    });
  }

  return comments;
}

/**
 * Calculate line number in original file from character offset
 * @param {string} text - Full source text
 * @param {number} offset - Character offset
 * @returns {Object} Line and column
 */
function getLocationFromOffset(text, offset) {
  const textBefore = text.substring(0, offset);
  const lines = textBefore.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length,
  };
}

module.exports = {
  /**
   * Pre-process Svelte file to create virtual files for template comments
   * @param {string} text - Svelte component source code
   * @param {string} filename - Original filename
   * @returns {Array<Object>} Array of code blocks to lint
   */
  preprocess(text, filename) {
    const templateSections = extractTemplateSections(text);

    // Collect all comments from all template sections
    const allComments = [];
    for (const section of templateSections) {
      const comments = extractHTMLComments(section.content, section.startIndex);
      allComments.push(...comments);
    }

    if (allComments.length === 0) {
      // No HTML comments in template sections
      return [text];
    }

    // Store comments metadata for postprocess
    this._svelteComments = this._svelteComments || {};
    this._svelteComments[filename] = {
      comments: allComments,
      text,
    };

    // Create synthetic JavaScript that represents template comments
    const syntheticLines = allComments.map((comment, index) => {
      const loc = getLocationFromOffset(text, comment.start);
      const padding = "\n".repeat(Math.max(0, loc.line - index - 1));
      return `${padding}// SVELTE_TEMPLATE: ${comment.value}`;
    });

    const syntheticCode = syntheticLines.join("\n");

    // Return original file (for script) + synthetic file (for template comments)
    return [
      text,
      { text: syntheticCode, filename: `${filename}/0_template-comments.js` },
    ];
  },

  /**
   * Post-process to combine and adjust messages
   * @param {Array<Array<Object>>} messages - Messages from each code block
   * @param {string} filename - Original filename
   * @returns {Array<Object>} Combined messages
   */
  postprocess(messages, filename) {
    const [scriptMessages, templateMessages = []] = messages;

    // Get stored metadata
    const metadata = this._svelteComments && this._svelteComments[filename];

    // Map template messages back to original locations
    const mappedTemplateMessages = templateMessages.map((msg) => {
      const newMessage = {
        ...msg,
        message: `[Svelte template] ${msg.message}`,
      };

      // Try to map back to original line if we have metadata
      if (metadata && metadata.comments) {
        const commentIndex = msg.line - 1;
        if (commentIndex >= 0 && commentIndex < metadata.comments.length) {
          const originalComment = metadata.comments[commentIndex];
          const loc = getLocationFromOffset(metadata.text, originalComment.start);
          newMessage.line = loc.line;
          newMessage.column = loc.column;
        }
      }

      return newMessage;
    });

    // Clean up stored metadata
    if (this._svelteComments) {
      delete this._svelteComments[filename];
    }

    return [...scriptMessages, ...mappedTemplateMessages];
  },

  /**
   * Autofix is not supported for template comments
   */
  supportsAutofix: false,
};
