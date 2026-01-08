/**
 * @fileoverview ESLint wrapper for standalone linting
 * @author Jules
 *
 * This module provides the core linting functionality for the CLI.
 * It wraps ESLint with lint-my-lines rules pre-configured, allowing
 * users to lint files without setting up an ESLint configuration.
 *
 * ## ESLint Version Support
 *
 * This module supports both ESLint v8 and v9 using the eslint-compat
 * utilities. The appropriate ESLint instance is created based on the
 * installed version.
 *
 * ## Usage
 *
 * @example
 * const { lintFiles } = require('./lint');
 *
 * // Lint with recommended preset
 * const exitCode = await lintFiles(['src/**\/*.js'], {
 *   preset: 'recommended',
 *   fix: false,
 *   format: 'stylish'
 * });
 *
 * @module cli/lint
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

// v1.0.3: Use ESLint compat utilities for version-appropriate instance creation
const {
  createESLintInstance,
  isESLintV9,
  getESLintVersion,
} = require("../utils/eslint-compat");

// v1.0.3: Use cache integration for improved performance
const { getCacheConfig } = require("../utils/cache-integration");

// v1.0.3: Debug logging
const { createLogger } = require("../utils/debug");

// ESLint is still needed for outputFixes static method
const { ESLint } = require("eslint");

// Load the plugin directly
const plugin = require("../index");

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

/**
 * Logger for CLI operations
 * @type {Object}
 */
const log = createLogger("cli");

// ---------------------------------------------------------------------------
// Preset Definitions
// ---------------------------------------------------------------------------

/**
 * Preset rule configurations.
 *
 * These are the same as the configs in lib/index.js but extracted here
 * for the CLI's standalone operation. The CLI doesn't rely on the
 * flat config system since it creates its own ESLint instance.
 *
 * @type {Object<string, Object>}
 */
const presetRules = {
  /**
   * Minimal preset - Essential comment hygiene.
   */
  minimal: {
    "lint-my-lines/enforce-todo-format": "warn",
    "lint-my-lines/enforce-fixme-format": "warn",
    "lint-my-lines/enforce-note-format": "warn",
    "lint-my-lines/no-commented-code": "warn",
  },

  /**
   * Recommended preset - Balanced defaults.
   */
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

  /**
   * Strict preset - Maximum enforcement.
   */
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

  /**
   * Analysis preset - Advanced analysis rules.
   */
  analysis: {
    "lint-my-lines/stale-comment-detection": "warn",
    "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 30 }],
    "lint-my-lines/comment-code-ratio": ["warn", { minRatio: 0.05, maxRatio: 0.40 }],
  },
};

// ---------------------------------------------------------------------------
// Main Function
// ---------------------------------------------------------------------------

/**
 * Lint files using ESLint with lint-my-lines rules.
 *
 * This function creates an ESLint instance configured with lint-my-lines
 * rules and lints the specified file patterns. It supports:
 *
 * - Multiple presets (minimal, recommended, strict, analysis)
 * - Autofix with the --fix option
 * - Multiple output formats (stylish, json, compact, etc.)
 * - Both ESLint v8 and v9
 *
 * @param {string[]} patterns - File patterns to lint (glob patterns)
 * @param {Object} options - Lint options
 * @param {string} [options.preset="recommended"] - Rule preset to use
 * @param {boolean} [options.fix=false] - Auto-fix issues where possible
 * @param {string} [options.format="stylish"] - Output format for results
 * @param {boolean} [options.cache=false] - Enable caching for faster repeat runs
 * @returns {Promise<number>} Exit code (0 = success/warnings only, 1 = errors found)
 *
 * @example
 * // Lint all JavaScript files in src/
 * const exitCode = await lintFiles(['src/**\/*.js']);
 *
 * @example
 * // Lint with strict preset and autofix
 * const exitCode = await lintFiles(['src/**\/*.js'], {
 *   preset: 'strict',
 *   fix: true
 * });
 *
 * @example
 * // Output as JSON for CI integration
 * const exitCode = await lintFiles(['src/**\/*.js'], {
 *   format: 'json'
 * });
 */
async function lintFiles(patterns, options = {}) {
  // Extract options with defaults
  const preset = options.preset || "recommended";
  const fix = options.fix || false;
  const format = options.format || "stylish";
  const enableCache = options.cache || false;

  log.debug("Starting lint with preset=%s, fix=%s, format=%s", preset, fix, format);
  log.debug("ESLint version: %s (v9: %s)", getESLintVersion(), isESLintV9());

  // -------------------------------------------------------------------------
  // Validate preset
  // -------------------------------------------------------------------------

  const validPresets = Object.keys(presetRules);
  if (!validPresets.includes(preset)) {
    console.error(`Error: Invalid preset "${preset}". Choose from: ${validPresets.join(", ")}`);
    return 1;
  }

  log.debug("Using preset: %s with %d rules", preset, Object.keys(presetRules[preset]).length);

  try {
    // -------------------------------------------------------------------------
    // Build ESLint configuration
    // -------------------------------------------------------------------------

    // Get cache configuration if caching is enabled
    const cacheConfig = enableCache
      ? getCacheConfig({ enabled: true, preset })
      : { cache: false };

    log.debug("Cache config: %j", cacheConfig);

    // Build the override config for lint-my-lines rules
    const overrideConfig = {
      plugins: ["lint-my-lines"],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      rules: presetRules[preset],
    };

    // -------------------------------------------------------------------------
    // Create ESLint instance
    // -------------------------------------------------------------------------

    // Use the compat utility to create a version-appropriate ESLint instance
    const eslint = createESLintInstance({
      fix,
      plugins: {
        "lint-my-lines": plugin,
      },
      overrideConfig,
      ...cacheConfig,
    });

    log.debug("ESLint instance created");

    // -------------------------------------------------------------------------
    // Run linting
    // -------------------------------------------------------------------------

    log.debug("Linting patterns: %j", patterns);

    const results = await eslint.lintFiles(patterns);

    log.debug("Lint complete: %d file(s) checked", results.length);

    // -------------------------------------------------------------------------
    // Apply fixes if requested
    // -------------------------------------------------------------------------

    if (fix) {
      log.debug("Applying fixes");
      await ESLint.outputFixes(results);
    }

    // -------------------------------------------------------------------------
    // Format and output results
    // -------------------------------------------------------------------------

    const formatter = await eslint.loadFormatter(format);
    const output = formatter.format(results);

    if (output) {
      console.log(output);
    }

    // -------------------------------------------------------------------------
    // Calculate and display summary
    // -------------------------------------------------------------------------

    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
    const fixableCount = results.reduce(
      (sum, r) => sum + r.fixableErrorCount + r.fixableWarningCount,
      0
    );

    log.debug("Results: %d errors, %d warnings, %d fixable", errorCount, warningCount, fixableCount);

    // Show summary message
    if (errorCount === 0 && warningCount === 0) {
      console.log("\nNo issues found.");
    } else if (fixableCount > 0 && !fix) {
      console.log(`\n${fixableCount} issue(s) can be auto-fixed with --fix`);
    }

    // Return exit code based on errors
    // Warnings don't cause non-zero exit code
    return errorCount > 0 ? 1 : 0;
  } catch (error) {
    log.error("Lint error: %s", error.message);
    console.error("Error running lint:", error.message);
    return 1;
  }
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = { lintFiles };
