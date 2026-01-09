/**
 * @fileoverview Configuration helper utilities for eslint-plugin-lint-my-lines
 * @author lint-my-lines
 *
 * This module provides utility functions for creating and customizing
 * ESLint flat configurations. These helpers make it easier to:
 * - Apply rules to specific files only
 * - Exclude files from rule application
 * - Extend presets with custom rules
 * - Create severity variants (warn vs error)
 * - Merge multiple configs with proper precedence
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createConfigForFiles, extendPreset } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   createConfigForFiles(lintMyLines.configs["flat/strict"], "src/**\/*.js"),
 *   extendPreset(lintMyLines.configs["flat/recommended"], {
 *     rules: { "lint-my-lines/require-jsdoc": "off" }
 *   }),
 * ];
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

const { createLogger } = require("./debug");

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

const log = createLogger("config-helpers");

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Validate that preset is a valid object
 * @param {*} preset - Value to validate
 * @param {string} functionName - Name of calling function for error message
 * @throws {Error} If preset is not a valid object
 * @private
 */
function validatePreset(preset, functionName) {
  if (!preset || typeof preset !== "object") {
    throw new Error(`${functionName}: preset must be an object`);
  }
}

/**
 * Normalize patterns to an array
 * @param {string|string[]} patterns - Single pattern or array of patterns
 * @returns {string[]} Array of patterns
 * @private
 */
function normalizePatterns(patterns) {
  return Array.isArray(patterns) ? patterns : [patterns];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a config that only applies to specific file patterns
 *
 * This is the "include" pattern - the config will only be applied to files
 * matching the specified glob patterns.
 *
 * @param {Object} preset - Base preset config from plugin.configs
 * @param {string|string[]} patterns - Glob pattern(s) for files to include
 * @returns {Object} New config object with files property
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createConfigForFiles } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   // Apply strict rules only to src/ directory
 *   createConfigForFiles(lintMyLines.configs["flat/strict"], "src/**\/*.js"),
 *
 *   // Apply minimal rules to multiple directories
 *   createConfigForFiles(lintMyLines.configs["flat/minimal"], [
 *     "scripts/**\/*.js",
 *     "tools/**\/*.js"
 *   ]),
 * ];
 */
function createConfigForFiles(preset, patterns) {
  validatePreset(preset, "createConfigForFiles");

  const filePatterns = normalizePatterns(patterns);

  log.debug("Creating config for files: %s", filePatterns.join(", "));

  return {
    ...preset,
    name: `${preset.name || "custom"}/files(${filePatterns.length})`,
    files: filePatterns,
  };
}

/**
 * Create a config with specific file exclusions
 *
 * This is the "exclude" pattern - the config will include the `ignores`
 * property to exclude matching files from rule application.
 *
 * @param {Object} preset - Base preset config
 * @param {string|string[]} patterns - Glob pattern(s) for files to exclude
 * @returns {Object} Config object with ignores property
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createConfigWithExclude } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   // Apply recommended, but exclude test files and generated code
 *   createConfigWithExclude(
 *     lintMyLines.configs["flat/recommended"],
 *     ["**\/*.test.js", "**\/*.spec.js", "dist/**", "generated/**"]
 *   ),
 * ];
 */
function createConfigWithExclude(preset, patterns) {
  validatePreset(preset, "createConfigWithExclude");

  const excludePatterns = normalizePatterns(patterns);

  log.debug("Creating config excluding: %s", excludePatterns.join(", "));

  return {
    ...preset,
    name: `${preset.name || "custom"}/exclude(${excludePatterns.length})`,
    ignores: excludePatterns,
  };
}

/**
 * Extend a preset with custom rule overrides
 *
 * This enables rule inheritance by starting with a base preset and
 * overriding specific rules. The resulting config maintains all
 * base preset properties while applying the overrides.
 *
 * @param {Object} preset - Base preset config
 * @param {Object} overrides - Configuration overrides
 * @param {Object} [overrides.rules] - Rule settings to override
 * @param {string} [overrides.name] - Optional custom config name
 * @param {string[]} [overrides.files] - Optional file patterns
 * @returns {Object} Extended config object
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { extendPreset } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   extendPreset(lintMyLines.configs["flat/recommended"], {
 *     name: "my-team-config",
 *     rules: {
 *       // Stricter comment length
 *       "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
 *       // Disable JSDoc requirement
 *       "lint-my-lines/require-jsdoc": "off",
 *     },
 *   }),
 * ];
 */
function extendPreset(preset, overrides = {}) {
  validatePreset(preset, "extendPreset");

  const { rules: overrideRules = {}, name: customName, ...otherOverrides } = overrides;

  log.debug(
    "Extending preset %s with %d rule overrides",
    preset.name,
    Object.keys(overrideRules).length
  );

  return {
    ...preset,
    ...otherOverrides,
    name: customName || `${preset.name || "custom"}/extended`,
    rules: {
      ...preset.rules,
      ...overrideRules,
    },
  };
}

/**
 * Create warn and error severity variants of a preset
 *
 * This utility converts all rule severities in a preset to either
 * "warn" or "error", useful for creating development vs production configs.
 * Rules that are "off" remain unchanged.
 *
 * @param {Object} preset - Base preset config
 * @returns {{ warn: Object, error: Object }} Object with warn and error variants
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createSeverityVariants } from "eslint-plugin-lint-my-lines/helpers";
 *
 * const { warn, error } = createSeverityVariants(
 *   lintMyLines.configs["flat/recommended"]
 * );
 *
 * export default [
 *   // Use warnings in development, errors in CI
 *   process.env.CI ? error : warn,
 * ];
 */
function createSeverityVariants(preset) {
  validatePreset(preset, "createSeverityVariants");

  /**
   * Convert all rules to a specific severity
   * @param {Object} rules - Rules configuration
   * @param {string} severity - Target severity ("warn" or "error")
   * @returns {Object} Converted rules
   */
  const convertRules = (rules, severity) => {
    const converted = {};

    for (const [ruleName, config] of Object.entries(rules)) {
      if (config === "off" || config === 0) {
        // Keep "off" rules unchanged
        converted[ruleName] = config;
      } else if (Array.isArray(config)) {
        // Rule with options: ["warn", { option: value }] => ["error", { option: value }]
        converted[ruleName] = [severity, ...config.slice(1)];
      } else {
        // Simple rule: "warn" => "error"
        converted[ruleName] = severity;
      }
    }

    return converted;
  };

  log.debug("Creating severity variants for %s", preset.name);

  return {
    warn: {
      ...preset,
      name: `${preset.name || "custom"}/warn`,
      rules: convertRules(preset.rules || {}, "warn"),
    },
    error: {
      ...preset,
      name: `${preset.name || "custom"}/error`,
      rules: convertRules(preset.rules || {}, "error"),
    },
  };
}

/**
 * Merge multiple configs with proper precedence
 *
 * Later configs override earlier ones. This is useful for creating
 * custom presets from multiple sources or combining presets.
 *
 * @param {...Object} configs - Config objects to merge
 * @returns {Object} Merged config object
 * @throws {Error} If no configs are provided
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { mergeConfigs } from "eslint-plugin-lint-my-lines/helpers";
 *
 * // Create a custom preset combining recommended + analysis
 * const myPreset = mergeConfigs(
 *   lintMyLines.configs["flat/recommended"],
 *   lintMyLines.configs["flat/analysis"],
 *   {
 *     rules: {
 *       "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 14 }],
 *     },
 *   }
 * );
 *
 * export default [myPreset];
 */
function mergeConfigs(...configs) {
  if (configs.length === 0) {
    throw new Error("mergeConfigs: at least one config required");
  }

  log.debug("Merging %d configs", configs.length);

  const merged = {
    name: "merged-config",
    plugins: {},
    rules: {},
  };

  for (const config of configs) {
    if (!config || typeof config !== "object") continue;

    // Merge plugins
    if (config.plugins) {
      Object.assign(merged.plugins, config.plugins);
    }

    // Merge rules (later configs override earlier ones)
    if (config.rules) {
      Object.assign(merged.rules, config.rules);
    }

    // Take files from last config that has them
    if (config.files) {
      merged.files = config.files;
    }

    // Take ignores from last config that has them
    if (config.ignores) {
      merged.ignores = config.ignores;
    }

    // Take processor from last config that has it
    if (config.processor) {
      merged.processor = config.processor;
    }

    // Merge language options
    if (config.languageOptions) {
      merged.languageOptions = {
        ...merged.languageOptions,
        ...config.languageOptions,
      };
    }
  }

  // Generate name from merged config names
  const names = configs
    .filter((c) => c && c.name)
    .map((c) => c.name.replace("lint-my-lines/", "").replace("flat/", ""))
    .join("+");
  merged.name = `merged(${names || "configs"})`;

  return merged;
}

/**
 * Create a preset for specific file types with proper inheritance
 *
 * This is a convenience function that combines createConfigForFiles
 * with extendPreset for the common use case of creating language-specific
 * or directory-specific configurations.
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.basePreset - Base preset to extend
 * @param {string[]} options.files - File patterns to match
 * @param {Object} [options.rules] - Rule overrides
 * @param {string} [options.name] - Config name
 * @returns {Object} Configured preset
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createFileTypePreset } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   createFileTypePreset({
 *     basePreset: lintMyLines.configs["flat/strict"],
 *     files: ["packages/core/**\/*.js"],
 *     name: "core-package-config",
 *     rules: {
 *       "lint-my-lines/require-file-header": "error",
 *     },
 *   }),
 * ];
 */
function createFileTypePreset(options) {
  const { basePreset, files, rules = {}, name } = options;

  validatePreset(basePreset, "createFileTypePreset");

  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("createFileTypePreset: files must be a non-empty array");
  }

  log.debug("Creating file type preset for: %s", files.join(", "));

  return {
    ...basePreset,
    name: name || `${basePreset.name || "custom"}/files`,
    files,
    rules: {
      ...basePreset.rules,
      ...rules,
    },
  };
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  createConfigForFiles,
  createConfigWithExclude,
  extendPreset,
  createSeverityVariants,
  mergeConfigs,
  createFileTypePreset,
};
