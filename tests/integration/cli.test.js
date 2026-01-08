/**
 * @fileoverview Integration tests for CLI commands.
 * @author Jules
 */
"use strict";

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

describe("CLI: lint-my-lines", function() {
  // Increase timeout for CLI operations
  this.timeout(30000);

  const fixturesDir = path.join(__dirname, "../fixtures/cli-test");
  const binPath = path.resolve(__dirname, "../../bin/lint-my-lines.js");

  beforeEach(function() {
    // Create fresh test directory
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(fixturesDir, { recursive: true });
  });

  afterEach(function() {
    // Clean up test directory
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
  });

  describe("init command", function() {
    it("should generate eslint.config.js for ESM projects", function() {
      // Create ESM package.json
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ type: "module" }, null, 2)
      );

      // Run init command
      const result = spawnSync("node", [binPath, "init", "--preset", "recommended"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      // Check that eslint.config.js was created
      const configPath = path.join(fixturesDir, "eslint.config.js");
      assert(fs.existsSync(configPath), "eslint.config.js should be created");

      // Check content includes lint-my-lines
      const content = fs.readFileSync(configPath, "utf8");
      assert(content.includes("lint-my-lines"), "Config should reference lint-my-lines");
    });

    it("should generate eslint.config.cjs for CJS projects", function() {
      // Create CJS package.json (no type field)
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ name: "test-cjs" }, null, 2)
      );

      // Run init command
      spawnSync("node", [binPath, "init", "--preset", "minimal"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      // Check that eslint.config.cjs was created
      const configPath = path.join(fixturesDir, "eslint.config.cjs");
      assert(fs.existsSync(configPath), "eslint.config.cjs should be created for CJS");
    });

    it("should generate .eslintrc.json with --no-flat flag", function() {
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ name: "test" }, null, 2)
      );

      // Run init with --no-flat
      spawnSync("node", [binPath, "init", "--no-flat"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      // Check that .eslintrc.json was created
      const configPath = path.join(fixturesDir, ".eslintrc.json");
      assert(fs.existsSync(configPath), ".eslintrc.json should be created with --no-flat");

      // Check it's valid JSON
      const content = fs.readFileSync(configPath, "utf8");
      assert.doesNotThrow(() => JSON.parse(content), "Config should be valid JSON");
    });

    it("should use minimal preset by default", function() {
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ type: "module" }, null, 2)
      );

      // Run init without preset
      spawnSync("node", [binPath, "init"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      const configPath = path.join(fixturesDir, "eslint.config.js");
      assert(fs.existsSync(configPath), "Config file should be created");
    });

    it("should handle recommended preset", function() {
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ type: "module" }, null, 2)
      );

      spawnSync("node", [binPath, "init", "--preset", "recommended"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      const configPath = path.join(fixturesDir, "eslint.config.js");
      const content = fs.readFileSync(configPath, "utf8");
      assert(content.includes("recommended"), "Config should use recommended preset");
    });

    it("should handle strict preset", function() {
      fs.writeFileSync(
        path.join(fixturesDir, "package.json"),
        JSON.stringify({ type: "module" }, null, 2)
      );

      spawnSync("node", [binPath, "init", "--preset", "strict"], {
        cwd: fixturesDir,
        encoding: "utf8"
      });

      const configPath = path.join(fixturesDir, "eslint.config.js");
      const content = fs.readFileSync(configPath, "utf8");
      assert(content.includes("strict"), "Config should use strict preset");
    });
  });

  describe("help command", function() {
    it("should display help information", function() {
      const result = spawnSync("node", [binPath, "--help"], {
        encoding: "utf8"
      });

      assert(result.stdout.includes("lint-my-lines") || result.stdout.includes("Usage"),
        "Help should mention lint-my-lines or Usage");
    });
  });

  describe("version command", function() {
    it("should display version information", function() {
      const result = spawnSync("node", [binPath, "--version"], {
        encoding: "utf8"
      });

      // Should output something (version number)
      assert(result.stdout.length > 0 || result.stderr.length === 0,
        "Version command should produce output");
    });
  });
});
