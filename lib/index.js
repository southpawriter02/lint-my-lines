/**
 * @fileoverview An ESLint plugin to enforce a style guide for code comments.
 * @author Jules
 *
 * This is the main entry point for the eslint-plugin-lint-my-lines package.
 * It exports:
 * - rules: All available ESLint rules
 * - configs: Configuration presets (both legacy and flat config)
 * - processors: File processors for Vue, Svelte, and Markdown
 * - meta: Plugin metadata (name and version)
 * - clearCaches: Function to clear internal caches
 *
 * ## ESLint Version Support
 *
 * This plugin supports both ESLint v8 and v9:
 * - ESLint v8: Use legacy configs (`plugin:lint-my-lines/recommended`)
 * - ESLint v9: Use flat configs (`lintMyLines.configs["flat/recommended"]`)
 *
 * @example ESLint v9 (Flat Config)
 * // eslint.config.js
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 *
 * export default [
 *   lintMyLines.configs["flat/recommended"],
 * ];
 *
 * @example ESLint v8 (Legacy Config)
 * // .eslintrc.js
 * module.exports = {
 *   extends: ["plugin:lint-my-lines/recommended"],
 * };
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

// Performance utilities (v0.12.0)
const { clearAllCaches } = require("./utils/performance-cache");

// v1.0.3: ESLint v9 compatibility utilities
const { getFlatConfigs, _clearConfigCache } = require("./configs/flat-config-factory");
const { clearCache: clearLintCache } = require("./utils/cache-integration");

// Package info for meta
const pkg = require("../package.json");

// ---------------------------------------------------------------------------
// Rule Imports
// ---------------------------------------------------------------------------

// Core rules
const enforceTodoFormat = require("./rules/enforce-todo-format");
const enforceFixmeFormat = require("./rules/enforce-fixme-format");
const enforceNoteFormat = require("./rules/enforce-note-format");
const noCommentedCode = require("./rules/no-commented-code");
const enforceCommentLength = require("./rules/enforce-comment-length");
const enforceCapitalization = require("./rules/enforce-capitalization");
const commentSpacing = require("./rules/comment-spacing");
const noObviousComments = require("./rules/no-obvious-comments");
const banSpecificWords = require("./rules/ban-specific-words");
const requireExplanationComments = require("./rules/require-explanation-comments");
const requireJsdoc = require("./rules/require-jsdoc");
const validJsdoc = require("./rules/valid-jsdoc");
const jsdocTypeSyntax = require("./rules/jsdoc-type-syntax");
const requireFileHeader = require("./rules/require-file-header");

// Language-specific rules (v0.10.0)
const validTsdoc = require("./rules/valid-tsdoc");
const vueTemplateComments = require("./rules/vue-template-comments");
const svelteTemplateComments = require("./rules/svelte-template-comments");

// Advanced analysis rules (v0.11.0)
const staleCommentDetection = require("./rules/stale-comment-detection");
const todoAgingWarnings = require("./rules/todo-aging-warnings");
const commentCodeRatio = require("./rules/comment-code-ratio");
const issueTrackerIntegration = require("./rules/issue-tracker-integration");

// Processors (v0.10.0)
const vueProcessor = require("./processors/vue");
const svelteProcessor = require("./processors/svelte");
const markdownProcessor = require("./processors/markdown");

// ---------------------------------------------------------------------------
// Rules Object
// ---------------------------------------------------------------------------

/**
 * All available rules exported by this plugin.
 *
 * Rule names do not include the plugin prefix. When using rules,
 * prefix with "lint-my-lines/" (e.g., "lint-my-lines/enforce-todo-format").
 *
 * @type {Object<string, import("eslint").Rule.RuleModule>}
 */
const rules = {
  // Core rules (v0.1.0 - v0.9.0)
  "enforce-todo-format": enforceTodoFormat,
  "enforce-fixme-format": enforceFixmeFormat,
  "enforce-note-format": enforceNoteFormat,
  "no-commented-code": noCommentedCode,
  "enforce-comment-length": enforceCommentLength,
  "enforce-capitalization": enforceCapitalization,
  "comment-spacing": commentSpacing,
  "no-obvious-comments": noObviousComments,
  "ban-specific-words": banSpecificWords,
  "require-explanation-comments": requireExplanationComments,
  "require-jsdoc": requireJsdoc,
  "valid-jsdoc": validJsdoc,
  "jsdoc-type-syntax": jsdocTypeSyntax,
  "require-file-header": requireFileHeader,

  // Language-specific rules (v0.10.0)
  "valid-tsdoc": validTsdoc,
  "vue-template-comments": vueTemplateComments,
  "svelte-template-comments": svelteTemplateComments,

  // Advanced analysis rules (v0.11.0)
  "stale-comment-detection": staleCommentDetection,
  "todo-aging-warnings": todoAgingWarnings,
  "comment-code-ratio": commentCodeRatio,
  "issue-tracker-integration": issueTrackerIntegration,
};

// ---------------------------------------------------------------------------
// Processors Object
// ---------------------------------------------------------------------------

/**
 * File processors for non-JavaScript files.
 *
 * Processors extract JavaScript code blocks from Vue, Svelte, and Markdown
 * files, allowing lint-my-lines rules to run on embedded code.
 *
 * @type {Object<string, import("eslint").Processor>}
 */
const processors = {
  ".vue": vueProcessor,
  ".svelte": svelteProcessor,
  ".md": markdownProcessor,
};

// ---------------------------------------------------------------------------
// Plugin Object (for flat config)
// ---------------------------------------------------------------------------

/**
 * Plugin object used in flat config presets.
 *
 * This object contains only the rules and is referenced by all flat configs.
 * Using a single plugin object ensures rule instances are shared.
 *
 * @type {Object}
 */
const plugin = {
  rules,
  processors,
};

// ---------------------------------------------------------------------------
// Legacy Configs (ESLint v8 .eslintrc format)
// ---------------------------------------------------------------------------

/**
 * Legacy configuration presets for ESLint v8 .eslintrc format.
 *
 * These are used with the `extends` array:
 * ```js
 * module.exports = {
 *   extends: ["plugin:lint-my-lines/recommended"]
 * };
 * ```
 *
 * @type {Object<string, Object>}
 */
const legacyConfigs = {
  /**
   * Minimal preset - Essential comment hygiene.
   * 4 rules: TODO/FIXME/NOTE format + no-commented-code
   */
  minimal: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
    },
  },

  /**
   * Recommended preset - Balanced defaults for most projects.
   * 8 rules: minimal + formatting + content quality
   */
  recommended: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "warn",
      "lint-my-lines/comment-spacing": "warn",
      "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
    },
  },

  /**
   * Strict preset - Maximum enforcement for quality codebases.
   * 14 rules: recommended as errors + JSDoc + file headers
   */
  strict: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/enforce-todo-format": "error",
      "lint-my-lines/enforce-fixme-format": "error",
      "lint-my-lines/enforce-note-format": "error",
      "lint-my-lines/no-commented-code": "error",
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "error",
      "lint-my-lines/comment-spacing": "error",
      "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],
      "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],
      "lint-my-lines/require-explanation-comments": ["warn", {
        requireFor: ["regex", "bitwise"],
      }],
      "lint-my-lines/require-jsdoc": "warn",
      "lint-my-lines/valid-jsdoc": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
      "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }],
    },
  },

  /**
   * Analysis preset - Advanced analysis rules.
   * 3 rules: stale detection, TODO aging, comment ratios
   */
  analysis: {
    plugins: ["lint-my-lines"],
    rules: {
      "lint-my-lines/stale-comment-detection": "warn",
      "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 30 }],
      "lint-my-lines/comment-code-ratio": ["warn", { minRatio: 0.05, maxRatio: 0.40 }],
    },
  },
};

// ---------------------------------------------------------------------------
// Flat Configs (ESLint v9 / v8.54+ flat config format)
// ---------------------------------------------------------------------------

/**
 * Get flat configuration presets.
 *
 * Uses the flat-config-factory for optimized, cached config creation.
 * The factory ensures configs are created once and frozen for reuse.
 *
 * @type {Object<string, Object>}
 */
const flatConfigs = getFlatConfigs(plugin);

// ---------------------------------------------------------------------------
// Plugin Meta
// ---------------------------------------------------------------------------

/**
 * Plugin metadata for ESLint v9 config inspector.
 *
 * @type {Object}
 * @property {string} name - Plugin name
 * @property {string} version - Plugin version (semver)
 */
const meta = {
  name: pkg.name,
  version: pkg.version,
};

// ---------------------------------------------------------------------------
// Cache Clearing
// ---------------------------------------------------------------------------

/**
 * Clear all internal caches.
 *
 * Call this function between test runs or when configuration changes
 * to ensure a clean state. Clears:
 * - Performance caches (rule results, AST caches)
 * - Config factory cache (flat config instances)
 * - Lint cache (ESLint cache files)
 *
 * @returns {void}
 *
 * @example
 * // In a test file
 * const { clearCaches } = require("eslint-plugin-lint-my-lines");
 *
 * afterEach(() => {
 *   clearCaches();
 * });
 */
function clearCaches() {
  // Clear performance caches from rules
  clearAllCaches();

  // Clear config factory cache (v1.0.3)
  _clearConfigCache();

  // Clear lint cache (v1.0.3)
  clearLintCache();
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

/**
 * The complete plugin export.
 *
 * @type {Object}
 * @property {Object} meta - Plugin metadata (name, version)
 * @property {Object} rules - All available rules
 * @property {Object} processors - File processors
 * @property {Object} configs - All configuration presets
 * @property {Function} clearCaches - Clear all internal caches
 */
module.exports = {
  // Plugin metadata (v1.0.3 - for ESLint v9 config inspector)
  meta,

  // Rules
  rules,

  // Processors
  processors,

  // Configs (merged legacy + flat)
  configs: {
    // Legacy configs (ESLint v8 .eslintrc format)
    ...legacyConfigs,

    // Flat configs (ESLint v9 / v8.54+ eslint.config.js format)
    ...flatConfigs,
  },

  // Utility functions
  clearCaches,
};
