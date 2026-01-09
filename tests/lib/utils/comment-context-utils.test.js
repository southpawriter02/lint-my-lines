/**
 * @fileoverview Tests for comment-context-utils.js
 */
"use strict";

const assert = require("assert");
const {
  WHY_INDICATORS,
  DOC_COMMENT_PATTERNS,
  INLINE_COMMENT_PATTERNS,
  COMMENT_CONTEXT_SCHEMA,
  hasWhyIndicator,
  isDocumentationComment,
  isInlineComment,
  getCommentPurpose,
  classifyCommentContext,
  shouldSkipByContext,
  getContextSeverity,
} = require("../../../lib/utils/comment-context-utils");

describe("comment-context-utils", function () {
  describe("hasWhyIndicator", function () {
    describe("should detect why indicators", function () {
      const whyComments = [
        "because the API requires it",
        "since we need backwards compatibility",
        "due to a bug in the library",
        "workaround for issue #123",
        "fix for the race condition",
        "needed for performance",
        "required for IE11 support",
        "important: this must be called first",
        "note: this is intentional",
        "warning: this may throw",
        "deliberately left empty",
        "optimization for large datasets",
        "legacy code, don't touch",
        "temporary until v2.0",
        "business rule requires this",
        "edge case handling",
        "prevent memory leaks",
      ];

      whyComments.forEach((text) => {
        it(`should detect: "${text.substring(0, 40)}..."`, function () {
          assert.strictEqual(hasWhyIndicator(text), true);
        });
      });
    });

    describe("should NOT detect why indicators in regular comments", function () {
      const regularComments = [
        "increment the counter",
        "get the value",
        "set the name",
        "return the result",
        "loop through items",
        "check if valid",
        "create new instance",
        "parse the JSON",
      ];

      regularComments.forEach((text) => {
        it(`should NOT detect: "${text}"`, function () {
          assert.strictEqual(hasWhyIndicator(text), false);
        });
      });
    });

    it("should be case-insensitive", function () {
      assert.strictEqual(hasWhyIndicator("BECAUSE of X"), true);
      assert.strictEqual(hasWhyIndicator("Because of X"), true);
      assert.strictEqual(hasWhyIndicator("because of X"), true);
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(hasWhyIndicator(null), false);
      assert.strictEqual(hasWhyIndicator(undefined), false);
      assert.strictEqual(hasWhyIndicator(""), false);
    });
  });

  describe("isDocumentationComment", function () {
    it("should identify JSDoc comments", function () {
      assert.strictEqual(
        isDocumentationComment({ isJSDoc: true }),
        true
      );
    });

    it("should identify file header comments", function () {
      assert.strictEqual(
        isDocumentationComment({ isFileHeader: true }),
        true
      );
      assert.strictEqual(
        isDocumentationComment({ text: "@fileoverview Main entry point" }),
        true
      );
    });

    it("should identify copyright comments", function () {
      assert.strictEqual(
        isDocumentationComment({ isCopyright: true }),
        true
      );
      assert.strictEqual(
        isDocumentationComment({ text: "Copyright 2024 Example Inc." }),
        true
      );
      assert.strictEqual(
        isDocumentationComment({ text: "Licensed under MIT" }),
        true
      );
    });

    it("should identify JSDoc tag patterns", function () {
      const docPatterns = [
        "@param name The name",
        "@returns The result",
        "@throws Error if invalid",
        "@typedef {Object} Options",
        "@interface Configurable",
        "@public",
        "@private",
      ];

      docPatterns.forEach((text) => {
        assert.strictEqual(
          isDocumentationComment({ text }),
          true,
          `Should identify: ${text}`
        );
      });
    });

    it("should NOT identify inline comments as documentation", function () {
      assert.strictEqual(
        isDocumentationComment({ isLine: true, text: "increment counter" }),
        false
      );
      assert.strictEqual(
        isDocumentationComment({ isTodo: true, text: "TODO: fix this" }),
        false
      );
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(isDocumentationComment(null), false);
      assert.strictEqual(isDocumentationComment(undefined), false);
    });
  });

  describe("isInlineComment", function () {
    it("should identify line comments", function () {
      assert.strictEqual(
        isInlineComment({ isLine: true }),
        true
      );
    });

    it("should identify TODO comments", function () {
      assert.strictEqual(
        isInlineComment({ isTodo: true }),
        true
      );
      assert.strictEqual(
        isInlineComment({ isFixme: true }),
        true
      );
      assert.strictEqual(
        isInlineComment({ isNote: true }),
        true
      );
      assert.strictEqual(
        isInlineComment({ isAction: true }),
        true
      );
    });

    it("should identify directive comments", function () {
      assert.strictEqual(
        isInlineComment({ isDirective: true }),
        true
      );
    });

    it("should NOT identify JSDoc as inline", function () {
      assert.strictEqual(
        isInlineComment({ isJSDoc: true }),
        false
      );
    });

    it("should NOT identify file headers as inline", function () {
      assert.strictEqual(
        isInlineComment({ isFileHeader: true }),
        false
      );
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(isInlineComment(null), false);
      assert.strictEqual(isInlineComment(undefined), false);
    });
  });

  describe("getCommentPurpose", function () {
    it("should return 'documentation' for JSDoc comments", function () {
      assert.strictEqual(
        getCommentPurpose({ isJSDoc: true }),
        "documentation"
      );
    });

    it("should return 'documentation' for file headers", function () {
      assert.strictEqual(
        getCommentPurpose({ isFileHeader: true }),
        "documentation"
      );
    });

    it("should return 'todo' for action items", function () {
      assert.strictEqual(
        getCommentPurpose({ isTodo: true }),
        "todo"
      );
      assert.strictEqual(
        getCommentPurpose({ isFixme: true }),
        "todo"
      );
      assert.strictEqual(
        getCommentPurpose({ isAction: true }),
        "todo"
      );
    });

    it("should return 'directive' for ESLint directives", function () {
      assert.strictEqual(
        getCommentPurpose({ isDirective: true }),
        "directive"
      );
    });

    it("should return 'explanation' for comments with why indicators", function () {
      assert.strictEqual(
        getCommentPurpose({ text: "because the API requires it" }),
        "explanation"
      );
    });

    it("should return 'noise' for obvious/redundant comments", function () {
      assert.strictEqual(
        getCommentPurpose({ text: "increment the counter" }),
        "noise"
      );
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(getCommentPurpose(null), "noise");
      assert.strictEqual(getCommentPurpose(undefined), "noise");
    });
  });

  describe("classifyCommentContext", function () {
    it("should return full classification for documentation comment", function () {
      const result = classifyCommentContext({ isJSDoc: true, text: "@param x" });
      assert.strictEqual(result.isDocumentationComment, true);
      assert.strictEqual(result.isInlineComment, false);
      assert.strictEqual(result.purpose, "documentation");
    });

    it("should return full classification for inline comment", function () {
      const result = classifyCommentContext({ isLine: true, text: "increment" });
      assert.strictEqual(result.isDocumentationComment, false);
      assert.strictEqual(result.isInlineComment, true);
      assert.strictEqual(result.purpose, "noise");
    });

    it("should detect why indicators", function () {
      const result = classifyCommentContext({ isLine: true, text: "because X" });
      assert.strictEqual(result.hasWhyIndicator, true);
      assert.strictEqual(result.purpose, "explanation");
    });

    it("should handle comments with location (for caching)", function () {
      const comment = {
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      };
      const classified = { isLine: true, text: "test", comment };

      // First call should cache
      const result1 = classifyCommentContext(classified);
      // Second call should use cache
      const result2 = classifyCommentContext(classified);

      assert.deepStrictEqual(result1, result2);
    });

    it("should handle null/undefined gracefully", function () {
      const result = classifyCommentContext(null);
      assert.strictEqual(result.isDocumentationComment, false);
      assert.strictEqual(result.isInlineComment, false);
      assert.strictEqual(result.purpose, "noise");
      assert.strictEqual(result.hasWhyIndicator, false);
    });
  });

  describe("shouldSkipByContext", function () {
    it("should skip documentation comments when configured", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        shouldSkipByContext(classified, { documentationComments: "skip" }),
        true
      );
    });

    it("should NOT skip documentation comments by default", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        shouldSkipByContext(classified, {}),
        false
      );
    });

    it("should skip inline comments when configured", function () {
      const classified = { isLine: true };
      assert.strictEqual(
        shouldSkipByContext(classified, { inlineComments: "skip" }),
        true
      );
    });

    it("should NOT skip inline comments by default", function () {
      const classified = { isLine: true };
      assert.strictEqual(
        shouldSkipByContext(classified, {}),
        false
      );
    });

    it("should handle 'normal' and 'strict' modes (not skip)", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        shouldSkipByContext(classified, { documentationComments: "normal" }),
        false
      );
      assert.strictEqual(
        shouldSkipByContext(classified, { documentationComments: "strict" }),
        false
      );
    });
  });

  describe("getContextSeverity", function () {
    it("should return 'strict' for documentation in strict mode", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        getContextSeverity(classified, { documentationComments: "strict" }),
        "strict"
      );
    });

    it("should return 'strict' for inline in strict mode", function () {
      const classified = { isLine: true };
      assert.strictEqual(
        getContextSeverity(classified, { inlineComments: "strict" }),
        "strict"
      );
    });

    it("should return 'normal' by default", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        getContextSeverity(classified, {}),
        "normal"
      );
    });

    it("should return 'normal' for 'skip' mode", function () {
      const classified = { isJSDoc: true };
      assert.strictEqual(
        getContextSeverity(classified, { documentationComments: "skip" }),
        "normal"
      );
    });
  });

  describe("constants", function () {
    it("should export WHY_INDICATORS as array of strings", function () {
      assert(Array.isArray(WHY_INDICATORS));
      assert(WHY_INDICATORS.every((i) => typeof i === "string"));
      assert(WHY_INDICATORS.includes("because"));
      assert(WHY_INDICATORS.includes("workaround"));
    });

    it("should export DOC_COMMENT_PATTERNS as array of RegExp", function () {
      assert(Array.isArray(DOC_COMMENT_PATTERNS));
      assert(DOC_COMMENT_PATTERNS.every((p) => p instanceof RegExp));
    });

    it("should export INLINE_COMMENT_PATTERNS as array of RegExp", function () {
      assert(Array.isArray(INLINE_COMMENT_PATTERNS));
      assert(INLINE_COMMENT_PATTERNS.every((p) => p instanceof RegExp));
    });

    it("should export COMMENT_CONTEXT_SCHEMA as valid JSON schema", function () {
      assert.strictEqual(COMMENT_CONTEXT_SCHEMA.type, "object");
      assert(COMMENT_CONTEXT_SCHEMA.properties.documentationComments);
      assert(COMMENT_CONTEXT_SCHEMA.properties.inlineComments);
      assert.deepStrictEqual(
        COMMENT_CONTEXT_SCHEMA.properties.documentationComments.enum,
        ["strict", "normal", "skip"]
      );
    });
  });
});
