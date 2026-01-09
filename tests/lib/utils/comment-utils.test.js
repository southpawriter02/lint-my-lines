/**
 * @fileoverview Tests for comment-utils.js ignore pattern utilities.
 */
"use strict";

const assert = require("assert");
const {
  isInsideUrl,
  stripUrls,
  isInsideCodeBlock,
  isInsideInlineCode,
  stripCodeBlocks,
  stripInlineCode,
  applyIgnoreRegex,
  processTextWithIgnores,
} = require("../../../lib/utils/comment-utils");

describe("comment-utils", function () {
  describe("isInsideUrl", function () {
    it("returns true for position inside https URL", function () {
      const text = "See https://example.com for info";
      // "See " = 4 chars, URL starts at position 4
      assert.strictEqual(isInsideUrl(text, 4), true);  // 'h' of https
      assert.strictEqual(isInsideUrl(text, 10), true); // '/' after https:
      assert.strictEqual(isInsideUrl(text, 22), true); // 'm' of .com (last char)
    });

    it("returns true for position inside http URL", function () {
      const text = "Check http://legacy.example.com/path here";
      assert.strictEqual(isInsideUrl(text, 6), true);
      assert.strictEqual(isInsideUrl(text, 20), true);
    });

    it("returns false for position outside URL", function () {
      const text = "See https://example.com for info";
      assert.strictEqual(isInsideUrl(text, 0), false);  // 'S'
      assert.strictEqual(isInsideUrl(text, 28), false); // 'f' of 'for'
    });

    it("handles multiple URLs", function () {
      const text = "See https://a.com and https://b.com here";
      assert.strictEqual(isInsideUrl(text, 5), true);   // first URL
      assert.strictEqual(isInsideUrl(text, 18), false); // 'and'
      assert.strictEqual(isInsideUrl(text, 25), true);  // second URL
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(isInsideUrl(null, 0), false);
      assert.strictEqual(isInsideUrl(undefined, 0), false);
      assert.strictEqual(isInsideUrl("", 0), false);
      assert.strictEqual(isInsideUrl("test", -1), false);
    });

    it("handles URLs at end of text", function () {
      const text = "Visit https://example.com";
      assert.strictEqual(isInsideUrl(text, 24), true);
    });
  });

  describe("stripUrls", function () {
    it("removes single https URL", function () {
      const text = "See https://example.com for info";
      assert.strictEqual(stripUrls(text), "See  for info");
    });

    it("removes single http URL", function () {
      const text = "Check http://legacy.example.com here";
      assert.strictEqual(stripUrls(text), "Check  here");
    });

    it("removes multiple URLs", function () {
      const text = "See https://a.com and http://b.com here";
      assert.strictEqual(stripUrls(text), "See  and  here");
    });

    it("preserves text without URLs", function () {
      const text = "This has no URLs at all";
      assert.strictEqual(stripUrls(text), "This has no URLs at all");
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(stripUrls(null), "");
      assert.strictEqual(stripUrls(undefined), "");
    });

    it("handles URLs with paths and query strings", function () {
      const text = "See https://example.com/path?query=value#hash for info";
      assert.strictEqual(stripUrls(text), "See  for info");
    });
  });

  describe("isInsideCodeBlock", function () {
    it("returns true for position inside code block", function () {
      const text = "See ```code``` for info";
      assert.strictEqual(isInsideCodeBlock(text, 4), true);   // first backtick
      assert.strictEqual(isInsideCodeBlock(text, 7), true);   // 'c' of code
      assert.strictEqual(isInsideCodeBlock(text, 13), true);  // last backtick
    });

    it("returns false for position outside code block", function () {
      const text = "See ```code``` for info";
      assert.strictEqual(isInsideCodeBlock(text, 0), false);  // 'S'
      assert.strictEqual(isInsideCodeBlock(text, 15), false); // 'f' of 'for'
    });

    it("handles multiline code blocks", function () {
      const text = "See ```\nconst x = 1;\n``` for info";
      assert.strictEqual(isInsideCodeBlock(text, 10), true);  // inside block
    });

    it("handles code blocks with language specifier", function () {
      const text = "See ```javascript\ncode\n``` here";
      assert.strictEqual(isInsideCodeBlock(text, 10), true);
    });

    it("handles multiple code blocks", function () {
      const text = "See ```a``` and ```b``` here";
      assert.strictEqual(isInsideCodeBlock(text, 5), true);   // first block
      assert.strictEqual(isInsideCodeBlock(text, 12), false); // 'and'
      assert.strictEqual(isInsideCodeBlock(text, 18), true);  // second block
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(isInsideCodeBlock(null, 0), false);
      assert.strictEqual(isInsideCodeBlock(undefined, 0), false);
      assert.strictEqual(isInsideCodeBlock("test", -1), false);
    });
  });

  describe("isInsideInlineCode", function () {
    it("returns true for position inside inline code", function () {
      const text = "Call `myFunc` here";
      assert.strictEqual(isInsideInlineCode(text, 5), true);  // backtick
      assert.strictEqual(isInsideInlineCode(text, 8), true);  // 'F'
    });

    it("returns false for position outside inline code", function () {
      const text = "Call `myFunc` here";
      assert.strictEqual(isInsideInlineCode(text, 0), false);  // 'C'
      assert.strictEqual(isInsideInlineCode(text, 14), false); // 'h'
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(isInsideInlineCode(null, 0), false);
      assert.strictEqual(isInsideInlineCode(undefined, 0), false);
    });
  });

  describe("stripCodeBlocks", function () {
    it("removes single code block", function () {
      const text = "See ```Array.map()``` for details";
      assert.strictEqual(stripCodeBlocks(text), "See  for details");
    });

    it("removes multiple code blocks", function () {
      const text = "Use ```a``` and ```b``` here";
      assert.strictEqual(stripCodeBlocks(text), "Use  and  here");
    });

    it("removes multiline code blocks", function () {
      const text = "See ```\nconst x = 1;\nconst y = 2;\n``` for info";
      assert.strictEqual(stripCodeBlocks(text), "See  for info");
    });

    it("preserves text without code blocks", function () {
      const text = "This has no code blocks";
      assert.strictEqual(stripCodeBlocks(text), "This has no code blocks");
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(stripCodeBlocks(null), "");
      assert.strictEqual(stripCodeBlocks(undefined), "");
    });

    it("handles code blocks with language specifier", function () {
      const text = "See ```javascript\ncode\n``` here";
      assert.strictEqual(stripCodeBlocks(text), "See  here");
    });
  });

  describe("stripInlineCode", function () {
    it("removes single inline code", function () {
      const text = "Call `myFunction` here";
      assert.strictEqual(stripInlineCode(text), "Call  here");
    });

    it("removes multiple inline codes", function () {
      const text = "Use `a` and `b` here";
      assert.strictEqual(stripInlineCode(text), "Use  and  here");
    });

    it("preserves text without inline code", function () {
      const text = "This has no inline code";
      assert.strictEqual(stripInlineCode(text), "This has no inline code");
    });

    it("handles null/undefined gracefully", function () {
      assert.strictEqual(stripInlineCode(null), "");
      assert.strictEqual(stripInlineCode(undefined), "");
    });
  });

  describe("applyIgnoreRegex", function () {
    it("removes matched content with string pattern", function () {
      const text = "Check @see UserClass for info";
      assert.strictEqual(applyIgnoreRegex(text, "@see\\s+\\S+"), "Check  for info");
    });

    it("removes matched content with RegExp pattern", function () {
      const text = "Check @link http://example.com for info";
      assert.strictEqual(applyIgnoreRegex(text, /@link\s+\S+/gi), "Check  for info");
    });

    it("removes multiple matches", function () {
      const text = "See @see A and @see B here";
      assert.strictEqual(applyIgnoreRegex(text, "@see\\s+\\S+"), "See  and  here");
    });

    it("preserves text when no match", function () {
      const text = "This has no matches";
      assert.strictEqual(applyIgnoreRegex(text, "@see\\s+\\S+"), "This has no matches");
    });

    it("handles null/undefined text gracefully", function () {
      assert.strictEqual(applyIgnoreRegex(null, "pattern"), "");
      assert.strictEqual(applyIgnoreRegex(undefined, "pattern"), "");
    });

    it("handles null/undefined pattern gracefully", function () {
      const text = "Original text";
      assert.strictEqual(applyIgnoreRegex(text, null), "Original text");
      assert.strictEqual(applyIgnoreRegex(text, undefined), "Original text");
    });

    it("handles invalid regex gracefully", function () {
      const text = "Original text";
      assert.strictEqual(applyIgnoreRegex(text, "[invalid(regex"), "Original text");
    });
  });

  describe("processTextWithIgnores", function () {
    it("removes URLs when ignoreUrls is true", function () {
      const text = "See https://example.com for info";
      assert.strictEqual(
        processTextWithIgnores(text, { ignoreUrls: true }),
        "See  for info"
      );
    });

    it("removes code blocks when ignoreCodeBlocks is true", function () {
      const text = "See ```code``` for details";
      assert.strictEqual(
        processTextWithIgnores(text, { ignoreCodeBlocks: true }),
        "See  for details"
      );
    });

    it("removes inline code when ignoreInlineCode is true", function () {
      const text = "Call `myFunc` here";
      assert.strictEqual(
        processTextWithIgnores(text, { ignoreInlineCode: true }),
        "Call  here"
      );
    });

    it("applies ignoreRegex pattern", function () {
      const text = "Check @see UserClass for info";
      assert.strictEqual(
        processTextWithIgnores(text, { ignoreRegex: "@see\\s+\\S+" }),
        "Check  for info"
      );
    });

    it("applies multiple ignore options", function () {
      const text = "See https://example.com and ```code``` here";
      assert.strictEqual(
        processTextWithIgnores(text, { ignoreUrls: true, ignoreCodeBlocks: true }),
        "See  and  here"
      );
    });

    it("preserves text when no options set", function () {
      const text = "Original text with https://url.com";
      assert.strictEqual(processTextWithIgnores(text, {}), text);
    });

    it("handles null/undefined text gracefully", function () {
      assert.strictEqual(processTextWithIgnores(null, {}), "");
      assert.strictEqual(processTextWithIgnores(undefined, {}), "");
    });

    it("handles all options together", function () {
      const text = "See https://a.com and ```block``` and `inline` @see Ref here";
      const result = processTextWithIgnores(text, {
        ignoreUrls: true,
        ignoreCodeBlocks: true,
        ignoreInlineCode: true,
        ignoreRegex: "@see\\s+\\S+",
      });
      assert.strictEqual(result, "See  and  and   here");
    });
  });
});
