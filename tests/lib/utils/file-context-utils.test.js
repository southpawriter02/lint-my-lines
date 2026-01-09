/**
 * @fileoverview Tests for file-context-utils.js
 */
"use strict";

const assert = require("assert");
const {
  TEST_FILE_PATTERNS,
  GENERATED_FILE_PATTERNS,
  MINIFIED_FILE_PATTERNS,
  GENERATED_CONTENT_MARKERS,
  isTestFile,
  isGeneratedFile,
  isMinifiedFile,
  hasGeneratedMarker,
  detectFileContext,
  getTestFileGlobs,
  getGeneratedFileGlobs,
  getMinifiedFileGlobs,
} = require("../../../lib/utils/file-context-utils");

describe("file-context-utils", function () {
  describe("isTestFile", function () {
    describe("should identify test files", function () {
      const testFiles = [
        "src/utils.test.js",
        "src/utils.test.ts",
        "src/utils.test.jsx",
        "src/utils.test.tsx",
        "src/utils.spec.js",
        "src/utils.spec.ts",
        "components/Button.spec.jsx",
        "__tests__/utils.js",
        "__tests__/nested/deep.js",
        "tests/unit/foo.js",
        "test/integration/bar.js",
        "src/Button.stories.js",
        "src/Button.stories.tsx",
        "e2e/login.e2e.js",
        "cypress/login.cy.js",
        "playwright/home.pw.ts",
      ];

      testFiles.forEach((file) => {
        it(`should match: ${file}`, function () {
          assert.strictEqual(isTestFile(file), true);
        });
      });
    });

    describe("should NOT identify regular files as test files", function () {
      const regularFiles = [
        "src/utils.js",
        "src/index.ts",
        "lib/helper.jsx",
        "components/Button.tsx",
        "package.json",
        "README.md",
        "testutils.js", // No dot before test
        "contestspec.js", // Part of word
      ];

      regularFiles.forEach((file) => {
        it(`should NOT match: ${file}`, function () {
          assert.strictEqual(isTestFile(file), false);
        });
      });
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(isTestFile(null), false);
      assert.strictEqual(isTestFile(undefined), false);
      assert.strictEqual(isTestFile(""), false);
    });
  });

  describe("isGeneratedFile", function () {
    describe("should identify generated files", function () {
      const generatedFiles = [
        "dist/bundle.js",
        "build/index.js",
        "out/main.js",
        "output/bundle.js",
        "types/index.d.ts",
        "src/types.d.mts",
        "lib/types.d.cts",
        "src/schema.generated.ts",
        "api/types.g.ts",
        "__generated__/graphql.ts",
        "generated/api.js",
        "node_modules/lodash/index.js",
        "coverage/lcov-report/index.html",
        ".cache/build.js",
        ".next/server/pages/index.js",
        ".nuxt/components.js",
      ];

      generatedFiles.forEach((file) => {
        it(`should match: ${file}`, function () {
          assert.strictEqual(isGeneratedFile(file), true);
        });
      });
    });

    describe("should NOT identify regular files as generated", function () {
      const regularFiles = [
        "src/utils.js",
        "lib/helper.ts",
        "components/Button.jsx",
        "index.js",
        "package.json",
        "generateUtils.js", // Part of word
        "distribution.js", // Part of word
      ];

      regularFiles.forEach((file) => {
        it(`should NOT match: ${file}`, function () {
          assert.strictEqual(isGeneratedFile(file), false);
        });
      });
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(isGeneratedFile(null), false);
      assert.strictEqual(isGeneratedFile(undefined), false);
    });
  });

  describe("isMinifiedFile", function () {
    describe("should identify minified files", function () {
      const minifiedFiles = [
        "dist/app.min.js",
        "public/styles.min.css",
        "lib/vendor.min.mjs",
        "dist/bundle.bundle.js",
        "vendor-min.js",
        "app_min.js",
        "lib/vendor.js",
      ];

      minifiedFiles.forEach((file) => {
        it(`should match: ${file}`, function () {
          assert.strictEqual(isMinifiedFile(file), true);
        });
      });
    });

    describe("should NOT identify regular files as minified", function () {
      const regularFiles = [
        "src/utils.js",
        "lib/helper.ts",
        "minute.js", // Part of word
        "minify.js", // Part of word
        "src/admin.js",
      ];

      regularFiles.forEach((file) => {
        it(`should NOT match: ${file}`, function () {
          assert.strictEqual(isMinifiedFile(file), false);
        });
      });
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(isMinifiedFile(null), false);
      assert.strictEqual(isMinifiedFile(undefined), false);
    });
  });

  describe("hasGeneratedMarker", function () {
    describe("should detect generated content markers", function () {
      const generatedContents = [
        "// @generated\nconst x = 1;",
        "/* @auto-generated */\nexport const y = 2;",
        "// AUTO-GENERATED FILE - DO NOT EDIT\nmodule.exports = {};",
        "/**\n * This file is auto-generated\n */\nconst z = 3;",
        "// Generated by graphql-codegen\ntype Query = {};",
        "// Automatically generated from schema\nexport {}",
        "// AUTOGENERATED - do not modify\nconst data = [];",
        "// Code generated by protoc\nmessage Foo {}",
      ];

      generatedContents.forEach((content, i) => {
        it(`should match generated content ${i + 1}`, function () {
          assert.strictEqual(hasGeneratedMarker(content), true);
        });
      });
    });

    describe("should NOT detect regular content as generated", function () {
      const regularContents = [
        "const x = 1;",
        "// This is a regular comment\nconst y = 2;",
        "/* Normal comment */\nexport const z = 3;",
        "// TODO: Generate the schema\nconst schema = {};",
      ];

      regularContents.forEach((content, i) => {
        it(`should NOT match regular content ${i + 1}`, function () {
          assert.strictEqual(hasGeneratedMarker(content), false);
        });
      });
    });

    it("should handle null/undefined gracefully", function () {
      assert.strictEqual(hasGeneratedMarker(null), false);
      assert.strictEqual(hasGeneratedMarker(undefined), false);
      assert.strictEqual(hasGeneratedMarker(""), false);
    });

    it("should only check the first 500 characters", function () {
      // Create content with marker after 500 chars
      const padding = "x".repeat(600);
      const content = `const x = 1;\n${padding}\n// @generated`;
      assert.strictEqual(hasGeneratedMarker(content), false);
    });
  });

  describe("detectFileContext", function () {
    it("should detect all context flags", function () {
      const result = detectFileContext("src/utils.js");
      assert.deepStrictEqual(result, {
        isTestFile: false,
        isGeneratedFile: false,
        isMinifiedFile: false,
      });
    });

    it("should detect test file", function () {
      const result = detectFileContext("src/utils.test.js");
      assert.strictEqual(result.isTestFile, true);
      assert.strictEqual(result.isGeneratedFile, false);
      assert.strictEqual(result.isMinifiedFile, false);
    });

    it("should detect generated file", function () {
      const result = detectFileContext("dist/bundle.js");
      assert.strictEqual(result.isTestFile, false);
      assert.strictEqual(result.isGeneratedFile, true);
      assert.strictEqual(result.isMinifiedFile, false);
    });

    it("should detect minified file", function () {
      const result = detectFileContext("dist/app.min.js");
      assert.strictEqual(result.isTestFile, false);
      assert.strictEqual(result.isGeneratedFile, true); // dist/ makes it generated too
      assert.strictEqual(result.isMinifiedFile, true);
    });

    it("should detect multiple flags", function () {
      // A minified file in dist is both generated and minified
      const result = detectFileContext("dist/vendor.min.js");
      assert.strictEqual(result.isGeneratedFile, true);
      assert.strictEqual(result.isMinifiedFile, true);
    });
  });

  describe("glob helpers", function () {
    describe("getTestFileGlobs", function () {
      it("should return an array of glob patterns", function () {
        const globs = getTestFileGlobs();
        assert(Array.isArray(globs));
        assert(globs.length > 0);
      });

      it("should include common test patterns", function () {
        const globs = getTestFileGlobs();
        assert(globs.includes("**/*.test.js"));
        assert(globs.includes("**/*.spec.ts"));
        assert(globs.includes("**/__tests__/**/*.js"));
      });
    });

    describe("getGeneratedFileGlobs", function () {
      it("should return an array of glob patterns", function () {
        const globs = getGeneratedFileGlobs();
        assert(Array.isArray(globs));
        assert(globs.length > 0);
      });

      it("should include common generated patterns", function () {
        const globs = getGeneratedFileGlobs();
        assert(globs.includes("**/dist/**"));
        assert(globs.includes("**/build/**"));
        assert(globs.includes("**/*.d.ts"));
      });
    });

    describe("getMinifiedFileGlobs", function () {
      it("should return an array of glob patterns", function () {
        const globs = getMinifiedFileGlobs();
        assert(Array.isArray(globs));
        assert(globs.length > 0);
      });

      it("should include common minified patterns", function () {
        const globs = getMinifiedFileGlobs();
        assert(globs.includes("**/*.min.js"));
        assert(globs.includes("**/*.min.css"));
        assert(globs.includes("**/*.bundle.js"));
      });
    });
  });

  describe("pattern constants", function () {
    it("should export TEST_FILE_PATTERNS as array of RegExp", function () {
      assert(Array.isArray(TEST_FILE_PATTERNS));
      assert(TEST_FILE_PATTERNS.every((p) => p instanceof RegExp));
    });

    it("should export GENERATED_FILE_PATTERNS as array of RegExp", function () {
      assert(Array.isArray(GENERATED_FILE_PATTERNS));
      assert(GENERATED_FILE_PATTERNS.every((p) => p instanceof RegExp));
    });

    it("should export MINIFIED_FILE_PATTERNS as array of RegExp", function () {
      assert(Array.isArray(MINIFIED_FILE_PATTERNS));
      assert(MINIFIED_FILE_PATTERNS.every((p) => p instanceof RegExp));
    });

    it("should export GENERATED_CONTENT_MARKERS as array of strings", function () {
      assert(Array.isArray(GENERATED_CONTENT_MARKERS));
      assert(GENERATED_CONTENT_MARKERS.every((m) => typeof m === "string"));
    });
  });
});
