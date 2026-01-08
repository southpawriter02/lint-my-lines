/**
 * @fileoverview ESLint v9 compatibility tests
 * @author lint-my-lines
 *
 * These tests verify that the plugin works correctly with ESLint v9.
 * They are run as part of the CI matrix with ESLint v9 installed.
 *
 * The tests cover:
 * - Version detection utilities
 * - Flat config preset structure
 * - ESLint instance creation
 * - Linting with flat configs
 * - Processor support
 * - Cache integration
 *
 * To run these tests:
 * ```
 * npm run test:eslint-compat
 * ```
 *
 * Or with specific ESLint version:
 * ```
 * npm install eslint@9 --save-dev
 * npm run test:eslint-compat
 * ```
 */
"use strict";

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

const assert = require("assert");
const { ESLint } = require("eslint");

// Import the plugin
const plugin = require("../../lib/index");

// Import utilities (these should exist after Phase 1-4)
const {
  isESLintV9,
  isESLintV8,
  getESLintVersion,
  getESLintMajorVersion,
  createESLintInstance,
  _clearVersionCache,
} = require("../../lib/utils/eslint-compat");

const {
  getCacheConfig,
  getCacheStats,
  generateCacheKey,
} = require("../../lib/utils/cache-integration");

const {
  getFlatConfigs,
  getCacheStats: getConfigCacheStats,
  _clearConfigCache,
} = require("../../lib/configs/flat-config-factory");

const { createLogger, isEnabled } = require("../../lib/utils/debug");

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe("ESLint v9 Compatibility", function () {
  // Allow extra time for ESLint operations
  this.timeout(15000);

  // ---------------------------------------------------------------------------
  // Setup and Teardown
  // ---------------------------------------------------------------------------

  beforeEach(function () {
    // Clear caches before each test for isolation
    _clearVersionCache();
    _clearConfigCache();
  });

  afterEach(function () {
    // Clean up after each test
    _clearVersionCache();
    _clearConfigCache();
  });

  // ---------------------------------------------------------------------------
  // Version Detection Tests
  // ---------------------------------------------------------------------------

  describe("Version Detection", function () {
    it("should detect ESLint version correctly", function () {
      const version = getESLintVersion();

      // Version should be a string
      assert.strictEqual(typeof version, "string", "Version should be a string");

      // Version should match semver format (x.y.z)
      assert.match(
        version,
        /^\d+\.\d+\.\d+/,
        `Version "${version}" should match semver format`
      );
    });

    it("should return major version as number", function () {
      const major = getESLintMajorVersion();

      // Major version should be a number
      assert.strictEqual(typeof major, "number", "Major version should be a number");

      // Major version should be at least 8 (minimum supported)
      assert(major >= 8, `Major version ${major} should be at least 8`);
    });

    it("should correctly identify ESLint v9", function () {
      const version = getESLintVersion();
      const major = parseInt(version.split(".")[0], 10);

      if (major >= 9) {
        assert.strictEqual(isESLintV9(), true, "Should detect v9+");
        assert.strictEqual(isESLintV8(), false, "Should not be v8");
      } else if (major === 8) {
        assert.strictEqual(isESLintV9(), false, "Should not detect v9 for v8");
        assert.strictEqual(isESLintV8(), true, "Should detect v8");
      }
    });

    it("should cache version after first call", function () {
      const version1 = getESLintVersion();
      const version2 = getESLintVersion();

      assert.strictEqual(
        version1,
        version2,
        "Cached version should match first call"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Flat Config Preset Tests
  // ---------------------------------------------------------------------------

  describe("Flat Config Presets", function () {
    // List of all expected flat config presets
    const presets = [
      "flat/minimal",
      "flat/recommended",
      "flat/strict",
      "flat/analysis",
      "flat/typescript",
      "flat/typescript-strict",
      "flat/react",
      "flat/vue",
      "flat/svelte",
      "flat/markdown",
    ];

    for (const preset of presets) {
      it(`should have valid ${preset} config`, function () {
        const config = plugin.configs[preset];

        // Config should exist
        assert(config, `Config ${preset} should exist`);

        // Config should have name (required for v9 inspector)
        assert(config.name, `Config ${preset} should have name property`);
        assert(
          config.name.startsWith("lint-my-lines/"),
          `Config name should start with "lint-my-lines/"`
        );

        // Config should have plugins object
        assert(config.plugins, `Config ${preset} should have plugins property`);
        assert(
          config.plugins["lint-my-lines"],
          `Config should include lint-my-lines plugin`
        );

        // Config should have rules object
        assert(config.rules, `Config ${preset} should have rules property`);
        assert(
          typeof config.rules === "object",
          `Rules should be an object`
        );

        // Rules should have lint-my-lines prefix
        const ruleNames = Object.keys(config.rules);
        assert(
          ruleNames.length > 0,
          `Config ${preset} should have at least one rule`
        );
        for (const ruleName of ruleNames) {
          assert(
            ruleName.startsWith("lint-my-lines/"),
            `Rule "${ruleName}" should have lint-my-lines prefix`
          );
        }
      });
    }

    it("should have language-specific presets with file patterns", function () {
      const languagePresets = [
        { name: "flat/typescript", extensions: [".ts", ".tsx"] },
        { name: "flat/react", extensions: [".jsx", ".tsx"] },
        { name: "flat/vue", extensions: [".vue"] },
        { name: "flat/svelte", extensions: [".svelte"] },
        { name: "flat/markdown", extensions: [".md"] },
      ];

      for (const { name, extensions } of languagePresets) {
        const config = plugin.configs[name];
        assert(config.files, `${name} should have files property`);
        assert(Array.isArray(config.files), `files should be an array`);

        // Check that at least one expected extension is in the patterns
        const hasExpectedExtension = config.files.some((pattern) =>
          extensions.some((ext) => pattern.includes(ext))
        );
        assert(
          hasExpectedExtension,
          `${name} files should include patterns for ${extensions.join(", ")}`
        );
      }
    });

    it("should have processor presets with processor property", function () {
      const processorPresets = ["flat/vue", "flat/svelte", "flat/markdown"];

      for (const presetName of processorPresets) {
        const config = plugin.configs[presetName];
        assert(
          config.processor,
          `${presetName} should have processor property`
        );
        assert(
          config.processor.startsWith("lint-my-lines/"),
          `Processor should have lint-my-lines prefix`
        );
      }
    });

    it("should freeze config objects to prevent mutation", function () {
      const config = plugin.configs["flat/recommended"];

      // Attempt to modify should throw in strict mode or silently fail
      assert.throws(
        () => {
          "use strict";
          config.name = "modified";
        },
        /Cannot assign|read only/i,
        "Config should be frozen"
      );

      // Verify original value unchanged
      assert(
        config.name.startsWith("lint-my-lines/"),
        "Config name should be unchanged"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Config Factory Tests
  // ---------------------------------------------------------------------------

  describe("Config Factory", function () {
    it("should cache configs after first creation", function () {
      // Clear any existing cache
      _clearConfigCache();

      // First call should create configs
      const configs1 = getFlatConfigs(plugin);
      const stats1 = getConfigCacheStats();

      // Should have configs cached
      assert(stats1.size > 0, "Should have cached configs");
      assert(stats1.initialized, "Should be initialized");

      // Second call should return cached
      const configs2 = getFlatConfigs(plugin);
      const stats2 = getConfigCacheStats();

      // Same number of cached configs
      assert.strictEqual(
        stats1.size,
        stats2.size,
        "Cache size should be stable"
      );

      // Same config references
      assert.strictEqual(
        configs1["flat/recommended"],
        configs2["flat/recommended"],
        "Should return same config instance"
      );
    });

    it("should include all expected presets", function () {
      const configs = getFlatConfigs(plugin);
      const expectedPresets = [
        "flat/minimal",
        "flat/recommended",
        "flat/strict",
        "flat/analysis",
        "flat/typescript",
        "flat/typescript-strict",
        "flat/react",
        "flat/vue",
        "flat/svelte",
        "flat/markdown",
      ];

      for (const preset of expectedPresets) {
        assert(
          configs[preset],
          `Factory should produce ${preset} config`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // ESLint Instance Creation Tests
  // ---------------------------------------------------------------------------

  describe("ESLint Instance Creation", function () {
    it("should create ESLint instance with version-appropriate options", function () {
      const eslint = createESLintInstance({
        fix: false,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          rules: {
            "lint-my-lines/enforce-todo-format": "error",
          },
        },
      });

      // Should be an ESLint instance
      assert(eslint instanceof ESLint, "Should return ESLint instance");
    });

    it("should create instance with fix option", function () {
      const eslint = createESLintInstance({
        fix: true,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          rules: {
            "lint-my-lines/enforce-todo-format": "error",
          },
        },
      });

      assert(eslint instanceof ESLint, "Should return ESLint instance");
    });

    it("should lint code correctly", async function () {
      const eslint = createESLintInstance({
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error",
          },
        },
      });

      // Lint code with a bare TODO
      const results = await eslint.lintText("// TODO: Fix this\n");

      // Should have one result
      assert.strictEqual(results.length, 1, "Should have one result");

      // Should have one message (the TODO format error)
      assert.strictEqual(
        results[0].messages.length,
        1,
        "Should have one message"
      );

      // Should be from the enforce-todo-format rule
      assert.strictEqual(
        results[0].messages[0].ruleId,
        "lint-my-lines/enforce-todo-format",
        "Should be from enforce-todo-format rule"
      );
    });

    it("should apply autofix correctly", async function () {
      const eslint = createESLintInstance({
        fix: true,
        plugins: { "lint-my-lines": plugin },
        overrideConfig: {
          plugins: ["lint-my-lines"],
          rules: {
            "lint-my-lines/enforce-todo-format": "error",
          },
        },
      });

      // Lint code with a bare TODO
      const results = await eslint.lintText("// TODO: Fix this\n");

      // Should have fixed output
      assert(results[0].output, "Should have fixed output");

      // Fixed output should include ticket placeholder
      assert(
        results[0].output.includes("TODO (TICKET-"),
        "Should add ticket placeholder"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Flat Config Usage Tests
  // ---------------------------------------------------------------------------

  describe("Flat Config Usage", function () {
    // These tests use ESLint v9's flat config API directly
    // In ESLint v8, overrideConfigFile: true is not supported, so we skip these tests
    const skipV8 = !isESLintV9();

    it("should work with flat/recommended config", async function () {
      if (skipV8) {
        this.skip(); // Skip for ESLint v8
        return;
      }

      // Create ESLint with flat config (ESLint v9 only)
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [plugin.configs["flat/recommended"]],
      });

      // Lint code with issues
      const results = await eslint.lintText("// todo: lowercase\n");

      // Should have messages (capitalization, TODO format, etc.)
      assert(
        results[0].messages.length > 0,
        "Should have messages from recommended preset"
      );
    });

    it("should work with multiple flat configs", async function () {
      if (skipV8) {
        this.skip(); // Skip for ESLint v8
        return;
      }

      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          plugin.configs["flat/recommended"],
          {
            rules: {
              "lint-my-lines/enforce-todo-format": "off",
            },
          },
        ],
      });

      // Lint code with TODO
      const results = await eslint.lintText("// TODO: without ref\n");

      // enforce-todo-format should be disabled
      const todoError = results[0].messages.find(
        (m) => m.ruleId === "lint-my-lines/enforce-todo-format"
      );
      assert(
        !todoError,
        "TODO format rule should be disabled by override"
      );
    });

    it("should handle files with no issues", async function () {
      if (skipV8) {
        this.skip(); // Skip for ESLint v8
        return;
      }

      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [plugin.configs["flat/minimal"]],
      });

      // Lint clean code
      const results = await eslint.lintText(
        "// This is a clean comment\nfunction hello() { return 'world'; }\n"
      );

      // Should have no error messages
      const errors = results[0].messages.filter((m) => m.severity === 2);
      assert.strictEqual(
        errors.length,
        0,
        "Should have no errors for clean code"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Processor Support Tests
  // ---------------------------------------------------------------------------

  describe("Processor Support", function () {
    it("should export Vue processor", function () {
      assert(plugin.processors, "Plugin should have processors");
      assert(plugin.processors[".vue"], "Should have Vue processor");
      assert(
        typeof plugin.processors[".vue"].preprocess === "function",
        "Vue processor should have preprocess"
      );
      assert(
        typeof plugin.processors[".vue"].postprocess === "function",
        "Vue processor should have postprocess"
      );
    });

    it("should export Svelte processor", function () {
      assert(plugin.processors[".svelte"], "Should have Svelte processor");
      assert(
        typeof plugin.processors[".svelte"].preprocess === "function",
        "Svelte processor should have preprocess"
      );
      assert(
        typeof plugin.processors[".svelte"].postprocess === "function",
        "Svelte processor should have postprocess"
      );
    });

    it("should export Markdown processor", function () {
      assert(plugin.processors[".md"], "Should have Markdown processor");
      assert(
        typeof plugin.processors[".md"].preprocess === "function",
        "Markdown processor should have preprocess"
      );
      assert(
        typeof plugin.processors[".md"].postprocess === "function",
        "Markdown processor should have postprocess"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Cache Integration Tests
  // ---------------------------------------------------------------------------

  describe("Cache Integration", function () {
    it("should support cache options", function () {
      const config = getCacheConfig({ enabled: true });

      assert.strictEqual(config.cache, true, "Cache should be enabled");
      assert(config.cacheLocation, "Should have cache location");
    });

    it("should return disabled config when enabled=false", function () {
      const config = getCacheConfig({ enabled: false });

      assert.strictEqual(config.cache, false, "Cache should be disabled");
      assert(
        !config.cacheLocation,
        "Should not have cache location when disabled"
      );
    });

    it("should generate cache keys", function () {
      const key1 = generateCacheKey({ preset: "recommended" });
      const key2 = generateCacheKey({ preset: "strict" });
      const key3 = generateCacheKey({ preset: "recommended" });

      // Keys should be strings
      assert.strictEqual(typeof key1, "string", "Key should be a string");

      // Keys should be reasonable length (MD5 substring)
      assert(key1.length >= 8 && key1.length <= 16, "Key should be 8-16 chars");

      // Different presets should have different keys
      assert.notStrictEqual(
        key1,
        key2,
        "Different presets should have different keys"
      );

      // Same preset should have same key
      assert.strictEqual(
        key1,
        key3,
        "Same preset should have same key"
      );
    });

    it("should get cache stats", function () {
      const stats = getCacheStats();

      // Stats should have expected properties
      assert(
        "exists" in stats,
        "Stats should have exists property"
      );
      assert.strictEqual(
        typeof stats.exists,
        "boolean",
        "exists should be boolean"
      );
    });

    it("should have v9 cache strategy when on v9", function () {
      if (isESLintV9()) {
        const config = getCacheConfig({ enabled: true });
        assert(
          config.cacheStrategy,
          "Should have cache strategy on v9"
        );
        assert(
          ["metadata", "content"].includes(config.cacheStrategy),
          "Strategy should be metadata or content"
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Debug Logging Tests
  // ---------------------------------------------------------------------------

  describe("Debug Logging", function () {
    it("should create logger for category", function () {
      const log = createLogger("test");

      assert(typeof log.debug === "function", "Logger should have debug");
      assert(typeof log.info === "function", "Logger should have info");
      assert(typeof log.warn === "function", "Logger should have warn");
      assert(typeof log.error === "function", "Logger should have error");
    });

    it("should check if category is enabled", function () {
      // Without DEBUG_LINT_MY_LINES, categories should not be enabled
      // (unless running with debug env var set)
      const result = isEnabled("test");
      assert.strictEqual(
        typeof result,
        "boolean",
        "isEnabled should return boolean"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Plugin Meta Tests
  // ---------------------------------------------------------------------------

  describe("Plugin Meta", function () {
    it("should have meta information", function () {
      assert(plugin.meta, "Plugin should have meta");
      assert(plugin.meta.name, "Meta should have name");
      assert(plugin.meta.version, "Meta should have version");

      // Version should match semver
      assert.match(
        plugin.meta.version,
        /^\d+\.\d+\.\d+/,
        "Version should be semver"
      );
    });

    it("should export rules", function () {
      assert(plugin.rules, "Plugin should export rules");
      assert(
        typeof plugin.rules === "object",
        "Rules should be an object"
      );

      // Should have expected rules
      const expectedRules = [
        "enforce-todo-format",
        "enforce-fixme-format",
        "no-commented-code",
        "enforce-capitalization",
        "comment-spacing",
      ];

      for (const ruleName of expectedRules) {
        assert(
          plugin.rules[ruleName],
          `Should have ${ruleName} rule`
        );
        assert(
          plugin.rules[ruleName].meta,
          `Rule ${ruleName} should have meta`
        );
        assert(
          plugin.rules[ruleName].create,
          `Rule ${ruleName} should have create`
        );
      }
    });

    it("should export configs", function () {
      assert(plugin.configs, "Plugin should export configs");

      // Should have both flat and legacy configs
      assert(
        plugin.configs["flat/recommended"],
        "Should have flat/recommended"
      );
      assert(
        plugin.configs["recommended"],
        "Should have legacy recommended"
      );
    });

    it("should export clearCaches function", function () {
      assert(
        typeof plugin.clearCaches === "function",
        "Plugin should export clearCaches function"
      );

      // Should not throw when called
      assert.doesNotThrow(() => {
        plugin.clearCaches();
      }, "clearCaches should not throw");
    });
  });
});
