/**
 * @fileoverview ESLint wrapper for standalone linting
 * @author Jules
 */
"use strict";

const { ESLint } = require("eslint");

// Load the plugin directly
const plugin = require("../index");

// Preset rule configurations (extracted from lib/index.js)
const presetRules = {
  minimal: {
    "lint-my-lines/enforce-todo-format": "warn",
    "lint-my-lines/enforce-fixme-format": "warn",
    "lint-my-lines/enforce-note-format": "warn",
    "lint-my-lines/no-commented-code": "warn",
  },
  recommended: {
    "lint-my-lines/enforce-todo-format": "warn",
    "lint-my-lines/enforce-fixme-format": "warn",
    "lint-my-lines/enforce-note-format": "warn",
    "lint-my-lines/no-commented-code": "warn",
    "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
    "lint-my-lines/enforce-capitalization": "warn",
    "lint-my-lines/comment-spacing": "warn",
    "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
  },
  strict: {
    "lint-my-lines/enforce-todo-format": "error",
    "lint-my-lines/enforce-fixme-format": "error",
    "lint-my-lines/enforce-note-format": "error",
    "lint-my-lines/no-commented-code": "error",
    "lint-my-lines/enforce-comment-length": ["error", { maxLength: 120 }],
    "lint-my-lines/enforce-capitalization": "error",
    "lint-my-lines/comment-spacing": "error",
    "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],
    "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],
    "lint-my-lines/require-explanation-comments": ["warn", { requireFor: ["regex", "bitwise"] }],
    "lint-my-lines/require-jsdoc": "warn",
    "lint-my-lines/valid-jsdoc": "warn",
    "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
    "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }],
  },
  analysis: {
    "lint-my-lines/stale-comment-detection": "warn",
    "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 30 }],
    "lint-my-lines/comment-code-ratio": ["warn", { minRatio: 0.05, maxRatio: 0.40 }],
  },
};

/**
 * Lint files using ESLint with lint-my-lines rules
 * @param {string[]} patterns - File patterns to lint
 * @param {object} options - Lint options
 * @param {string} [options.preset="recommended"] - Rule preset
 * @param {boolean} [options.fix=false] - Auto-fix issues
 * @param {string} [options.format="stylish"] - Output format
 * @returns {Promise<number>} Exit code (0 = success, 1 = errors found)
 */
async function lintFiles(patterns, options = {}) {
  const preset = options.preset || "recommended";
  const fix = options.fix || false;
  const format = options.format || "stylish";

  // Validate preset
  const validPresets = Object.keys(presetRules);
  if (!validPresets.includes(preset)) {
    console.error(`Error: Invalid preset "${preset}". Choose from: ${validPresets.join(", ")}`);
    return 1;
  }

  try {
    // Create ESLint instance with embedded config using plugin directly
    const eslint = new ESLint({
      useEslintrc: false,
      fix,
      plugins: {
        "lint-my-lines": plugin,
      },
      overrideConfig: {
        plugins: ["lint-my-lines"],
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "module",
        },
        rules: presetRules[preset],
      },
    });

    // Lint the files
    const results = await eslint.lintFiles(patterns);

    // Apply fixes if requested
    if (fix) {
      await ESLint.outputFixes(results);
    }

    // Format and output results
    const formatter = await eslint.loadFormatter(format);
    const output = formatter.format(results);

    if (output) {
      console.log(output);
    }

    // Calculate totals
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
    const fixableCount = results.reduce(
      (sum, r) => sum + r.fixableErrorCount + r.fixableWarningCount,
      0
    );

    // Show summary
    if (errorCount === 0 && warningCount === 0) {
      console.log("\nNo issues found.");
    } else if (fixableCount > 0 && !fix) {
      console.log(`\n${fixableCount} issue(s) can be auto-fixed with --fix`);
    }

    // Return exit code based on errors
    return errorCount > 0 ? 1 : 0;
  } catch (error) {
    console.error("Error running lint:", error.message);
    return 1;
  }
}

module.exports = { lintFiles };
