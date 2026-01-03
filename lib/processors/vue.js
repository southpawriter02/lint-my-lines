/**
 * @fileoverview ESLint processor for Vue SFC template comments.
 * @author Jules
 */
"use strict";

const HTML_COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;

/**
 * Extract the template section from Vue SFC
 * @param {string} text - Vue SFC source code
 * @returns {Object|null} Template section info or null
 */
function extractTemplate(text) {
  const templateMatch = text.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (!templateMatch) {
    return null;
  }

  const fullMatch = templateMatch[0];
  const content = templateMatch[1];
  const startIndex = templateMatch.index;
  const contentStart = startIndex + fullMatch.indexOf(">") + 1;

  return {
    content,
    startIndex: contentStart,
    endIndex: contentStart + content.length,
  };
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

    // Calculate line and column
    const textBeforeComment = content.substring(0, match.index);
    const lines = textBeforeComment.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    comments.push({
      value: value.trim(),
      raw: match[0],
      start,
      end,
      loc: {
        start: { line, column },
        end: { line: line + value.split("\n").length - 1, column: match[0].length },
      },
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
   * Pre-process Vue file to create virtual files for template comments
   * @param {string} text - Vue SFC source code
   * @param {string} filename - Original filename
   * @returns {Array<Object>} Array of code blocks to lint
   */
  preprocess(text, filename) {
    const template = extractTemplate(text);

    if (!template) {
      // No template section, just return original for script linting
      return [text];
    }

    const comments = extractHTMLComments(template.content, template.startIndex);

    if (comments.length === 0) {
      // No HTML comments in template
      return [text];
    }

    // Store comments metadata for postprocess
    this._vueComments = this._vueComments || {};
    this._vueComments[filename] = {
      comments,
      text,
      templateOffset: template.startIndex,
    };

    // Create synthetic JavaScript that represents template comments
    // Each comment becomes a line comment that can be checked by existing rules
    const syntheticLines = comments.map((comment, index) => {
      // Pad with newlines to preserve approximate line numbers
      const loc = getLocationFromOffset(text, comment.start);
      const padding = "\n".repeat(Math.max(0, loc.line - index - 1));
      return `${padding}// VUE_TEMPLATE: ${comment.value}`;
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
    const metadata = this._vueComments && this._vueComments[filename];

    // Map template messages back to original locations
    const mappedTemplateMessages = templateMessages.map((msg) => {
      // Adjust message to indicate it's from template
      const newMessage = {
        ...msg,
        message: `[Vue template] ${msg.message}`,
      };

      // Try to map back to original line if we have metadata
      if (metadata && metadata.comments) {
        // Find the comment that corresponds to this line
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
    if (this._vueComments) {
      delete this._vueComments[filename];
    }

    return [...scriptMessages, ...mappedTemplateMessages];
  },

  /**
   * Autofix is not supported for template comments
   */
  supportsAutofix: false,
};
