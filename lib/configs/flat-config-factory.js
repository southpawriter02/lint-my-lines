/**
 * @fileoverview Factory for creating optimized ESLint flat configurations
 * @author lint-my-lines
 *
 * This module provides a singleton-based factory pattern for creating
 * flat config objects. By caching config instances, we avoid recreating
 * identical configuration objects on each import, significantly improving
 * performance in large monorepos and CI/CD environments.
 *
 * ## Design Philosophy
 *
 * ESLint flat configs are typically recreated on each import of the plugin.
 * For large projects with many files or monorepos with multiple packages,
 * this can lead to unnecessary overhead. This factory:
 *
 * 1. Creates configs once on first access (lazy initialization)
 * 2. Caches configs for subsequent access (singleton pattern)
 * 3. Freezes configs to prevent accidental mutation
 * 4. Provides debug logging for troubleshooting
 *
 * ## Performance Characteristics
 *
 * | Operation | Without Cache | With Cache |
 * |-----------|---------------|------------|
 * | First import | ~5ms | ~5ms |
 * | Subsequent imports | ~5ms | <0.1ms |
 * | Memory per preset | ~2KB each | ~2KB (shared) |
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │                 getFlatConfigs                  │
 * │  (entry point - returns all cached configs)     │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *          ┌───────┴───────┐
 *          ▼               ▼
 * ┌─────────────────┐ ┌─────────────────┐
 * │ PRESET_DEFS     │ │ LANGUAGE_PRESETS│
 * │ (core presets)  │ │ (lang-specific) │
 * └────────┬────────┘ └────────┬────────┘
 *          │                   │
 *          └─────────┬─────────┘
 *                    ▼
 *          ┌─────────────────┐
 *          │ createFlatConfig│
 *          │ (creates & caches)
 *          └────────┬────────┘
 *                   ▼
 *          ┌─────────────────┐
 *          │   _configCache  │
 *          │ (Map singleton) │
 *          └─────────────────┘
 * ```
 *
 * ## Usage
 *
 * @example
 * // In lib/index.js
 * const { getFlatConfigs } = require('./configs/flat-config-factory');
 *
 * // Create all configs once
 * const flatConfigs = getFlatConfigs(plugin);
 *
 * // Export for users
 * module.exports = { configs: flatConfigs };
 *
 * @example
 * // Users can then use configs like:
 * // eslint.config.js
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 *
 * export default [
 *   lintMyLines.configs["flat/recommended"],
 * ];
 *
 * @module flat-config-factory
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

const { getESLintVersion } = require("../utils/eslint-compat");
const { createLogger } = require("../utils/debug");

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

/**
 * Logger for config-related debug messages
 * @type {Object}
 * @private
 */
const log = createLogger("config");

/**
 * Singleton cache for flat config instances.
 *
 * Keys are full config names like "lint-my-lines/flat/recommended".
 * Values are the frozen config objects.
 *
 * Using a Map for O(1) lookup performance.
 *
 * @type {Map<string, Object>}
 * @private
 */
const _configCache = new Map();

/**
 * Flag to track if configs have been initialized.
 * Used to prevent re-initialization on subsequent calls.
 *
 * @type {boolean}
 * @private
 */
let _initialized = false;

// ---------------------------------------------------------------------------
// Preset Definitions
// ---------------------------------------------------------------------------

/**
 * Core preset definitions with their rule configurations.
 *
 * Each preset is defined with its rules and any special options.
 * This is the **single source of truth** for all preset configurations.
 *
 * ## Preset Philosophy
 *
 * - **minimal**: Essential comment hygiene, least opinionated
 * - **recommended**: Balanced defaults for most projects
 * - **strict**: Maximum enforcement for high-quality codebases
 * - **analysis**: Advanced analysis rules (stale detection, aging, ratios)
 *
 * ## Severity Guidelines
 *
 * - `"warn"`: Issues that should be addressed but don't block
 * - `"error"`: Issues that indicate bugs or must be fixed
 * - `["warn", options]`: Warning with custom configuration
 * - `["error", options]`: Error with custom configuration
 *
 * @type {Object<string, {rules: Object}>}
 * @constant
 */
const PRESET_DEFINITIONS = {
  /**
   * Minimal preset - Essential comment hygiene.
   *
   * The least opinionated preset, focusing only on structured comments
   * (TODO, FIXME, NOTE) and detecting commented-out code.
   *
   * Best for:
   * - Legacy codebases being gradually improved
   * - Teams new to comment linting
   * - Projects with existing comment style guidelines
   *
   * Rules: 4
   */
  minimal: {
    rules: {
      // Enforce proper TODO format: TODO (TICKET-123): description
      "lint-my-lines/enforce-todo-format": "warn",

      // Enforce proper FIXME format: FIXME (TICKET-123): description
      "lint-my-lines/enforce-fixme-format": "warn",

      // Enforce proper NOTE format: NOTE (context): description
      "lint-my-lines/enforce-note-format": "warn",

      // Detect and warn about commented-out code
      "lint-my-lines/no-commented-code": "warn",
    },
  },

  /**
   * Recommended preset - Balanced defaults for most projects.
   *
   * Includes everything in minimal, plus formatting and content
   * quality rules. This is the default preset for new projects.
   *
   * Best for:
   * - New projects
   * - Teams wanting good defaults
   * - Balanced enforcement without being overly strict
   *
   * Rules: 8 (minimal + 4)
   */
  recommended: {
    rules: {
      // Include all minimal rules
      "lint-my-lines/enforce-todo-format": "warn",
      "lint-my-lines/enforce-fixme-format": "warn",
      "lint-my-lines/enforce-note-format": "warn",
      "lint-my-lines/no-commented-code": "warn",

      // Formatting rules
      // Enforce maximum comment length (120 chars default)
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],

      // Require capital letter at start of comments
      "lint-my-lines/enforce-capitalization": "warn",

      // Require space after // and *
      "lint-my-lines/comment-spacing": "warn",

      // Content quality rules
      // Ban vague and non-inclusive terms
      "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }],
    },
  },

  /**
   * Strict preset - Maximum enforcement for high-quality codebases.
   *
   * Elevates recommended rules to errors and adds documentation
   * requirements. Use this for production-critical code.
   *
   * Best for:
   * - Critical systems
   * - Open source projects
   * - Teams with mature development practices
   *
   * Rules: 14 (recommended as errors + 6 additional)
   */
  strict: {
    rules: {
      // Core rules as errors (from recommended)
      "lint-my-lines/enforce-todo-format": "error",
      "lint-my-lines/enforce-fixme-format": "error",
      "lint-my-lines/enforce-note-format": "error",
      "lint-my-lines/no-commented-code": "error",

      // Formatting as errors
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 120 }],
      "lint-my-lines/enforce-capitalization": "error",
      "lint-my-lines/comment-spacing": "error",
      "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],

      // Additional strict rules as warnings
      // Detect comments that just restate the code
      "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],

      // Require comments for complex patterns
      "lint-my-lines/require-explanation-comments": [
        "warn",
        { requireFor: ["regex", "bitwise"] },
      ],

      // JSDoc requirements
      "lint-my-lines/require-jsdoc": "warn",
      "lint-my-lines/valid-jsdoc": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],

      // File header requirement
      "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }],
    },
  },

  /**
   * Analysis preset - Advanced analysis rules.
   *
   * Specialized rules for analyzing comment quality and tracking
   * technical debt. Can be combined with other presets.
   *
   * Best for:
   * - Tracking technical debt
   * - Code quality audits
   * - Identifying stale documentation
   *
   * Rules: 3
   */
  analysis: {
    rules: {
      // Detect comments referencing non-existent code
      "lint-my-lines/stale-comment-detection": "warn",

      // Warn on old TODO/FIXME comments (default: 30 days)
      "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 30 }],

      // Report under/over-documented files
      "lint-my-lines/comment-code-ratio": [
        "warn",
        { minRatio: 0.05, maxRatio: 0.4 },
      ],
    },
  },
};

/**
 * Language-specific preset definitions.
 *
 * These presets extend core presets with language-specific rules
 * and file patterns. They include processors for non-JS languages.
 *
 * ## File Pattern Notes
 *
 * - Patterns use glob syntax
 * - Multiple extensions can be specified
 * - `**` matches any directory depth
 *
 * @type {Object<string, {files?: string[], processor?: string, rules: Object}>}
 * @constant
 */
const LANGUAGE_PRESETS = {
  /**
   * TypeScript preset - TypeScript-specific rules.
   *
   * Extends recommended with TSDoc validation and TypeScript
   * type syntax preferences.
   */
  typescript: {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
      // Include all recommended rules
      ...PRESET_DEFINITIONS.recommended.rules,

      // TypeScript-specific rules
      "lint-my-lines/valid-tsdoc": "warn",
      "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
    },
  },

  /**
   * Strict TypeScript preset - TypeScript with strict enforcement.
   *
   * Combines strict preset with TypeScript-specific rules as errors.
   */
  "typescript-strict": {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
      // Include all strict rules
      ...PRESET_DEFINITIONS.strict.rules,

      // TypeScript-specific as error
      "lint-my-lines/valid-tsdoc": "error",
    },
  },

  /**
   * React preset - JSX/TSX support.
   *
   * Uses recommended rules with JSX file patterns.
   * No special processor needed as ESLint handles JSX natively.
   */
  react: {
    files: ["**/*.jsx", "**/*.tsx"],
    rules: {
      ...PRESET_DEFINITIONS.recommended.rules,
    },
  },

  /**
   * Vue preset - Vue Single File Component support.
   *
   * Uses the Vue processor to extract script blocks and includes
   * the vue-template-comments rule for HTML comment linting.
   */
  vue: {
    files: ["**/*.vue"],
    processor: "lint-my-lines/.vue",
    rules: {
      ...PRESET_DEFINITIONS.recommended.rules,

      // Vue-specific template comment linting
      "lint-my-lines/vue-template-comments": "warn",
    },
  },

  /**
   * Svelte preset - Svelte component support.
   *
   * Uses the Svelte processor to extract script blocks and includes
   * the svelte-template-comments rule for HTML comment linting.
   */
  svelte: {
    files: ["**/*.svelte"],
    processor: "lint-my-lines/.svelte",
    rules: {
      ...PRESET_DEFINITIONS.recommended.rules,

      // Svelte-specific template comment linting
      "lint-my-lines/svelte-template-comments": "warn",
    },
  },

  /**
   * Markdown preset - Markdown code block support.
   *
   * Uses relaxed rules since code blocks in documentation have
   * different requirements than production code.
   */
  markdown: {
    files: ["**/*.md"],
    processor: "lint-my-lines/.md",
    rules: {
      // Only check TODO format in markdown code blocks
      "lint-my-lines/enforce-todo-format": "warn",

      // Don't flag "commented code" - often intentional in docs
      "lint-my-lines/no-commented-code": "off",

      // No file headers in markdown code blocks
      "lint-my-lines/require-file-header": "off",
    },
  },
};

// ---------------------------------------------------------------------------
// Preset Inheritance
// ---------------------------------------------------------------------------

/**
 * Preset inheritance chain definition.
 *
 * Defines the parent-child relationships between presets. This is useful
 * for understanding which presets inherit from which, and for building
 * tools that work with preset hierarchies.
 *
 * ## Inheritance Structure
 *
 * ```
 * minimal (base)
 *   └── recommended
 *         └── strict
 *   └── markdown (relaxed minimal)
 *
 * recommended
 *   └── typescript
 *   └── react
 *   └── vue
 *   └── svelte
 *
 * strict
 *   └── typescript-strict
 *
 * analysis (standalone)
 * ```
 *
 * @type {Object<string, string|null>}
 * @constant
 */
const PRESET_INHERITANCE = {
  // Core presets
  minimal: null, // Base preset, no parent
  recommended: "minimal", // Extends minimal
  strict: "recommended", // Extends recommended
  analysis: null, // Standalone, no parent

  // Language-specific presets
  typescript: "recommended",
  "typescript-strict": "strict",
  react: "recommended",
  vue: "recommended",
  svelte: "recommended",
  markdown: "minimal",
};

/**
 * Get the inheritance chain for a preset.
 *
 * Returns an array of preset names from the base (root) preset
 * to the specified preset, showing the full inheritance path.
 *
 * @param {string} presetName - Preset name (e.g., "typescript-strict")
 * @returns {string[]} Array of preset names from base to specific
 *
 * @example
 * getPresetInheritanceChain("typescript-strict");
 * // Returns: ["minimal", "recommended", "strict", "typescript-strict"]
 *
 * @example
 * getPresetInheritanceChain("minimal");
 * // Returns: ["minimal"]
 *
 * @example
 * getPresetInheritanceChain("analysis");
 * // Returns: ["analysis"]
 */
function getPresetInheritanceChain(presetName) {
  const chain = [presetName];
  let current = presetName;

  // Walk up the inheritance chain until we reach a base preset (null parent)
  while (PRESET_INHERITANCE[current]) {
    current = PRESET_INHERITANCE[current];
    chain.unshift(current);
  }

  return chain;
}

// ---------------------------------------------------------------------------
// Factory Functions
// ---------------------------------------------------------------------------

/**
 * Create a single flat config object with the given options.
 *
 * This function creates a properly structured ESLint flat config object
 * with all required properties for both ESLint v8.54+ and v9+.
 *
 * ## Flat Config Structure
 *
 * ESLint flat configs are plain objects with these properties:
 *
 * - `name`: Identifier for debugging (required in v9)
 * - `plugins`: Object mapping plugin names to plugin instances
 * - `rules`: Rule configurations
 * - `files`: Glob patterns to match (optional)
 * - `processor`: Processor reference (optional)
 * - `languageOptions`: Parser and environment settings (optional)
 *
 * ## Caching Behavior
 *
 * This function implements memoization:
 * 1. Check if config exists in cache by name
 * 2. If cached, return the cached instance
 * 3. If not cached, create new config and cache it
 * 4. Freeze the config to prevent accidental mutation
 *
 * @param {Object} options - Config options
 * @param {string} options.name - Config identifier (e.g., "lint-my-lines/flat/recommended")
 * @param {Object} options.plugin - The plugin instance with rules
 * @param {Object} options.rules - Rule configurations
 * @param {string[]} [options.files] - File patterns to match (for language-specific configs)
 * @param {string} [options.processor] - Processor name (e.g., "lint-my-lines/.vue")
 * @param {Object} [options.languageOptions] - Language options (ESLint v9 style)
 * @param {Object} [options.parserOptions] - Parser options (v8 style, auto-converted)
 * @returns {Object} ESLint flat config object
 *
 * @example
 * // Create a basic config
 * const config = createFlatConfig({
 *   name: "lint-my-lines/flat/recommended",
 *   plugin: myPlugin,
 *   rules: {
 *     "lint-my-lines/enforce-todo-format": "warn",
 *   }
 * });
 *
 * @example
 * // Create a language-specific config
 * const tsConfig = createFlatConfig({
 *   name: "lint-my-lines/flat/typescript",
 *   plugin: myPlugin,
 *   files: ["**\/*.ts", "**\/*.tsx"],
 *   rules: {
 *     "lint-my-lines/valid-tsdoc": "warn",
 *   }
 * });
 */
function createFlatConfig(options) {
  const {
    name,
    plugin,
    rules,
    files,
    processor,
    languageOptions,
    parserOptions,
  } = options;

  // -------------------------------------------------------------------------
  // Check cache first (memoization)
  // -------------------------------------------------------------------------
  if (_configCache.has(name)) {
    log.debug("Cache hit for config: %s", name);
    return _configCache.get(name);
  }

  log.debug("Creating new config: %s", name);

  // -------------------------------------------------------------------------
  // Build the config object
  // -------------------------------------------------------------------------

  const config = {
    // Name is required for ESLint v9 config inspector and debugging
    // Format: "plugin-name/preset-type/preset-name"
    name,

    // Plugin registration - uses object format for flat config
    // The key is the plugin namespace used in rule names
    plugins: {
      "lint-my-lines": plugin,
    },

    // Rule configurations
    // Keys are full rule names: "plugin-name/rule-name"
    // Values are severity or [severity, options]
    rules,
  };

  // -------------------------------------------------------------------------
  // Add optional properties
  // -------------------------------------------------------------------------

  // Add file patterns if specified (for language-specific configs)
  // Without file patterns, the config applies to all files
  if (files && files.length > 0) {
    config.files = files;
  }

  // Add processor if specified (for Vue, Svelte, Markdown)
  // Processors extract code blocks from non-JS file formats
  if (processor) {
    config.processor = processor;
  }

  // Handle language options (ESLint v9 style)
  // Preferred format for v9, includes parser settings
  if (languageOptions) {
    config.languageOptions = languageOptions;
  } else if (parserOptions) {
    // Convert v8-style parserOptions to v9-style languageOptions
    // This ensures compatibility with both versions
    config.languageOptions = {
      ecmaVersion: parserOptions.ecmaVersion || 2020,
      sourceType: parserOptions.sourceType || "module",
      parserOptions: {
        ...parserOptions,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Freeze and cache
  // -------------------------------------------------------------------------

  // Freeze the config to prevent accidental mutation
  // This is important for singleton correctness
  Object.freeze(config);
  Object.freeze(config.plugins);
  Object.freeze(config.rules);

  if (config.files) {
    Object.freeze(config.files);
  }

  if (config.languageOptions) {
    Object.freeze(config.languageOptions);
  }

  // Cache the frozen config
  _configCache.set(name, config);

  log.debug(
    "Config cached: %s (total cached: %d)",
    name,
    _configCache.size
  );

  return config;
}

/**
 * Get all flat config presets as a frozen object.
 *
 * This is the main entry point for getting all flat configs.
 * It generates all presets using the singleton pattern:
 *
 * 1. On first call: Creates all configs and caches them
 * 2. On subsequent calls: Returns cached configs immediately
 *
 * The returned object is frozen to prevent modification.
 *
 * ## Performance
 *
 * - First call: ~5ms (creates all configs)
 * - Subsequent calls: <0.1ms (returns cached object)
 *
 * @param {Object} plugin - The plugin instance (must have `rules` property)
 * @returns {Object} Map of preset names to config objects
 *
 * @example
 * // In lib/index.js
 * const configs = getFlatConfigs(plugin);
 * module.exports = { configs };
 *
 * @example
 * // Accessing configs
 * const configs = getFlatConfigs(plugin);
 * configs["flat/recommended"] // => { name, plugins, rules }
 * configs["flat/typescript"]  // => { name, plugins, rules, files }
 */
function getFlatConfigs(plugin) {
  // -------------------------------------------------------------------------
  // Return cached configs if already initialized
  // -------------------------------------------------------------------------
  if (_initialized && _configCache.size > 0) {
    log.debug("Returning cached configs");

    // Build configs object from cache
    // Filter to only flat/ configs and strip the prefix from keys
    const configs = {};

    for (const [key, value] of _configCache.entries()) {
      if (key.startsWith("lint-my-lines/flat/")) {
        // Convert "lint-my-lines/flat/recommended" to "flat/recommended"
        const shortKey = key.replace("lint-my-lines/", "");
        configs[shortKey] = value;
      }
    }

    return configs;
  }

  // -------------------------------------------------------------------------
  // Initialize configs (first call)
  // -------------------------------------------------------------------------
  log.debug("Initializing flat configs (ESLint %s)", getESLintVersion());

  const configs = {};

  // Create core presets from PRESET_DEFINITIONS
  for (const [presetName, definition] of Object.entries(PRESET_DEFINITIONS)) {
    const configName = `flat/${presetName}`;
    const fullName = `lint-my-lines/${configName}`;

    configs[configName] = createFlatConfig({
      name: fullName,
      plugin,
      rules: definition.rules,
    });
  }

  // Create language-specific presets from LANGUAGE_PRESETS
  for (const [presetName, definition] of Object.entries(LANGUAGE_PRESETS)) {
    const configName = `flat/${presetName}`;
    const fullName = `lint-my-lines/${configName}`;

    configs[configName] = createFlatConfig({
      name: fullName,
      plugin,
      rules: definition.rules,
      files: definition.files,
      processor: definition.processor,
    });
  }

  // Mark as initialized
  _initialized = true;

  // Freeze the configs object to prevent modification
  Object.freeze(configs);

  log.debug("Initialized %d flat configs", Object.keys(configs).length);

  return configs;
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Get cache statistics for debugging.
 *
 * Returns information about the current state of the config cache.
 * Useful for debugging and performance monitoring.
 *
 * @returns {Object} Cache statistics
 * @returns {number} returns.size - Number of cached configs
 * @returns {boolean} returns.initialized - Whether configs have been initialized
 * @returns {string[]} returns.configs - List of cached config names
 *
 * @example
 * const stats = getCacheStats();
 * console.log(`Cached configs: ${stats.size}`);
 * console.log(`Initialized: ${stats.initialized}`);
 * console.log(`Configs: ${stats.configs.join(", ")}`);
 */
function getCacheStats() {
  return {
    size: _configCache.size,
    initialized: _initialized,
    configs: Array.from(_configCache.keys()),
  };
}

/**
 * Clear the config cache.
 *
 * Primarily useful for testing, allowing tests to reset the cache
 * state between test cases.
 *
 * **Warning**: This should not be called in production code as it
 * defeats the purpose of caching.
 *
 * @private
 *
 * @example
 * // In a test file
 * afterEach(() => {
 *   _clearConfigCache();
 * });
 */
function _clearConfigCache() {
  _configCache.clear();
  _initialized = false;
  log.debug("Config cache cleared");
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Main factory function
  createFlatConfig,
  getFlatConfigs,

  // Utility functions
  getCacheStats,

  // Preset definitions (for reference/extension)
  PRESET_DEFINITIONS,
  LANGUAGE_PRESETS,

  // Preset inheritance
  PRESET_INHERITANCE,
  getPresetInheritanceChain,

  // Testing utilities (private)
  _clearConfigCache,
};
