/**
 * @fileoverview ESLint v9 cache integration utilities
 * @author lint-my-lines
 *
 * This module provides integration with ESLint's caching system to avoid
 * re-linting unchanged files. It works with both ESLint v8 and v9, but
 * provides enhanced functionality for v9.
 *
 * ## How ESLint Caching Works
 *
 * ESLint can cache lint results to avoid re-processing unchanged files.
 * The cache stores:
 * - File path and hash (content or metadata based)
 * - ESLint config hash
 * - Lint results (messages, fixed output)
 *
 * When a file is linted again:
 * 1. ESLint checks if the file hash matches the cached version
 * 2. If unchanged AND config unchanged, cached results are returned
 * 3. If changed, the file is re-linted
 *
 * ## ESLint v9 Improvements
 *
 * ESLint v9 introduced several caching improvements:
 * - Flat config hash is more stable (no extends resolution needed)
 * - Cache includes plugin version information
 * - Better invalidation when config changes
 * - New "metadata" vs "content" cache strategies
 *
 * ## Cache Strategies (ESLint v9)
 *
 * | Strategy | Speed | Accuracy | Use Case |
 * |----------|-------|----------|----------|
 * | metadata | Fast | Good | Development, most cases |
 * | content | Slower | Perfect | CI/CD, critical builds |
 *
 * The "metadata" strategy uses file modification time and size.
 * The "content" strategy hashes the file content (more accurate but slower).
 *
 * ## Usage
 *
 * @example
 * const { getCacheConfig, clearCache } = require('./cache-integration');
 *
 * // Get cache configuration for ESLint
 * const eslint = new ESLint({
 *   ...getCacheConfig({ enabled: true })
 * });
 *
 * @example
 * // Clear the cache when needed
 * clearCache();
 *
 * @example
 * // Check cache statistics
 * const stats = getCacheStats();
 * console.log(`Cache size: ${stats.sizeHuman}`);
 *
 * @module cache-integration
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { isESLintV9 } = require("./eslint-compat");
const { createLogger } = require("./debug");

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

/**
 * Logger for cache-related debug messages
 * @type {Object}
 * @private
 */
const log = createLogger("cache");

/**
 * Package information for version tracking
 * Loaded lazily to avoid circular dependencies
 *
 * @type {Object|null}
 * @private
 */
let _pkg = null;

/**
 * Get package.json contents with lazy loading
 * @returns {Object} Package.json contents
 * @private
 */
function getPkg() {
  if (_pkg === null) {
    try {
      _pkg = require("../../package.json");
    } catch (error) {
      log.warn("Could not load package.json: %s", error.message);
      _pkg = { version: "unknown" };
    }
  }
  return _pkg;
}

// ---------------------------------------------------------------------------
// Cache Directory Management
// ---------------------------------------------------------------------------

/**
 * Get the default cache directory path.
 *
 * The default location is within node_modules/.cache to follow the
 * convention used by other tools (babel, eslint, etc.). This ensures
 * the cache is:
 * - Ignored by git (node_modules is typically gitignored)
 * - Cleared on `npm ci` or `npm install`
 * - Colocated with other build caches
 *
 * @returns {string} Absolute path to the default cache directory
 *
 * @example
 * const cacheDir = getDefaultCacheDir();
 * // => "/path/to/project/node_modules/.cache/lint-my-lines"
 */
function getDefaultCacheDir() {
  return path.join(process.cwd(), "node_modules", ".cache", "lint-my-lines");
}

/**
 * Ensure a directory exists, creating it if necessary.
 *
 * This is used to create the cache directory before writing cache files.
 * Uses recursive mkdir to handle nested paths.
 *
 * @param {string} dirPath - The directory path to ensure exists
 * @returns {boolean} True if directory exists/was created, false on error
 *
 * @private
 */
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.debug("Created cache directory: %s", dirPath);
    }
    return true;
  } catch (error) {
    log.warn("Failed to create directory %s: %s", dirPath, error.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cache Key Generation
// ---------------------------------------------------------------------------

/**
 * Generate a unique cache key for the current configuration.
 *
 * The cache key is a hash of several components that, if changed,
 * should invalidate the cache:
 *
 * - **Plugin version**: Cache from different plugin versions shouldn't mix
 * - **Node version**: Different Node versions may have different behaviors
 * - **Preset name**: Different presets have different rules
 *
 * The resulting hash is used as part of the cache filename to ensure
 * cache isolation between different configurations.
 *
 * @param {Object} options - Options for cache key generation
 * @param {string} [options.preset] - Preset name to include in key (e.g., "recommended")
 * @returns {string} 12-character MD5 hash as cache key
 *
 * @example
 * // With preset
 * const key = generateCacheKey({ preset: "recommended" });
 * // => "a1b2c3d4e5f6"
 *
 * @example
 * // Without preset
 * const key = generateCacheKey();
 * // => "1a2b3c4d5e6f"
 *
 * @example
 * // Use in cache file path
 * const cacheFile = path.join(cacheDir, generateCacheKey({ preset: "strict" }));
 */
function generateCacheKey(options = {}) {
  const pkg = getPkg();

  // Build array of cache key components
  // Each component that changes should produce a different key
  const components = [
    // Plugin version - new version = new cache
    `plugin:${pkg.version}`,

    // Node major version - different Node = different cache
    // Only major version to avoid too much fragmentation
    `node:${process.version.split(".")[0]}`,
  ];

  // Add preset if specified
  // This ensures different presets don't share cache
  if (options.preset) {
    components.push(`preset:${options.preset}`);
  }

  // Create hash from components
  const keyString = components.join("|");
  const hash = crypto
    .createHash("md5")
    .update(keyString)
    .digest("hex")
    .slice(0, 12);

  log.debug("Generated cache key: %s from %s", hash, keyString);

  return hash;
}

// ---------------------------------------------------------------------------
// Cache Configuration
// ---------------------------------------------------------------------------

/**
 * Get ESLint cache configuration options.
 *
 * Returns an object that can be spread into ESLint constructor options
 * to enable caching with appropriate settings for the installed version.
 *
 * ## ESLint v9 Options
 *
 * - `cache: true` - Enable caching
 * - `cacheLocation: string` - Path to cache file
 * - `cacheStrategy: "metadata" | "content"` - How to detect changes
 *
 * ## ESLint v8 Options
 *
 * - `cache: true` - Enable caching
 * - `cacheLocation: string` - Path to cache file
 *
 * @param {Object} options - Cache configuration options
 * @param {boolean} [options.enabled=true] - Whether to enable caching
 * @param {string} [options.location] - Custom cache file location
 * @param {string} [options.strategy="metadata"] - Cache strategy (v9 only)
 * @param {string} [options.preset] - Preset name for cache key generation
 * @returns {Object} ESLint cache configuration to spread into ESLint options
 *
 * @example
 * // Basic usage - enable caching with defaults
 * const eslint = new ESLint({
 *   ...getCacheConfig()
 * });
 *
 * @example
 * // Disable caching
 * const eslint = new ESLint({
 *   ...getCacheConfig({ enabled: false })
 * });
 *
 * @example
 * // Custom cache location with content strategy
 * const eslint = new ESLint({
 *   ...getCacheConfig({
 *     enabled: true,
 *     location: "/tmp/eslint-cache",
 *     strategy: "content"
 *   })
 * });
 *
 * @example
 * // With preset for cache isolation
 * const eslint = new ESLint({
 *   ...getCacheConfig({
 *     enabled: true,
 *     preset: "strict"
 *   })
 * });
 */
function getCacheConfig(options = {}) {
  const {
    enabled = true,
    location,
    strategy = "metadata",
    preset,
  } = options;

  // If caching is disabled, return minimal config
  if (!enabled) {
    log.debug("Caching disabled");
    return { cache: false };
  }

  // Determine cache location
  // Either use provided location or generate from default dir + key
  const cacheLocation = location || path.join(
    getDefaultCacheDir(),
    generateCacheKey({ preset })
  );

  // Ensure cache directory exists
  const cacheDir = path.dirname(cacheLocation);
  if (!ensureDir(cacheDir)) {
    // If we can't create the directory, disable caching
    log.warn("Cannot create cache directory, disabling cache");
    return { cache: false };
  }

  // Build base config (works for both v8 and v9)
  const config = {
    cache: true,
    cacheLocation,
  };

  // Add v9-specific options
  if (isESLintV9()) {
    // Validate strategy value
    const validStrategies = ["metadata", "content"];
    const normalizedStrategy = validStrategies.includes(strategy)
      ? strategy
      : "metadata";

    config.cacheStrategy = normalizedStrategy;

    log.debug(
      "ESLint v9 cache config: location=%s, strategy=%s",
      cacheLocation,
      normalizedStrategy
    );
  } else {
    log.debug("ESLint v8 cache config: location=%s", cacheLocation);
  }

  return config;
}

// ---------------------------------------------------------------------------
// Cache Validation
// ---------------------------------------------------------------------------

/**
 * Check if the cache should be invalidated.
 *
 * This function compares cached metadata against current metadata to
 * determine if the cache is still valid. The cache should be invalidated
 * when:
 *
 * - **Plugin version changes**: New plugin version may have different behavior
 * - **Preset changes**: Different preset means different rules
 * - **Node major version changes**: Different Node may have different behavior
 *
 * @param {Object} cachedInfo - Previously cached metadata
 * @param {string} [cachedInfo.pluginVersion] - Cached plugin version
 * @param {string} [cachedInfo.preset] - Cached preset name
 * @param {string} [cachedInfo.nodeMajor] - Cached Node.js major version
 * @param {Object} currentInfo - Current environment metadata
 * @param {string} [currentInfo.pluginVersion] - Current plugin version
 * @param {string} [currentInfo.preset] - Current preset name
 * @param {string} [currentInfo.nodeMajor] - Current Node.js major version
 * @returns {boolean} True if cache should be invalidated
 *
 * @example
 * const cached = { pluginVersion: "1.0.2", preset: "recommended" };
 * const current = { pluginVersion: "1.0.3", preset: "recommended" };
 *
 * if (shouldInvalidateCache(cached, current)) {
 *   clearCache();
 * }
 */
function shouldInvalidateCache(cachedInfo, currentInfo) {
  // No cached info means we need to start fresh
  if (!cachedInfo) {
    log.debug("No cached info, cache invalid");
    return true;
  }

  // Check plugin version
  if (cachedInfo.pluginVersion !== currentInfo.pluginVersion) {
    log.debug(
      "Plugin version changed: %s -> %s, invalidating cache",
      cachedInfo.pluginVersion,
      currentInfo.pluginVersion
    );
    return true;
  }

  // Check preset
  if (cachedInfo.preset !== currentInfo.preset) {
    log.debug(
      "Preset changed: %s -> %s, invalidating cache",
      cachedInfo.preset,
      currentInfo.preset
    );
    return true;
  }

  // Check Node major version (if tracked)
  if (
    cachedInfo.nodeMajor &&
    currentInfo.nodeMajor &&
    cachedInfo.nodeMajor !== currentInfo.nodeMajor
  ) {
    log.debug(
      "Node major version changed: %s -> %s, invalidating cache",
      cachedInfo.nodeMajor,
      currentInfo.nodeMajor
    );
    return true;
  }

  // Cache is still valid
  log.debug("Cache is valid");
  return false;
}

// ---------------------------------------------------------------------------
// Cache Cleanup
// ---------------------------------------------------------------------------

/**
 * Clear the lint-my-lines cache.
 *
 * Removes all cached lint results. This is useful when:
 * - Plugin is updated
 * - Configuration changes significantly
 * - Cache becomes corrupted
 * - Testing needs a clean slate
 *
 * @param {Object} options - Clear options
 * @param {string} [options.location] - Specific cache location to clear
 * @returns {boolean} True if cache was cleared, false if nothing to clear or error
 *
 * @example
 * // Clear default cache
 * const cleared = clearCache();
 * if (cleared) {
 *   console.log("Cache cleared successfully");
 * }
 *
 * @example
 * // Clear specific cache location
 * clearCache({ location: "/custom/cache/path" });
 */
function clearCache(options = {}) {
  const location = options.location || getDefaultCacheDir();

  log.debug("Attempting to clear cache at: %s", location);

  try {
    // Check if cache exists
    if (!fs.existsSync(location)) {
      log.debug("No cache to clear at: %s", location);
      return false;
    }

    // Remove cache directory recursively
    fs.rmSync(location, { recursive: true, force: true });

    log.info("Cleared cache at: %s", location);
    return true;
  } catch (error) {
    log.warn("Failed to clear cache at %s: %s", location, error.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cache Statistics
// ---------------------------------------------------------------------------

/**
 * Get cache statistics for debugging and monitoring.
 *
 * Returns information about the current cache state including:
 * - Whether the cache exists
 * - Location of the cache
 * - Number of cache files
 * - Total size in bytes and human-readable format
 *
 * @returns {Object} Cache statistics
 * @returns {boolean} returns.exists - Whether cache directory exists
 * @returns {string} [returns.location] - Cache directory path (if exists)
 * @returns {number} [returns.files] - Number of files in cache (if exists)
 * @returns {number} [returns.size] - Total size in bytes (if exists)
 * @returns {string} [returns.sizeHuman] - Human-readable size (if exists)
 * @returns {string} [returns.error] - Error message (if error occurred)
 *
 * @example
 * const stats = getCacheStats();
 *
 * if (stats.exists) {
 *   console.log(`Cache location: ${stats.location}`);
 *   console.log(`Cache size: ${stats.sizeHuman}`);
 *   console.log(`Cache files: ${stats.files}`);
 * } else {
 *   console.log("No cache exists");
 * }
 *
 * @example
 * // Check for errors
 * const stats = getCacheStats();
 * if (stats.error) {
 *   console.error(`Cache stats error: ${stats.error}`);
 * }
 */
function getCacheStats() {
  const cacheDir = getDefaultCacheDir();

  try {
    // Check if cache directory exists
    if (!fs.existsSync(cacheDir)) {
      return {
        exists: false,
        size: 0,
        files: 0,
      };
    }

    // Read directory contents
    const files = fs.readdirSync(cacheDir);
    let totalSize = 0;

    // Calculate total size of all files
    for (const file of files) {
      try {
        const filePath = path.join(cacheDir, file);
        const stat = fs.statSync(filePath);

        // Only count regular files
        if (stat.isFile()) {
          totalSize += stat.size;
        }
      } catch (fileError) {
        // Skip files we can't stat
        log.debug("Could not stat file %s: %s", file, fileError.message);
      }
    }

    // Format human-readable size
    const sizeHuman = formatBytes(totalSize);

    log.debug(
      "Cache stats: %d files, %s at %s",
      files.length,
      sizeHuman,
      cacheDir
    );

    return {
      exists: true,
      location: cacheDir,
      files: files.length,
      size: totalSize,
      sizeHuman,
    };
  } catch (error) {
    log.warn("Error getting cache stats: %s", error.message);
    return {
      exists: false,
      error: error.message,
    };
  }
}

/**
 * Format bytes as human-readable string.
 *
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB", "2.3 MB")
 * @private
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(2)} ${units[i]}`;
}

// ---------------------------------------------------------------------------
// Current Environment Info
// ---------------------------------------------------------------------------

/**
 * Get current environment metadata for cache validation.
 *
 * Returns an object with the current environment state that can be
 * compared against cached metadata to determine if cache is valid.
 *
 * @param {Object} options - Options
 * @param {string} [options.preset] - Current preset name
 * @returns {Object} Current environment metadata
 * @returns {string} returns.pluginVersion - Current plugin version
 * @returns {string} returns.nodeMajor - Current Node.js major version
 * @returns {string} [returns.preset] - Current preset name (if provided)
 *
 * @example
 * const current = getCurrentCacheInfo({ preset: "strict" });
 * // => { pluginVersion: "1.0.3", nodeMajor: "18", preset: "strict" }
 */
function getCurrentCacheInfo(options = {}) {
  const pkg = getPkg();

  const info = {
    pluginVersion: pkg.version,
    nodeMajor: process.version.split(".")[0].replace("v", ""),
  };

  if (options.preset) {
    info.preset = options.preset;
  }

  return info;
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Directory management
  getDefaultCacheDir,

  // Cache key generation
  generateCacheKey,

  // Cache configuration
  getCacheConfig,

  // Cache validation
  shouldInvalidateCache,
  getCurrentCacheInfo,

  // Cache cleanup
  clearCache,

  // Cache statistics
  getCacheStats,
};
