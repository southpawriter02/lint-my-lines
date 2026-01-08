/**
 * @fileoverview Integration tests for ESLint plugin behavior.
 * @author Jules
 */
"use strict";

const { ESLint } = require("eslint");
const assert = require("assert");
const plugin = require("../../lib/index");

describe("ESLint Integration", function() {
  // Increase timeout for ESLint operations
  this.timeout(10000);

  describe("Legacy Config Support", function() {
    it("should lint code with enforce-todo-format rule", async function() {
      const eslint = new ESLint({
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error"
          }
        }
      });

      const results = await eslint.lintText("// TODO: Fix this");
      assert.strictEqual(results[0].messages.length, 1);
      assert.strictEqual(results[0].messages[0].ruleId, "lint-my-lines/enforce-todo-format");
    });

    it("should not report for valid TODO format", async function() {
      const eslint = new ESLint({
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error"
          }
        }
      });

      const results = await eslint.lintText("// TODO (TICKET-123): Fix this");
      assert.strictEqual(results[0].messages.length, 0);
    });

    it("should apply autofix correctly", async function() {
      const eslint = new ESLint({
        fix: true,
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error"
          }
        }
      });

      const results = await eslint.lintText("// TODO: Fix this");
      assert.strictEqual(results[0].output, "// TODO (TICKET-XXX): Fix this");
    });
  });

  describe("Multi-Rule Interaction", function() {
    it("should handle multiple rules on same file", async function() {
      const eslint = new ESLint({
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error",
            "lint-my-lines/enforce-comment-length": ["error", { maxLength: 30 }]
          }
        }
      });

      const code = `// TODO: This is a very long comment that exceeds the limit`;
      const results = await eslint.lintText(code);

      // Should have at least one error (TODO format)
      assert(results[0].messages.length >= 1);
      const ruleIds = results[0].messages.map(m => m.ruleId);
      assert(ruleIds.includes("lint-my-lines/enforce-todo-format"));
    });

    it("should not have conflicting fixes", async function() {
      const eslint = new ESLint({
        fix: true,
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-capitalization": "error",
            "lint-my-lines/comment-spacing": "error"
          }
        }
      });

      const code = `//lowercase without space`;
      const results = await eslint.lintText(code);

      // Should have output (fixes applied)
      assert(results[0].output !== undefined);
    });
  });

  describe("Preset Configurations", function() {
    it("minimal preset should define rules", function() {
      assert(plugin.configs.minimal !== undefined);
      assert(plugin.configs.minimal.rules !== undefined);
    });

    it("recommended preset should define rules", function() {
      assert(plugin.configs.recommended !== undefined);
      assert(plugin.configs.recommended.rules !== undefined);
    });

    it("strict preset should define rules", function() {
      assert(plugin.configs.strict !== undefined);
      assert(plugin.configs.strict.rules !== undefined);
    });

    it("analysis preset should define rules", function() {
      assert(plugin.configs.analysis !== undefined);
      assert(plugin.configs.analysis.rules !== undefined);
    });

    it("flat/minimal preset should be available", function() {
      assert(plugin.configs["flat/minimal"] !== undefined);
    });

    it("flat/recommended preset should be available", function() {
      assert(plugin.configs["flat/recommended"] !== undefined);
    });

    it("flat/strict preset should be available", function() {
      assert(plugin.configs["flat/strict"] !== undefined);
    });
  });

  describe("Rule Exports", function() {
    it("should export all 21 rules", function() {
      const expectedRules = [
        "enforce-todo-format",
        "enforce-fixme-format",
        "enforce-note-format",
        "enforce-comment-length",
        "enforce-capitalization",
        "comment-spacing",
        "no-commented-code",
        "no-obvious-comments",
        "ban-specific-words",
        "require-explanation-comments",
        "require-jsdoc",
        "valid-jsdoc",
        "valid-tsdoc",
        "jsdoc-type-syntax",
        "require-file-header",
        "vue-template-comments",
        "svelte-template-comments",
        "stale-comment-detection",
        "todo-aging-warnings",
        "comment-code-ratio",
        "issue-tracker-integration"
      ];

      for (const ruleName of expectedRules) {
        assert(plugin.rules[ruleName] !== undefined, `Missing rule: ${ruleName}`);
      }
    });

    it("should export processors", function() {
      assert(plugin.processors !== undefined);
      assert(plugin.processors[".vue"] !== undefined);
      assert(plugin.processors[".svelte"] !== undefined);
      assert(plugin.processors[".md"] !== undefined);
    });
  });

  describe("Error Messages", function() {
    it("should provide clear error messages", async function() {
      const eslint = new ESLint({
        useEslintrc: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error"
          }
        }
      });

      const results = await eslint.lintText("// TODO: Fix this");
      const message = results[0].messages[0];

      assert(message.message.length > 0);
      assert(message.line !== undefined);
      assert(message.column !== undefined);
    });
  });

  describe("Cache Clearing", function() {
    it("should export clearCaches function", function() {
      assert(typeof plugin.clearCaches === "function");
    });

    it("should not throw when calling clearCaches", function() {
      assert.doesNotThrow(() => plugin.clearCaches());
    });
  });
});
