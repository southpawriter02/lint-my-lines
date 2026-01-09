/**
 * TypeScript type definitions for eslint-plugin-lint-my-lines/helpers
 *
 * These types provide IntelliSense support for the configuration helper
 * utilities that make it easier to create and customize ESLint flat configs.
 *
 * @packageDocumentation
 */

import type { Linter } from "eslint";

/**
 * A flat config object as used by ESLint v9+
 */
export interface FlatConfig {
  /**
   * Config name for debugging and identification
   */
  name?: string;

  /**
   * Plugin instances keyed by namespace
   */
  plugins?: Record<string, unknown>;

  /**
   * Rule configurations
   */
  rules?: Record<string, Linter.RuleEntry>;

  /**
   * Glob patterns for files this config applies to
   */
  files?: string[];

  /**
   * Glob patterns for files to exclude from this config
   */
  ignores?: string[];

  /**
   * Processor reference for non-JS files
   */
  processor?: string;

  /**
   * Language options (parser settings, etc.)
   */
  languageOptions?: Linter.LanguageOptions;
}

/**
 * Options for extending a preset with custom overrides
 */
export interface ExtendPresetOptions {
  /**
   * Rule settings to override
   */
  rules?: Record<string, Linter.RuleEntry>;

  /**
   * Custom config name
   */
  name?: string;

  /**
   * File patterns to apply this config to
   */
  files?: string[];

  /**
   * File patterns to exclude
   */
  ignores?: string[];
}

/**
 * Severity variants returned by createSeverityVariants
 */
export interface SeverityVariants {
  /**
   * Preset with all rules set to "warn" severity
   */
  warn: FlatConfig;

  /**
   * Preset with all rules set to "error" severity
   */
  error: FlatConfig;
}

/**
 * Options for createFileTypePreset
 */
export interface FileTypePresetOptions {
  /**
   * Base preset to extend
   */
  basePreset: FlatConfig;

  /**
   * File patterns this preset applies to
   */
  files: string[];

  /**
   * Rule overrides (optional)
   */
  rules?: Record<string, Linter.RuleEntry>;

  /**
   * Custom config name (optional)
   */
  name?: string;
}

/**
 * Create a config that only applies to specific file patterns.
 *
 * This is the "include" pattern - the config will only be applied to files
 * matching the specified glob patterns.
 *
 * @param preset - Base preset config from plugin.configs
 * @param patterns - Glob pattern(s) for files to include
 * @returns New config object with files property
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createConfigForFiles } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   createConfigForFiles(lintMyLines.configs["flat/strict"], "src/**\/*.js"),
 * ];
 * ```
 */
export function createConfigForFiles(
  preset: FlatConfig,
  patterns: string | string[]
): FlatConfig;

/**
 * Create a config with specific file exclusions.
 *
 * This is the "exclude" pattern - the config will include the `ignores`
 * property to exclude matching files from rule application.
 *
 * @param preset - Base preset config
 * @param patterns - Glob pattern(s) for files to exclude
 * @returns Config object with ignores property
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createConfigWithExclude } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   createConfigWithExclude(
 *     lintMyLines.configs["flat/recommended"],
 *     ["**\/*.test.js", "dist/**"]
 *   ),
 * ];
 * ```
 */
export function createConfigWithExclude(
  preset: FlatConfig,
  patterns: string | string[]
): FlatConfig;

/**
 * Extend a preset with custom rule overrides.
 *
 * This enables rule inheritance by starting with a base preset and
 * overriding specific rules.
 *
 * @param preset - Base preset config
 * @param overrides - Configuration overrides
 * @returns Extended config object
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { extendPreset } from "eslint-plugin-lint-my-lines/helpers";
 *
 * export default [
 *   extendPreset(lintMyLines.configs["flat/recommended"], {
 *     name: "my-config",
 *     rules: {
 *       "lint-my-lines/require-jsdoc": "off",
 *     },
 *   }),
 * ];
 * ```
 */
export function extendPreset(
  preset: FlatConfig,
  overrides?: ExtendPresetOptions
): FlatConfig;

/**
 * Create warn and error severity variants of a preset.
 *
 * This utility converts all rule severities in a preset to either
 * "warn" or "error", useful for creating development vs production configs.
 *
 * @param preset - Base preset config
 * @returns Object with warn and error variants
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { createSeverityVariants } from "eslint-plugin-lint-my-lines/helpers";
 *
 * const { warn, error } = createSeverityVariants(
 *   lintMyLines.configs["flat/recommended"]
 * );
 *
 * export default [
 *   process.env.CI ? error : warn,
 * ];
 * ```
 */
export function createSeverityVariants(preset: FlatConfig): SeverityVariants;

/**
 * Merge multiple configs with proper precedence.
 *
 * Later configs override earlier ones. This is useful for creating
 * custom presets from multiple sources.
 *
 * @param configs - Config objects to merge
 * @returns Merged config object
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import { mergeConfigs } from "eslint-plugin-lint-my-lines/helpers";
 *
 * const myPreset = mergeConfigs(
 *   lintMyLines.configs["flat/recommended"],
 *   lintMyLines.configs["flat/analysis"],
 *   { rules: { "lint-my-lines/todo-aging-warnings": "off" } }
 * );
 *
 * export default [myPreset];
 * ```
 */
export function mergeConfigs(...configs: FlatConfig[]): FlatConfig;

/**
 * Create a preset for specific file types with proper inheritance.
 *
 * This is a convenience function that combines file patterns
 * with rule overrides for the common use case of creating
 * language-specific or directory-specific configurations.
 *
 * @param options - Configuration options
 * @returns Configured preset
 *
 * @example
 * ```typescript
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
 * ```
 */
export function createFileTypePreset(options: FileTypePresetOptions): FlatConfig;
