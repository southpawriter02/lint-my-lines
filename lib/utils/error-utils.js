/**
 * @fileoverview Error handling utilities for lint-my-lines.
 * @author Jules
 */
"use strict";

/**
 * Safely compile a regex pattern with optional fallback.
 * Returns an object with either the compiled regex or an error message.
 *
 * @param {string} pattern - Regex pattern to compile
 * @param {string} [flags=""] - Regex flags
 * @param {string} [fallbackPattern=null] - Fallback pattern if primary fails
 * @returns {{ regex: RegExp|null, error: string|null }} Result object
 *
 * @example
 * const { regex, error } = safeRegexCompile(userPattern, "i", "^TODO");
 * if (error) {
 *   console.warn(error);
 * }
 */
function safeRegexCompile(pattern, flags = "", fallbackPattern = null) {
  try {
    return { regex: new RegExp(pattern, flags), error: null };
  } catch (e) {
    if (fallbackPattern) {
      try {
        return {
          regex: new RegExp(fallbackPattern, flags),
          error: `Invalid pattern "${pattern}": ${e.message}. Using default pattern.`,
        };
      } catch {
        // Fallback also failed (shouldn't happen with hardcoded defaults)
        return {
          regex: null,
          error: `Invalid pattern "${pattern}": ${e.message}`,
        };
      }
    }
    return {
      regex: null,
      error: `Invalid pattern "${pattern}": ${e.message}`,
    };
  }
}

/**
 * Resolve a token configuration that may reference an environment variable.
 * Returns an object with the resolved value or an error message.
 *
 * @param {string} tokenConfig - Token value or "$ENV_VAR" reference
 * @param {string} [fieldName="token"] - Field name for error messages
 * @returns {{ value: string|null, error: string|null }} Result object
 *
 * @example
 * const { value, error } = resolveEnvToken("$GITHUB_TOKEN", "githubToken");
 * if (error) {
 *   console.warn(error);
 * }
 */
function resolveEnvToken(tokenConfig, fieldName = "token") {
  if (!tokenConfig) {
    return { value: null, error: null };
  }

  if (tokenConfig.startsWith("$")) {
    const envVar = tokenConfig.slice(1);
    const value = process.env[envVar];
    if (!value) {
      return {
        value: null,
        error:
          `Environment variable "${envVar}" for ${fieldName} is not set. ` +
          `Set it with: export ${envVar}=your-token`,
      };
    }
    return { value, error: null };
  }

  return { value: tokenConfig, error: null };
}

/**
 * Validate rule options against a set of checks.
 * Returns an array of error messages (empty if all valid).
 *
 * @param {Object} options - Rule options to validate
 * @param {Object} checks - Validation checks per field
 * @param {string} [checks.*.type] - Expected type ('integer', 'boolean', 'string')
 * @param {number} [checks.*.min] - Minimum value (for numbers)
 * @param {number} [checks.*.max] - Maximum value (for numbers)
 * @param {Array} [checks.*.enum] - Allowed values
 * @returns {string[]} Array of error messages
 *
 * @example
 * const errors = validateOptions(options, {
 *   maxLength: { type: 'integer', min: 1 },
 *   sensitivity: { enum: ['low', 'medium', 'high'] },
 * });
 */
function validateOptions(options, checks) {
  const errors = [];

  for (const [field, check] of Object.entries(checks)) {
    const value = options[field];
    if (value === undefined) {
      continue;
    }

    // Type checking
    if (check.type === "integer" && !Number.isInteger(value)) {
      errors.push(`Option "${field}" must be an integer, got ${typeof value}`);
      continue;
    }
    if (check.type === "boolean" && typeof value !== "boolean") {
      errors.push(`Option "${field}" must be a boolean, got ${typeof value}`);
      continue;
    }
    if (check.type === "string" && typeof value !== "string") {
      errors.push(`Option "${field}" must be a string, got ${typeof value}`);
      continue;
    }

    // Range checking
    if (check.min !== undefined && value < check.min) {
      errors.push(`Option "${field}" must be >= ${check.min}, got ${value}`);
    }
    if (check.max !== undefined && value > check.max) {
      errors.push(`Option "${field}" must be <= ${check.max}, got ${value}`);
    }

    // Enum checking
    if (check.enum && !check.enum.includes(value)) {
      errors.push(
        `Option "${field}" must be one of: ${check.enum.join(", ")}. Got "${value}"`
      );
    }
  }

  return errors;
}

/**
 * Format a configuration error message with helpful suggestions.
 *
 * @param {string} ruleName - Name of the rule
 * @param {string} field - Field that has the error
 * @param {string} message - Error message
 * @returns {string} Formatted error message
 */
function formatConfigError(ruleName, field, message) {
  return `[${ruleName}] Configuration error for "${field}": ${message}`;
}

/**
 * Safely parse JSON with a default value on failure.
 *
 * @param {string} jsonString - JSON string to parse
 * @param {*} [defaultValue=null] - Default value if parsing fails
 * @returns {{ value: *, error: string|null }} Result object
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return { value: JSON.parse(jsonString), error: null };
  } catch (e) {
    return {
      value: defaultValue,
      error: `Failed to parse JSON: ${e.message}`,
    };
  }
}

module.exports = {
  safeRegexCompile,
  resolveEnvToken,
  validateOptions,
  formatConfigError,
  safeJsonParse,
};
