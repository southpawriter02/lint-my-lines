/**
 * @fileoverview ESLint version compatibility utilities
 * @author lint-my-lines
 *
 * This module provides utilities for detecting and adapting to different
 * ESLint versions (v8.x vs v9.x). It enables the plugin to work seamlessly
 * across both major versions.
 *
 * ## Overview
 *
 * ESLint v9 introduced breaking changes to the configuration system:
 * - Flat config is the default (no more .eslintrc.* files)
 * - The ESLint class works differently between versions
 * - New caching strategies are available
 *
 * This module abstracts these differences so the plugin can support both
 * ESLint v8 and v9 without conditional logic scattered throughout the codebase.
 *
 * ## Usage
 *
 * @example
 * const { isESLintV9, getESLintVersion, createESLintInstance } = require('./eslint-compat');
 *
 * // Check which version is installed
 * if (isESLintV9()) {
 *   console.log('Using ESLint v9 flat config');
 * } else {
 *   console.log('Using ESLint v8 with useEslintrc: false');
 * }
 *
 * // Create an ESLint instance that works with either version
 * const eslint = createESLintInstance({
 *   fix: true,
 *   plugins: { "lint-my-lines": plugin }
 * });
 *
 * @module eslint-compat
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

const eslint = require("eslint");

// ---------------------------------------------------------------------------
// Private Variables
// ---------------------------------------------------------------------------

/**
 * Cached ESLint version string to avoid repeated parsing.
 * This is set on first call to getESLintVersion() and reused thereafter.
 *
 * @type {string|null}
 * @private
 */
let _cachedVersion = null;

/**
 * Cached major version number for quick comparisons.
 * Derived from _cachedVersion on first access.
 *
 * @type {number|null}
 * @private
 */
let _cachedMajor = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Debug log helper - only logs when DEBUG_LINT_MY_LINES is set.
 * This is a local helper to avoid circular dependencies with debug.js.
 *
 * @param {string} message - The message to log
 * @private
 */
function debugLog(message) {
  if (process.env.DEBUG_LINT_MY_LINES) {
    console.debug(`[lint-my-lines:eslint-compat] ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Public Functions
// ---------------------------------------------------------------------------

/**
 * Get the installed ESLint version string.
 *
 * This function detects the ESLint version at runtime by checking:
 * 1. First, the Linter.version property (available since ESLint v7.0.0)
 * 2. Falls back to reading the ESLint package.json if needed
 *
 * The version is cached after first detection to avoid repeated lookups.
 *
 * @returns {string} The ESLint version (e.g., "8.57.0" or "9.0.0")
 *
 * @example
 * const version = getESLintVersion();
 * console.log(`ESLint version: ${version}`); // => "9.0.0"
 *
 * @example
 * // Use with version comparison
 * const version = getESLintVersion();
 * const [major, minor] = version.split('.').map(Number);
 * if (major >= 9 || (major === 8 && minor >= 54)) {
 *   // Use flat config features available in v8.54+
 * }
 */
function getESLintVersion() {
  // Return cached version if available
  if (_cachedVersion !== null) {
    return _cachedVersion;
  }

  try {
    // ESLint exports Linter.version since v7.0.0
    // This is the most reliable way to get the version
    if (eslint.Linter && eslint.Linter.version) {
      _cachedVersion = eslint.Linter.version;
      debugLog(`Detected ESLint version via Linter.version: ${_cachedVersion}`);
      return _cachedVersion;
    }

    // Fallback: Read from package.json (less common path)
    // This handles edge cases where Linter.version might not be available
    const eslintPkg = require("eslint/package.json");
    _cachedVersion = eslintPkg.version;
    debugLog(`Detected ESLint version via package.json: ${_cachedVersion}`);
    return _cachedVersion;
  } catch (error) {
    // If all detection methods fail, assume v8 for safety
    // This ensures the plugin doesn't break on unusual setups
    console.warn(
      `[lint-my-lines] Could not detect ESLint version: ${error.message}. Assuming v8.0.0`
    );
    _cachedVersion = "8.0.0";
    return _cachedVersion;
  }
}

/**
 * Get the ESLint major version number.
 *
 * This is a convenience function for version comparisons.
 * The major version is cached after first calculation.
 *
 * @returns {number} The major version number (e.g., 8 or 9)
 *
 * @example
 * const major = getESLintMajorVersion();
 * if (major >= 9) {
 *   // Use v9-specific features
 * }
 *
 * @example
 * // Common pattern for version-specific behavior
 * switch (getESLintMajorVersion()) {
 *   case 9:
 *     // ESLint v9 behavior
 *     break;
 *   case 8:
 *   default:
 *     // ESLint v8 behavior
 *     break;
 * }
 */
function getESLintMajorVersion() {
  // Return cached major version if available
  if (_cachedMajor !== null) {
    return _cachedMajor;
  }

  // Parse major version from full version string
  const version = getESLintVersion();
  const majorStr = version.split(".")[0];
  _cachedMajor = parseInt(majorStr, 10);

  // Validate the parsed version
  if (isNaN(_cachedMajor)) {
    console.warn(
      `[lint-my-lines] Could not parse ESLint major version from "${version}". Assuming 8.`
    );
    _cachedMajor = 8;
  }

  debugLog(`ESLint major version: ${_cachedMajor}`);
  return _cachedMajor;
}

/**
 * Check if ESLint v9 or higher is installed.
 *
 * ESLint v9 introduced significant breaking changes:
 * - Flat config is the default configuration format
 * - The ESLint class uses flat config by default (no useEslintrc option)
 * - New cacheStrategy option for improved caching
 * - Deprecated support for .eslintrc.* files
 *
 * Use this function to conditionally apply v9-specific behavior.
 *
 * @returns {boolean} True if ESLint v9 or higher is installed
 *
 * @example
 * if (isESLintV9()) {
 *   // Use flat config directly
 *   const eslint = new ESLint({
 *     overrideConfig: myFlatConfig
 *   });
 * } else {
 *   // Need to disable .eslintrc for flat config in v8
 *   const eslint = new ESLint({
 *     useEslintrc: false,
 *     overrideConfig: myConfig
 *   });
 * }
 */
function isESLintV9() {
  return getESLintMajorVersion() >= 9;
}

/**
 * Check if ESLint v8.x is installed.
 *
 * ESLint v8 requires explicit configuration for flat config support:
 * - Must set useEslintrc: false to use flat config
 * - Plugins must be specified in overrideConfig.plugins as strings
 * - Different caching behavior than v9
 *
 * @returns {boolean} True if ESLint v8.x is installed
 *
 * @example
 * if (isESLintV8()) {
 *   console.log('Using ESLint v8 - legacy .eslintrc support available');
 * }
 */
function isESLintV8() {
  return getESLintMajorVersion() === 8;
}

/**
 * Get the appropriate ESLint class for the installed version.
 *
 * In ESLint v9, the main ESLint class IS the FlatESLint class.
 * In ESLint v8, the ESLint class can be used with useEslintrc: false
 * for flat config support (added in v8.21.0).
 *
 * This function always returns the ESLint class, but documents the
 * behavioral differences between versions.
 *
 * @returns {typeof import("eslint").ESLint} The ESLint constructor
 *
 * @example
 * const ESLintClass = getESLintClass();
 * const eslint = new ESLintClass({ fix: true });
 */
function getESLintClass() {
  // Both v8 and v9 export the ESLint class
  // The difference is in how it handles configuration
  return eslint.ESLint;
}

/**
 * Create an ESLint instance with version-appropriate options.
 *
 * This factory function creates an ESLint instance that works correctly
 * regardless of whether ESLint v8 or v9 is installed. It automatically
 * applies the correct options for each version:
 *
 * **ESLint v9:**
 * - Flat config is used by default
 * - No useEslintrc option needed
 * - Cache strategy can be specified
 * - Cache is enabled by default
 *
 * **ESLint v8:**
 * - Must set useEslintrc: false for flat config
 * - Plugins array format in overrideConfig
 * - Cache is disabled by default (less reliable with plugins)
 *
 * @param {Object} options - ESLint configuration options
 * @param {boolean} [options.fix=false] - Enable autofix
 * @param {Object} [options.overrideConfig] - Configuration overrides
 * @param {Object} [options.plugins] - Plugin instances (object format)
 * @param {boolean} [options.cache] - Enable caching (default: true for v9, false for v8)
 * @param {string} [options.cacheLocation] - Custom cache file location
 * @param {string} [options.cacheStrategy="metadata"] - Cache strategy (v9 only: "metadata" or "content")
 * @returns {import("eslint").ESLint} Configured ESLint instance
 *
 * @example
 * // Basic usage
 * const eslint = createESLintInstance({
 *   fix: true,
 *   plugins: { "lint-my-lines": plugin }
 * });
 *
 * @example
 * // With rule overrides
 * const eslint = createESLintInstance({
 *   fix: true,
 *   plugins: { "lint-my-lines": plugin },
 *   overrideConfig: {
 *     rules: {
 *       "lint-my-lines/enforce-todo-format": "error"
 *     }
 *   }
 * });
 *
 * @example
 * // With caching enabled
 * const eslint = createESLintInstance({
 *   plugins: { "lint-my-lines": plugin },
 *   cache: true,
 *   cacheLocation: "node_modules/.cache/eslint"
 * });
 */
function createESLintInstance(options = {}) {
  const ESLintClass = getESLintClass();

  if (isESLintV9()) {
    // -------------------------------------------------------------------------
    // ESLint v9 Configuration
    // -------------------------------------------------------------------------
    // In v9, flat config is the default. The ESLint class automatically uses
    // flat config, so we don't need useEslintrc: false.
    //
    // Key differences from v8:
    // - No useEslintrc option
    // - Plugins can be passed directly to the constructor
    // - Cache strategy option available
    // - Better caching support
    // -------------------------------------------------------------------------

    debugLog("Creating ESLint v9 instance with flat config");

    const v9Options = {
      // Fix option - enables autofix
      fix: options.fix || false,

      // Plugins object - directly pass plugin instances
      plugins: options.plugins,

      // Override config - rules and settings to apply
      overrideConfig: options.overrideConfig,

      // Caching - v9 has improved cache support
      // Enable by default for better performance
      cache: options.cache !== undefined ? options.cache : true,

      // Cache location - where to store the cache file
      cacheLocation: options.cacheLocation,

      // Cache strategy - v9-specific option
      // "metadata" (default): Use file metadata (faster, less accurate)
      // "content": Use file content hash (slower, more accurate)
      cacheStrategy: options.cacheStrategy || "metadata",
    };

    debugLog(`v9 options: cache=${v9Options.cache}, strategy=${v9Options.cacheStrategy}`);

    return new ESLintClass(v9Options);
  } else {
    // -------------------------------------------------------------------------
    // ESLint v8 Configuration
    // -------------------------------------------------------------------------
    // In v8, we must explicitly disable .eslintrc file loading to use
    // flat config-style configuration.
    //
    // Key differences from v9:
    // - Must set useEslintrc: false
    // - Plugins array must be in overrideConfig (for legacy format)
    // - No cacheStrategy option
    // - Cache less reliable with dynamic plugins
    // -------------------------------------------------------------------------

    debugLog("Creating ESLint v8 instance with useEslintrc: false");

    const v8Options = {
      // Critical: Disable .eslintrc file loading
      // This allows us to use flat config-style configuration
      useEslintrc: false,

      // Fix option - enables autofix
      fix: options.fix || false,

      // Plugins object - pass plugin instances
      plugins: options.plugins,

      // Override config - rules and settings to apply
      // In v8, we need to merge any existing overrideConfig
      overrideConfig: {
        // Include plugins array if present in overrideConfig
        plugins: options.overrideConfig?.plugins,
        // Spread remaining config options
        ...options.overrideConfig,
      },

      // Caching - disabled by default in v8
      // v8's cache is less reliable when plugins are loaded dynamically
      cache: options.cache !== undefined ? options.cache : false,

      // Cache location - where to store the cache file
      cacheLocation: options.cacheLocation,

      // Note: cacheStrategy is not available in v8
    };

    debugLog(`v8 options: cache=${v8Options.cache}`);

    return new ESLintClass(v8Options);
  }
}

/**
 * Clear the version cache.
 *
 * This function is primarily useful for testing, allowing tests to simulate
 * different ESLint versions within the same process. In normal usage, the
 * cache should persist for the lifetime of the process.
 *
 * @private
 *
 * @example
 * // In a test file
 * const { _clearVersionCache } = require('./eslint-compat');
 *
 * afterEach(() => {
 *   _clearVersionCache(); // Reset for next test
 * });
 */
function _clearVersionCache() {
  _cachedVersion = null;
  _cachedMajor = null;
  debugLog("Version cache cleared");
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Version detection
  getESLintVersion,
  getESLintMajorVersion,
  isESLintV9,
  isESLintV8,

  // ESLint instance helpers
  getESLintClass,
  createESLintInstance,

  // Testing utilities (private)
  _clearVersionCache,
};
