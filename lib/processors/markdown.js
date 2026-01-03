/**
 * @fileoverview ESLint processor for Markdown code blocks.
 * @author Jules
 */
"use strict";

// Match fenced code blocks with optional language hint
const FENCED_CODE_BLOCK = /```(\w+)?\n([\s\S]*?)```/g;

// Map markdown language hints to file extensions
const LANG_MAP = {
  js: ".js",
  javascript: ".js",
  ts: ".ts",
  typescript: ".ts",
  jsx: ".jsx",
  tsx: ".tsx",
  mjs: ".mjs",
  cjs: ".cjs",
};

// Languages we can process
const SUPPORTED_LANGS = new Set(Object.keys(LANG_MAP));

/**
 * Extract code blocks from Markdown
 * @param {string} text - Markdown source
 * @returns {Array<Object>} Array of code block info
 */
function extractCodeBlocks(text) {
  const blocks = [];
  let match;

  // Reset regex state
  FENCED_CODE_BLOCK.lastIndex = 0;

  while ((match = FENCED_CODE_BLOCK.exec(text)) !== null) {
    const lang = match[1]?.toLowerCase();
    const code = match[2];
    const start = match.index;

    // Only process supported languages
    if (lang && SUPPORTED_LANGS.has(lang)) {
      // Calculate line number of code block start
      const textBefore = text.substring(0, start);
      const linesBefore = textBefore.split("\n");
      const startLine = linesBefore.length + 1; // +1 for the ``` line itself

      blocks.push({
        lang,
        code,
        start,
        startLine,
        extension: LANG_MAP[lang],
      });
    }
  }

  return blocks;
}

module.exports = {
  /**
   * Pre-process Markdown file to extract code blocks
   * @param {string} text - Markdown source code
   * @param {string} filename - Original filename
   * @returns {Array<Object>} Array of code blocks to lint
   */
  preprocess(text, filename) {
    const codeBlocks = extractCodeBlocks(text);

    if (codeBlocks.length === 0) {
      // No supported code blocks, return empty virtual file
      return [{ text: "", filename: `${filename}/0_empty.js` }];
    }

    // Store metadata for postprocess
    this._markdownBlocks = this._markdownBlocks || {};
    this._markdownBlocks[filename] = {
      blocks: codeBlocks,
      text,
    };

    // Return each code block as a separate virtual file
    return codeBlocks.map((block, index) => ({
      text: block.code,
      filename: `${filename}/${index}${block.extension}`,
    }));
  },

  /**
   * Post-process to combine and adjust messages
   * @param {Array<Array<Object>>} messages - Messages from each code block
   * @param {string} filename - Original filename
   * @returns {Array<Object>} Combined messages
   */
  postprocess(messages, filename) {
    const metadata = this._markdownBlocks && this._markdownBlocks[filename];
    const result = [];

    // Process messages from each code block
    for (let blockIndex = 0; blockIndex < messages.length; blockIndex++) {
      const blockMessages = messages[blockIndex];

      for (const msg of blockMessages) {
        const newMessage = { ...msg };

        // Adjust line numbers to account for code block position
        if (metadata && metadata.blocks[blockIndex]) {
          const block = metadata.blocks[blockIndex];
          newMessage.line = (newMessage.line || 1) + block.startLine - 1;

          // Add context about which code block
          newMessage.message = `[Markdown ${block.lang} block] ${msg.message}`;
        } else {
          newMessage.message = `[Markdown code block] ${msg.message}`;
        }

        result.push(newMessage);
      }
    }

    // Clean up stored metadata
    if (this._markdownBlocks) {
      delete this._markdownBlocks[filename];
    }

    return result;
  },

  /**
   * Autofix is not supported for Markdown code blocks
   * (would require careful handling of code block boundaries)
   */
  supportsAutofix: false,
};
