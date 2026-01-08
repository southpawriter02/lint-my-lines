/**
 * @fileoverview Debug logging utilities for lint-my-lines
 * @author lint-my-lines
 *
 * This module provides structured logging for debugging the plugin.
 * Logging is disabled by default and can be enabled via environment
 * variables. The design follows the common "debug" package pattern
 * but is self-contained to avoid external dependencies.
 *
 * ## Environment Variables
 *
 * Control debug logging with the `DEBUG_LINT_MY_LINES` environment variable:
 *
 * | Value | Effect |
 * |-------|--------|
 * | `1` or `true` or `*` | Enable all debug logging |
 * | `config` | Only config-related logs |
 * | `cache` | Only cache-related logs |
 * | `rules` | Only rule execution logs |
 * | `config,cache` | Multiple categories (comma-separated) |
 *
 * ## Log Levels
 *
 * | Level | Use Case |
 * |-------|----------|
 * | DEBUG | Detailed debugging information |
 * | INFO | General informational messages |
 * | WARN | Warning conditions |
 * | ERROR | Error conditions |
 *
 * ## Categories
 *
 * Common categories used throughout the plugin:
 *
 * | Category | Description |
 * |----------|-------------|
 * | `config` | Configuration loading and processing |
 * | `cache` | Caching operations |
 * | `rules` | Rule execution and reporting |
 * | `eslint-compat` | ESLint version compatibility |
 * | `factory` | Config factory operations |
 *
 * @example
 * // Enable all debugging from the command line
 * DEBUG_LINT_MY_LINES=1 npx eslint .
 *
 * @example
 * // Enable only cache debugging
 * DEBUG_LINT_MY_LINES=cache npx eslint .
 *
 * @example
 * // In code - using the debug function directly
 * const { debug, warn, error } = require('./debug');
 * debug('config', 'Loading preset: %s', presetName);
 * warn('cache', 'Cache miss for file: %s', filePath);
 *
 * @example
 * // In code - using a category-specific logger
 * const { createLogger } = require('./debug');
 * const log = createLogger('rules');
 * log.debug('Processing comment at line %d', lineNumber);
 * log.warn('Potentially invalid comment format');
 *
 * @module debug
 */
"use strict";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Log levels with numeric values for comparison.
 * Lower values are more verbose (DEBUG = 0 shows everything).
 * Higher values filter out less severe messages.
 *
 * @enum {number}
 * @readonly
 * @property {number} DEBUG - Detailed debugging (value: 0)
 * @property {number} INFO - Informational messages (value: 1)
 * @property {number} WARN - Warning conditions (value: 2)
 * @property {number} ERROR - Error conditions (value: 3)
 * @property {number} NONE - Disable all logging (value: 4)
 *
 * @example
 * const { LogLevel } = require('./debug');
 * if (LogLevel.WARN >= currentLevel) {
 *   // This message will be shown
 * }
 */
const LogLevel = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
});

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

/**
 * Current minimum log level.
 * Messages below this level are suppressed.
 * Initialized based on DEBUG_LINT_MY_LINES environment variable.
 *
 * @type {number}
 * @private
 */
let currentLevel = LogLevel.WARN;

/**
 * Set of enabled log categories.
 * If "*" is in the set, all categories are enabled.
 * Otherwise, only categories in this set produce output.
 *
 * @type {Set<string>}
 * @private
 */
const enabledCategories = new Set();


// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initialize logging configuration from environment variables.
 *
 * Reads DEBUG_LINT_MY_LINES and configures:
 * - Log level (DEBUG if set, WARN if not)
 * - Enabled categories (all if "1", specific if comma-separated)
 *
 * This function is called automatically on module load but can be
 * called again to re-initialize (e.g., in tests).
 *
 * @private
 */
function initLogging() {
  // Read environment variable
  const debugEnv = process.env.DEBUG_LINT_MY_LINES;

  // Clear previous state
  enabledCategories.clear();

  // If DEBUG_LINT_MY_LINES is not set, use default (WARN level, no categories)
  if (!debugEnv) {
    currentLevel = LogLevel.WARN;
    return;
  }

  // DEBUG_LINT_MY_LINES is set - enable debug level
  currentLevel = LogLevel.DEBUG;

  // Parse the value to determine which categories to enable
  const normalizedValue = debugEnv.trim().toLowerCase();

  if (normalizedValue === "1" || normalizedValue === "true" || normalizedValue === "*") {
    // Enable all categories
    enabledCategories.add("*");
  } else {
    // Enable specific categories (comma-separated)
    // Example: "config,cache" enables only those two
    normalizedValue.split(",").forEach((category) => {
      const trimmed = category.trim();
      if (trimmed) {
        enabledCategories.add(trimmed);
      }
    });
  }
}

// Initialize on module load
initLogging();

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Check if a specific category is enabled for logging.
 *
 * A category is considered enabled if:
 * - The wildcard "*" is in enabledCategories (all categories enabled)
 * - The specific category is in enabledCategories
 *
 * @param {string} category - The category to check
 * @returns {boolean} True if the category is enabled
 *
 * @example
 * // With DEBUG_LINT_MY_LINES=config
 * isEnabled('config') // => true
 * isEnabled('cache')  // => false
 *
 * @example
 * // With DEBUG_LINT_MY_LINES=1
 * isEnabled('anything') // => true (wildcard enabled)
 */
function isEnabled(category) {
  // Wildcard enables all categories
  if (enabledCategories.has("*")) {
    return true;
  }

  // Check for specific category (case-insensitive)
  return enabledCategories.has(category.toLowerCase());
}

/**
 * Format a log message with timestamp, category, and level.
 *
 * The format is designed to be easily parseable and grep-friendly:
 * `[timestamp] [lint-my-lines:category] [LEVEL] message`
 *
 * Supports printf-style placeholders:
 * - %s - String
 * - %d - Number
 * - %j - JSON
 * - %o - Object (same as %j)
 *
 * @param {string} level - Log level string (DEBUG, INFO, WARN, ERROR)
 * @param {string} category - Log category (e.g., 'config', 'cache')
 * @param {string} message - Message with optional printf-style placeholders
 * @param {any[]} args - Arguments to substitute into placeholders
 * @returns {string} Formatted log message
 *
 * @private
 *
 * @example
 * formatMessage('DEBUG', 'config', 'Loading preset: %s', ['recommended'])
 * // => "[2024-01-15T10:30:00.000Z] [lint-my-lines:config] [DEBUG] Loading preset: recommended"
 */
function formatMessage(level, category, message, args) {
  // ISO timestamp for consistent, sortable log entries
  const timestamp = new Date().toISOString();

  // Build the prefix with all metadata
  const prefix = `[${timestamp}] [lint-my-lines:${category}] [${level}]`;

  // Apply printf-style formatting
  let formatted = message;
  let argIndex = 0;

  // Replace placeholders with corresponding arguments
  formatted = formatted.replace(/%([sdjo])/g, (match, specifier) => {
    // If we've run out of arguments, leave the placeholder
    if (argIndex >= args.length) {
      return match;
    }

    const arg = args[argIndex++];

    switch (specifier) {
      case "s":
        // String - convert to string
        return String(arg);

      case "d":
        // Number - parse as number
        return Number(arg).toString();

      case "j":
      case "o":
        // JSON/Object - stringify with error handling
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return "[Circular]";
        }

      default:
        return match;
    }
  });

  return `${prefix} ${formatted}`;
}

// ---------------------------------------------------------------------------
// Logging Functions
// ---------------------------------------------------------------------------

/**
 * Log a debug message.
 *
 * Debug messages are the most verbose level and are only shown when
 * DEBUG_LINT_MY_LINES is set. Use for detailed debugging information
 * that helps trace execution flow.
 *
 * @param {string} category - Log category (e.g., 'config', 'cache', 'rules')
 * @param {string} message - Message with optional printf-style placeholders (%s, %d, %j, %o)
 * @param {...any} args - Arguments to substitute into placeholders
 * @returns {void}
 *
 * @example
 * debug('config', 'Loading preset: %s', presetName);
 * // Output: [2024-01-15T10:30:00.000Z] [lint-my-lines:config] [DEBUG] Loading preset: recommended
 *
 * @example
 * debug('rules', 'Processing %d comments in file %s', count, filename);
 *
 * @example
 * debug('cache', 'Cache entry: %j', { hit: true, age: 1000 });
 */
function debug(category, message, ...args) {
  // Check if debug level is enabled
  if (currentLevel > LogLevel.DEBUG) {
    return;
  }

  // Check if this category is enabled
  if (!isEnabled(category)) {
    return;
  }

  // Format and output the message
  console.debug(formatMessage("DEBUG", category, message, args));
}

/**
 * Log an info message.
 *
 * Info messages provide general operational information.
 * Use for significant events that are useful but not alarming.
 *
 * @param {string} category - Log category
 * @param {string} message - Message with optional printf-style placeholders
 * @param {...any} args - Arguments to substitute into placeholders
 * @returns {void}
 *
 * @example
 * info('config', 'Initialized %d flat config presets', presetCount);
 */
function info(category, message, ...args) {
  // Check if info level is enabled
  if (currentLevel > LogLevel.INFO) {
    return;
  }

  // Format and output the message
  console.info(formatMessage("INFO", category, message, args));
}

/**
 * Log a warning message.
 *
 * Warning messages indicate potential problems that don't prevent
 * operation but should be addressed. These are shown by default
 * when DEBUG_LINT_MY_LINES is not set.
 *
 * @param {string} category - Log category
 * @param {string} message - Message with optional printf-style placeholders
 * @param {...any} args - Arguments to substitute into placeholders
 * @returns {void}
 *
 * @example
 * warn('cache', 'Cache miss for file: %s', filePath);
 *
 * @example
 * warn('config', 'Unknown preset "%s", using "recommended"', presetName);
 */
function warn(category, message, ...args) {
  // Check if warn level is enabled
  if (currentLevel > LogLevel.WARN) {
    return;
  }

  // Format and output the message
  console.warn(formatMessage("WARN", category, message, args));
}

/**
 * Log an error message.
 *
 * Error messages indicate failures that may affect operation.
 * These are always shown unless logging is completely disabled.
 *
 * @param {string} category - Log category
 * @param {string} message - Message with optional printf-style placeholders
 * @param {...any} args - Arguments to substitute into placeholders
 * @returns {void}
 *
 * @example
 * error('rules', 'Failed to parse comment: %s', parseError.message);
 *
 * @example
 * error('config', 'Invalid rule configuration for %s: %j', ruleName, config);
 */
function error(category, message, ...args) {
  // Check if error level is enabled
  if (currentLevel > LogLevel.ERROR) {
    return;
  }

  // Format and output the message
  console.error(formatMessage("ERROR", category, message, args));
}

// ---------------------------------------------------------------------------
// Logger Factory
// ---------------------------------------------------------------------------

/**
 * Create a logger bound to a specific category.
 *
 * This is a convenience function that returns an object with debug, info,
 * warn, and error methods pre-bound to the specified category. This is
 * useful when you have many log statements in the same file/module that
 * all share the same category.
 *
 * @param {string} category - The log category for this logger
 * @returns {Object} Logger object with debug, info, warn, error methods
 * @returns {Function} returns.debug - Debug log function
 * @returns {Function} returns.info - Info log function
 * @returns {Function} returns.warn - Warning log function
 * @returns {Function} returns.error - Error log function
 *
 * @example
 * // At the top of a module
 * const log = createLogger('rules');
 *
 * // Throughout the module
 * log.debug('Processing comment: %s', commentText);
 * log.info('Found %d issues', issues.length);
 * log.warn('Skipping invalid comment');
 * log.error('Unexpected parse error: %s', err.message);
 *
 * @example
 * // In a function
 * function processConfig(config) {
 *   const log = createLogger('config');
 *
 *   log.debug('Received config: %j', config);
 *
 *   if (!config.rules) {
 *     log.warn('No rules defined in config');
 *   }
 *
 *   log.debug('Config processing complete');
 * }
 */
function createLogger(category) {
  return {
    /**
     * Log a debug message for this category
     * @param {string} msg - Message with optional printf-style placeholders
     * @param {...any} args - Arguments for placeholders
     */
    debug: (msg, ...args) => debug(category, msg, ...args),

    /**
     * Log an info message for this category
     * @param {string} msg - Message with optional printf-style placeholders
     * @param {...any} args - Arguments for placeholders
     */
    info: (msg, ...args) => info(category, msg, ...args),

    /**
     * Log a warning message for this category
     * @param {string} msg - Message with optional printf-style placeholders
     * @param {...any} args - Arguments for placeholders
     */
    warn: (msg, ...args) => warn(category, msg, ...args),

    /**
     * Log an error message for this category
     * @param {string} msg - Message with optional printf-style placeholders
     * @param {...any} args - Arguments for placeholders
     */
    error: (msg, ...args) => error(category, msg, ...args),
  };
}

// ---------------------------------------------------------------------------
// Testing Utilities
// ---------------------------------------------------------------------------

/**
 * Re-initialize logging from environment.
 *
 * This is primarily useful for testing, allowing tests to modify
 * DEBUG_LINT_MY_LINES and reinitialize the logging configuration.
 *
 * @private
 *
 * @example
 * // In a test file
 * beforeEach(() => {
 *   process.env.DEBUG_LINT_MY_LINES = 'config';
 *   _reinitialize();
 * });
 *
 * afterEach(() => {
 *   delete process.env.DEBUG_LINT_MY_LINES;
 *   _reinitialize();
 * });
 */
function _reinitialize() {
  initLogging();
}

/**
 * Get current logging configuration for testing.
 *
 * @private
 * @returns {Object} Current logging state
 * @returns {number} returns.level - Current log level
 * @returns {string[]} returns.categories - Enabled categories
 */
function _getConfig() {
  return {
    level: currentLevel,
    categories: Array.from(enabledCategories),
  };
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  LogLevel,

  // Logging functions
  debug,
  info,
  warn,
  error,

  // Logger factory
  createLogger,

  // Utility functions
  isEnabled,

  // Testing utilities (private)
  _reinitialize,
  _getConfig,
};
