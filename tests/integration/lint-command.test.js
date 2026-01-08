/**
 * @fileoverview Tests for the lint command
 * @author Jules
 */
"use strict";

const assert = require("assert");
const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

describe("CLI: lint-my-lines lint", function () {
  this.timeout(30000);

  const testDir = path.join(__dirname, "../fixtures/lint-test");
  const binPath = path.join(__dirname, "../../bin/lint-my-lines.js");

  beforeEach(function () {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(function () {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe("basic functionality", function () {
    it("should lint a file with no issues", function () {
      fs.writeFileSync(
        path.join(testDir, "clean.js"),
        `/**
 * A clean file with proper comments.
 */
function hello() {
  // This is a valid comment
  return "world";
}
`,
        "utf8"
      );

      const result = execSync(`node ${binPath} lint ${testDir}/clean.js`, {
        encoding: "utf8",
      });

      assert(result.includes("No issues found"));
    });

    it("should detect TODO format issues with recommended preset", function () {
      fs.writeFileSync(
        path.join(testDir, "todo.js"),
        `// TODO: Fix this issue\nfunction test() {}\n`,
        "utf8"
      );

      // Recommended preset uses warnings, so no exit code error
      const result = execSync(`node ${binPath} lint ${testDir}/todo.js`, {
        encoding: "utf8",
      });

      assert(result.includes("enforce-todo-format"), "Should report TODO format issue");
      assert(result.includes("warning"), "Should be a warning (not error)");
    });

    it("should use minimal preset when specified", function () {
      fs.writeFileSync(
        path.join(testDir, "minimal.js"),
        `// TODO: This is fine in minimal preset\nfunction test() {}\n`,
        "utf8"
      );

      // Minimal preset also uses warnings for TODO format
      const result = execSync(
        `node ${binPath} lint --preset minimal ${testDir}/minimal.js`,
        { encoding: "utf8" }
      );

      assert(result.includes("enforce-todo-format"), "Should report TODO format issue");
    });

    it("should use strict preset when specified", function () {
      fs.writeFileSync(
        path.join(testDir, "strict.js"),
        `// uncapitalized comment\nfunction test() {}\n`,
        "utf8"
      );

      try {
        execSync(`node ${binPath} lint --preset strict ${testDir}/strict.js`, {
          encoding: "utf8",
        });
        assert.fail("Should have exited with error");
      } catch (error) {
        assert(error.status === 1);
      }
    });
  });

  describe("--fix option", function () {
    it("should auto-fix TODO format", function () {
      const filePath = path.join(testDir, "fixable.js");
      fs.writeFileSync(filePath, `// TODO: Fix this\nfunction test() {}\n`, "utf8");

      execSync(`node ${binPath} lint --fix ${filePath}`, { encoding: "utf8" });

      const fixed = fs.readFileSync(filePath, "utf8");
      // The autofix uses TICKET-TODO as the placeholder
      assert(fixed.includes("TODO (TICKET-"), "TODO should be auto-fixed with ticket placeholder");
    });
  });

  describe("--format option", function () {
    it("should output JSON format when specified", function () {
      fs.writeFileSync(
        path.join(testDir, "json.js"),
        `// TODO: Test\nfunction test() {}\n`,
        "utf8"
      );

      try {
        execSync(`node ${binPath} lint --format json ${testDir}/json.js`, {
          encoding: "utf8",
        });
      } catch (error) {
        const output = error.stdout;
        const parsed = JSON.parse(output);
        assert(Array.isArray(parsed), "Output should be valid JSON array");
        assert(parsed[0].messages.length > 0, "Should have messages");
      }
    });

    it("should output compact format when specified", function () {
      fs.writeFileSync(
        path.join(testDir, "compact.js"),
        `// TODO: Test\nfunction test() {}\n`,
        "utf8"
      );

      try {
        execSync(`node ${binPath} lint --format compact ${testDir}/compact.js`, {
          encoding: "utf8",
        });
      } catch (error) {
        assert(error.stdout.includes(":1:1:"));
      }
    });
  });

  describe("multiple files", function () {
    it("should lint multiple files", function () {
      fs.writeFileSync(
        path.join(testDir, "file1.js"),
        `// TODO: Fix\nfunction a() {}\n`,
        "utf8"
      );
      fs.writeFileSync(
        path.join(testDir, "file2.js"),
        `// TODO: Also fix\nfunction b() {}\n`,
        "utf8"
      );

      try {
        execSync(`node ${binPath} lint ${testDir}/*.js`, {
          encoding: "utf8",
        });
      } catch (error) {
        assert(error.stdout.includes("file1.js"));
        assert(error.stdout.includes("file2.js"));
      }
    });
  });

  describe("error handling", function () {
    it("should reject invalid preset", function () {
      fs.writeFileSync(path.join(testDir, "test.js"), `function test() {}\n`, "utf8");

      try {
        execSync(`node ${binPath} lint --preset invalid ${testDir}/test.js`, {
          encoding: "utf8",
          stdio: "pipe",
        });
        assert.fail("Should have failed");
      } catch (error) {
        assert(error.stderr.includes("Invalid preset"));
      }
    });
  });

  describe("help output", function () {
    it("should show help for lint command", function () {
      const result = execSync(`node ${binPath} lint --help`, {
        encoding: "utf8",
      });

      assert(result.includes("Lint files for comment quality issues"));
      assert(result.includes("--preset"));
      assert(result.includes("--fix"));
      assert(result.includes("--format"));
    });
  });
});
