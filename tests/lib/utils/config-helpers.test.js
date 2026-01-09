/**
 * @fileoverview Tests for config helper utilities
 * @author lint-my-lines
 */
"use strict";

const assert = require("assert");
const {
  createConfigForFiles,
  createConfigWithExclude,
  extendPreset,
  createSeverityVariants,
  mergeConfigs,
  createFileTypePreset,
} = require("../../../lib/utils/config-helpers");

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

/**
 * Mock preset for testing
 */
const mockPreset = {
  name: "lint-my-lines/flat/test",
  plugins: { "lint-my-lines": { rules: {} } },
  rules: {
    "lint-my-lines/rule-a": "warn",
    "lint-my-lines/rule-b": ["warn", { option: true }],
    "lint-my-lines/rule-c": "off",
    "lint-my-lines/rule-d": "error",
  },
};

/**
 * Another mock preset for merge testing
 */
const mockPreset2 = {
  name: "lint-my-lines/flat/test2",
  plugins: { "other-plugin": {} },
  rules: {
    "lint-my-lines/rule-a": "error",
    "lint-my-lines/rule-e": "warn",
  },
  files: ["**/*.ts"],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("config-helpers", function () {
  // -------------------------------------------------------------------------
  // createConfigForFiles
  // -------------------------------------------------------------------------

  describe("createConfigForFiles", function () {
    it("should add files array for string pattern", function () {
      const result = createConfigForFiles(mockPreset, "src/**/*.js");

      assert.deepStrictEqual(result.files, ["src/**/*.js"]);
      assert.strictEqual(result.plugins, mockPreset.plugins);
      assert.strictEqual(result.rules, mockPreset.rules);
    });

    it("should add files array for array pattern", function () {
      const result = createConfigForFiles(mockPreset, ["src/**", "lib/**"]);

      assert.deepStrictEqual(result.files, ["src/**", "lib/**"]);
    });

    it("should generate appropriate name", function () {
      const result = createConfigForFiles(mockPreset, ["a", "b", "c"]);

      assert(result.name.includes("files(3)"));
    });

    it("should preserve other preset properties", function () {
      const presetWithProcessor = { ...mockPreset, processor: "test" };
      const result = createConfigForFiles(presetWithProcessor, "src/**");

      assert.strictEqual(result.processor, "test");
    });

    it("should throw for null preset", function () {
      assert.throws(
        () => createConfigForFiles(null, "src/**"),
        /preset must be an object/
      );
    });

    it("should throw for undefined preset", function () {
      assert.throws(
        () => createConfigForFiles(undefined, "src/**"),
        /preset must be an object/
      );
    });

    it("should throw for non-object preset", function () {
      assert.throws(
        () => createConfigForFiles("string", "src/**"),
        /preset must be an object/
      );
    });
  });

  // -------------------------------------------------------------------------
  // createConfigWithExclude
  // -------------------------------------------------------------------------

  describe("createConfigWithExclude", function () {
    it("should add ignores property for string pattern", function () {
      const result = createConfigWithExclude(mockPreset, "**/*.test.js");

      assert.deepStrictEqual(result.ignores, ["**/*.test.js"]);
    });

    it("should add ignores property for array pattern", function () {
      const result = createConfigWithExclude(mockPreset, [
        "**/*.test.js",
        "dist/**",
      ]);

      assert.deepStrictEqual(result.ignores, ["**/*.test.js", "dist/**"]);
    });

    it("should generate appropriate name", function () {
      const result = createConfigWithExclude(mockPreset, ["a", "b"]);

      assert(result.name.includes("exclude(2)"));
    });

    it("should preserve rules and plugins", function () {
      const result = createConfigWithExclude(mockPreset, "**/*.test.js");

      assert.strictEqual(result.rules, mockPreset.rules);
      assert.strictEqual(result.plugins, mockPreset.plugins);
    });

    it("should throw for invalid preset", function () {
      assert.throws(
        () => createConfigWithExclude(null, "**/*.test.js"),
        /preset must be an object/
      );
    });
  });

  // -------------------------------------------------------------------------
  // extendPreset
  // -------------------------------------------------------------------------

  describe("extendPreset", function () {
    it("should merge rules with overrides taking precedence", function () {
      const result = extendPreset(mockPreset, {
        rules: { "lint-my-lines/rule-a": "error" },
      });

      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "error");
      // Original rules should be preserved
      assert.deepStrictEqual(result.rules["lint-my-lines/rule-b"], [
        "warn",
        { option: true },
      ]);
    });

    it("should allow adding new rules", function () {
      const result = extendPreset(mockPreset, {
        rules: { "lint-my-lines/new-rule": "warn" },
      });

      assert.strictEqual(result.rules["lint-my-lines/new-rule"], "warn");
      // Original rules should be preserved
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "warn");
    });

    it("should allow custom name", function () {
      const result = extendPreset(mockPreset, { name: "my-custom-config" });

      assert.strictEqual(result.name, "my-custom-config");
    });

    it("should generate default name with /extended suffix", function () {
      const result = extendPreset(mockPreset, {});

      assert(result.name.includes("/extended"));
    });

    it("should allow adding files property", function () {
      const result = extendPreset(mockPreset, {
        files: ["src/**/*.js"],
      });

      assert.deepStrictEqual(result.files, ["src/**/*.js"]);
    });

    it("should work with empty overrides", function () {
      const result = extendPreset(mockPreset);

      assert.deepStrictEqual(result.rules, mockPreset.rules);
    });

    it("should throw for invalid preset", function () {
      assert.throws(
        () => extendPreset(null, {}),
        /preset must be an object/
      );
    });
  });

  // -------------------------------------------------------------------------
  // createSeverityVariants
  // -------------------------------------------------------------------------

  describe("createSeverityVariants", function () {
    it("should create warn variant with all active rules as warn", function () {
      const { warn } = createSeverityVariants(mockPreset);

      assert.strictEqual(warn.rules["lint-my-lines/rule-a"], "warn");
      assert.strictEqual(warn.rules["lint-my-lines/rule-d"], "warn");
    });

    it("should create error variant with all active rules as error", function () {
      const { error } = createSeverityVariants(mockPreset);

      assert.strictEqual(error.rules["lint-my-lines/rule-a"], "error");
      assert.strictEqual(error.rules["lint-my-lines/rule-d"], "error");
    });

    it("should preserve 'off' rules in both variants", function () {
      const { warn, error } = createSeverityVariants(mockPreset);

      assert.strictEqual(warn.rules["lint-my-lines/rule-c"], "off");
      assert.strictEqual(error.rules["lint-my-lines/rule-c"], "off");
    });

    it("should preserve options in array-style rules", function () {
      const { warn, error } = createSeverityVariants(mockPreset);

      assert.deepStrictEqual(warn.rules["lint-my-lines/rule-b"], [
        "warn",
        { option: true },
      ]);
      assert.deepStrictEqual(error.rules["lint-my-lines/rule-b"], [
        "error",
        { option: true },
      ]);
    });

    it("should generate appropriate names", function () {
      const { warn, error } = createSeverityVariants(mockPreset);

      assert(warn.name.includes("/warn"));
      assert(error.name.includes("/error"));
    });

    it("should preserve plugins in both variants", function () {
      const { warn, error } = createSeverityVariants(mockPreset);

      assert.strictEqual(warn.plugins, mockPreset.plugins);
      assert.strictEqual(error.plugins, mockPreset.plugins);
    });

    it("should throw for invalid preset", function () {
      assert.throws(
        () => createSeverityVariants(null),
        /preset must be an object/
      );
    });

    it("should handle preset with no rules", function () {
      const emptyPreset = { name: "empty", plugins: {} };
      const { warn, error } = createSeverityVariants(emptyPreset);

      assert.deepStrictEqual(warn.rules, {});
      assert.deepStrictEqual(error.rules, {});
    });

    it("should handle numeric severity values", function () {
      const numericPreset = {
        name: "numeric",
        plugins: {},
        rules: {
          "rule-a": 1, // warn
          "rule-b": 2, // error
          "rule-c": 0, // off
        },
      };

      const { warn, error } = createSeverityVariants(numericPreset);

      assert.strictEqual(warn.rules["rule-a"], "warn");
      assert.strictEqual(warn.rules["rule-b"], "warn");
      assert.strictEqual(warn.rules["rule-c"], 0); // off stays as-is

      assert.strictEqual(error.rules["rule-a"], "error");
      assert.strictEqual(error.rules["rule-b"], "error");
    });
  });

  // -------------------------------------------------------------------------
  // mergeConfigs
  // -------------------------------------------------------------------------

  describe("mergeConfigs", function () {
    it("should merge rules with later taking precedence", function () {
      const result = mergeConfigs(mockPreset, mockPreset2);

      // rule-a should be "error" from mockPreset2
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "error");
      // rule-b should be from mockPreset
      assert.deepStrictEqual(result.rules["lint-my-lines/rule-b"], [
        "warn",
        { option: true },
      ]);
      // rule-e should be from mockPreset2
      assert.strictEqual(result.rules["lint-my-lines/rule-e"], "warn");
    });

    it("should merge plugins from all configs", function () {
      const result = mergeConfigs(mockPreset, mockPreset2);

      assert(result.plugins["lint-my-lines"]);
      assert(result.plugins["other-plugin"]);
    });

    it("should take files from last config that has them", function () {
      const result = mergeConfigs(mockPreset, mockPreset2);

      assert.deepStrictEqual(result.files, ["**/*.ts"]);
    });

    it("should generate name from merged config names", function () {
      const result = mergeConfigs(mockPreset, mockPreset2);

      assert(result.name.includes("merged"));
    });

    it("should handle single config", function () {
      const result = mergeConfigs(mockPreset);

      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "warn");
    });

    it("should handle three or more configs", function () {
      const third = {
        name: "third",
        rules: { "lint-my-lines/rule-a": "off" },
      };

      const result = mergeConfigs(mockPreset, mockPreset2, third);

      // Last config wins
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "off");
    });

    it("should skip null/undefined configs gracefully", function () {
      const result = mergeConfigs(mockPreset, null, undefined, mockPreset2);

      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "error");
    });

    it("should merge languageOptions", function () {
      const configA = { languageOptions: { ecmaVersion: 2020 } };
      const configB = { languageOptions: { sourceType: "module" } };

      const result = mergeConfigs(configA, configB);

      assert.strictEqual(result.languageOptions.ecmaVersion, 2020);
      assert.strictEqual(result.languageOptions.sourceType, "module");
    });

    it("should take processor from last config that has it", function () {
      const configA = { processor: "a/.vue" };
      const configB = { processor: "b/.svelte" };

      const result = mergeConfigs(configA, configB);

      assert.strictEqual(result.processor, "b/.svelte");
    });

    it("should throw for no configs", function () {
      assert.throws(
        () => mergeConfigs(),
        /at least one config required/
      );
    });
  });

  // -------------------------------------------------------------------------
  // createFileTypePreset
  // -------------------------------------------------------------------------

  describe("createFileTypePreset", function () {
    it("should create preset with files and rules", function () {
      const result = createFileTypePreset({
        basePreset: mockPreset,
        files: ["**/*.ts"],
        rules: { "lint-my-lines/rule-a": "error" },
      });

      assert.deepStrictEqual(result.files, ["**/*.ts"]);
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "error");
      // Base rules should be preserved
      assert.deepStrictEqual(result.rules["lint-my-lines/rule-b"], [
        "warn",
        { option: true },
      ]);
    });

    it("should allow custom name", function () {
      const result = createFileTypePreset({
        basePreset: mockPreset,
        files: ["**/*.ts"],
        name: "my-typescript-config",
      });

      assert.strictEqual(result.name, "my-typescript-config");
    });

    it("should work without rule overrides", function () {
      const result = createFileTypePreset({
        basePreset: mockPreset,
        files: ["**/*.ts"],
      });

      assert.deepStrictEqual(result.files, ["**/*.ts"]);
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "warn");
    });

    it("should preserve base preset plugins", function () {
      const result = createFileTypePreset({
        basePreset: mockPreset,
        files: ["**/*.ts"],
      });

      assert.strictEqual(result.plugins, mockPreset.plugins);
    });

    it("should throw for invalid basePreset", function () {
      assert.throws(
        () =>
          createFileTypePreset({
            basePreset: null,
            files: ["**/*.ts"],
          }),
        /preset must be an object/
      );
    });

    it("should throw for missing files", function () {
      assert.throws(
        () =>
          createFileTypePreset({
            basePreset: mockPreset,
          }),
        /files must be a non-empty array/
      );
    });

    it("should throw for empty files array", function () {
      assert.throws(
        () =>
          createFileTypePreset({
            basePreset: mockPreset,
            files: [],
          }),
        /files must be a non-empty array/
      );
    });
  });

  // -------------------------------------------------------------------------
  // Integration Tests
  // -------------------------------------------------------------------------

  describe("integration", function () {
    it("should chain multiple helpers together", function () {
      // Create a warn variant, extend it, then apply to specific files
      const { warn } = createSeverityVariants(mockPreset);
      const extended = extendPreset(warn, {
        rules: { "lint-my-lines/new-rule": "warn" },
      });
      const result = createConfigForFiles(extended, "src/**/*.js");

      assert.deepStrictEqual(result.files, ["src/**/*.js"]);
      assert.strictEqual(result.rules["lint-my-lines/rule-a"], "warn");
      assert.strictEqual(result.rules["lint-my-lines/new-rule"], "warn");
    });

    it("should merge extended presets", function () {
      const preset1 = extendPreset(mockPreset, {
        rules: { custom1: "warn" },
      });
      const preset2 = extendPreset(mockPreset, {
        rules: { custom2: "error" },
      });

      const result = mergeConfigs(preset1, preset2);

      assert.strictEqual(result.rules["custom1"], "warn");
      assert.strictEqual(result.rules["custom2"], "error");
    });
  });
});
