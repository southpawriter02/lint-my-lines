/**
 * @fileoverview Tests for error-utils utilities.
 * @author Jules
 */
"use strict";

const assert = require("assert");
const {
  safeRegexCompile,
  resolveEnvToken,
  validateOptions,
  safeJsonParse,
} = require("../../../lib/utils/error-utils");

describe("error-utils", function () {
  describe("safeRegexCompile", function () {
    it("should return regex for valid pattern", function () {
      const { regex, error } = safeRegexCompile("^TODO", "i");
      assert.ok(regex instanceof RegExp);
      assert.strictEqual(error, null);
    });

    it("should return error for invalid pattern", function () {
      const { regex, error } = safeRegexCompile("[invalid", "");
      assert.strictEqual(regex, null);
      assert.ok(error.includes("Invalid pattern"));
      assert.ok(error.includes("[invalid"));
    });

    it("should use fallback pattern when primary fails", function () {
      const { regex, error } = safeRegexCompile("[invalid", "i", "^TODO");
      assert.ok(regex instanceof RegExp);
      assert.ok(error.includes("Using default"));
      assert.strictEqual(regex.test("TODO: test"), true);
    });

    it("should return error if both patterns fail", function () {
      const { regex, error } = safeRegexCompile("[invalid1", "", "[invalid2");
      assert.strictEqual(regex, null);
      assert.ok(error.includes("Invalid pattern"));
    });

    it("should handle empty pattern", function () {
      const { regex, error } = safeRegexCompile("", "");
      assert.ok(regex instanceof RegExp);
      assert.strictEqual(error, null);
    });
  });

  describe("resolveEnvToken", function () {
    const originalEnv = process.env;

    beforeEach(function () {
      process.env = { ...originalEnv };
    });

    afterEach(function () {
      process.env = originalEnv;
    });

    it("should return null for empty token", function () {
      const { value, error } = resolveEnvToken(null);
      assert.strictEqual(value, null);
      assert.strictEqual(error, null);
    });

    it("should return literal token value", function () {
      const { value, error } = resolveEnvToken("my-secret-token");
      assert.strictEqual(value, "my-secret-token");
      assert.strictEqual(error, null);
    });

    it("should resolve environment variable", function () {
      process.env.TEST_TOKEN = "resolved-value";
      const { value, error } = resolveEnvToken("$TEST_TOKEN", "testField");
      assert.strictEqual(value, "resolved-value");
      assert.strictEqual(error, null);
    });

    it("should return error for missing env var", function () {
      delete process.env.MISSING_TOKEN;
      const { value, error } = resolveEnvToken("$MISSING_TOKEN", "testField");
      assert.strictEqual(value, null);
      assert.ok(error.includes("MISSING_TOKEN"));
      assert.ok(error.includes("testField"));
      assert.ok(error.includes("export"));
    });
  });

  describe("validateOptions", function () {
    it("should return empty array for valid options", function () {
      const errors = validateOptions(
        { maxLength: 100, enabled: true },
        {
          maxLength: { type: "integer", min: 1 },
          enabled: { type: "boolean" },
        }
      );
      assert.deepStrictEqual(errors, []);
    });

    it("should detect invalid integer type", function () {
      const errors = validateOptions(
        { maxLength: "100" },
        { maxLength: { type: "integer" } }
      );
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes("integer"));
    });

    it("should detect value below minimum", function () {
      const errors = validateOptions(
        { maxLength: 0 },
        { maxLength: { min: 1 } }
      );
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes(">= 1"));
    });

    it("should detect value above maximum", function () {
      const errors = validateOptions(
        { maxLength: 200 },
        { maxLength: { max: 100 } }
      );
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes("<= 100"));
    });

    it("should detect invalid enum value", function () {
      const errors = validateOptions(
        { sensitivity: "extreme" },
        { sensitivity: { enum: ["low", "medium", "high"] } }
      );
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes("low, medium, high"));
    });

    it("should skip undefined options", function () {
      const errors = validateOptions(
        { other: "value" },
        { maxLength: { type: "integer" } }
      );
      assert.deepStrictEqual(errors, []);
    });

    it("should collect multiple errors", function () {
      const errors = validateOptions(
        { maxLength: "100", minLength: -5 },
        {
          maxLength: { type: "integer" },
          minLength: { min: 0 },
        }
      );
      assert.strictEqual(errors.length, 2);
    });
  });

  describe("safeJsonParse", function () {
    it("should parse valid JSON", function () {
      const { value, error } = safeJsonParse('{"key": "value"}');
      assert.deepStrictEqual(value, { key: "value" });
      assert.strictEqual(error, null);
    });

    it("should return default for invalid JSON", function () {
      const { value, error } = safeJsonParse("not json", { default: true });
      assert.deepStrictEqual(value, { default: true });
      assert.ok(error.includes("Failed to parse JSON"));
    });

    it("should return null by default for invalid JSON", function () {
      const { value, error } = safeJsonParse("not json");
      assert.strictEqual(value, null);
      assert.ok(error !== null);
    });
  });
});
