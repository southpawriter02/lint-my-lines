/**
 * @fileoverview Performance benchmark suite for lint-my-lines.
 * @author Jules
 *
 * Run with: npm run bench
 */
"use strict";

const Benchmark = require("benchmark");
const { ESLint } = require("eslint");
const fs = require("fs");
const path = require("path");

const plugin = require("../../lib/index");

// Load test fixtures
const fixturesDir = path.join(__dirname, "../fixtures/perf");

const smallFile = fs.readFileSync(path.join(fixturesDir, "small.js"), "utf8");
const mediumFile = fs.readFileSync(path.join(fixturesDir, "medium.js"), "utf8");
const largeFile = fs.readFileSync(path.join(fixturesDir, "large.js"), "utf8");

// Create ESLint instances with different configurations
function createESLint(rules) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      plugins: { "lint-my-lines": plugin },
      rules
    }
  });
}

// Minimal rules (4 rules)
const eslintMinimal = createESLint({
  "lint-my-lines/enforce-todo-format": "warn",
  "lint-my-lines/enforce-fixme-format": "warn",
  "lint-my-lines/enforce-note-format": "warn",
  "lint-my-lines/no-commented-code": "warn"
});

// Recommended rules (8 rules)
const eslintRecommended = createESLint({
  "lint-my-lines/enforce-todo-format": "warn",
  "lint-my-lines/enforce-fixme-format": "warn",
  "lint-my-lines/enforce-note-format": "warn",
  "lint-my-lines/no-commented-code": "warn",
  "lint-my-lines/enforce-comment-length": "warn",
  "lint-my-lines/enforce-capitalization": "warn",
  "lint-my-lines/comment-spacing": "warn",
  "lint-my-lines/ban-specific-words": "warn"
});

// Strict rules (more rules)
const eslintStrict = createESLint({
  "lint-my-lines/enforce-todo-format": "warn",
  "lint-my-lines/enforce-fixme-format": "warn",
  "lint-my-lines/enforce-note-format": "warn",
  "lint-my-lines/no-commented-code": "warn",
  "lint-my-lines/enforce-comment-length": "warn",
  "lint-my-lines/enforce-capitalization": "warn",
  "lint-my-lines/comment-spacing": "warn",
  "lint-my-lines/ban-specific-words": "warn",
  "lint-my-lines/no-obvious-comments": "warn",
  "lint-my-lines/require-explanation-comments": "warn",
  "lint-my-lines/require-jsdoc": "warn",
  "lint-my-lines/valid-jsdoc": "warn"
});

const suite = new Benchmark.Suite("lint-my-lines performance");

console.log("Starting performance benchmarks...\n");
console.log("File sizes:");
console.log(`  Small:  ${smallFile.split("\n").length} lines`);
console.log(`  Medium: ${mediumFile.split("\n").length} lines`);
console.log(`  Large:  ${largeFile.split("\n").length} lines`);
console.log("");

suite
  // Small file tests
  .add("Small file (minimal rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintMinimal.lintText(smallFile);
      deferred.resolve();
    }
  })
  .add("Small file (recommended rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintRecommended.lintText(smallFile);
      deferred.resolve();
    }
  })
  .add("Small file (strict rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintStrict.lintText(smallFile);
      deferred.resolve();
    }
  })

  // Medium file tests
  .add("Medium file (minimal rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintMinimal.lintText(mediumFile);
      deferred.resolve();
    }
  })
  .add("Medium file (recommended rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintRecommended.lintText(mediumFile);
      deferred.resolve();
    }
  })
  .add("Medium file (strict rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintStrict.lintText(mediumFile);
      deferred.resolve();
    }
  })

  // Large file tests
  .add("Large file (minimal rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintMinimal.lintText(largeFile);
      deferred.resolve();
    }
  })
  .add("Large file (recommended rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintRecommended.lintText(largeFile);
      deferred.resolve();
    }
  })
  .add("Large file (strict rules)", {
    defer: true,
    fn: async function(deferred) {
      await eslintStrict.lintText(largeFile);
      deferred.resolve();
    }
  })

  // Event handlers
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("\nBenchmark complete!");

    // Save results to JSON for regression detection
    const results = this.map(function(bench) {
      return {
        name: bench.name,
        hz: bench.hz,
        mean: bench.stats.mean * 1000, // Convert to ms
        deviation: bench.stats.deviation * 1000,
        samples: bench.stats.sample.length
      };
    });

    const outputPath = path.join(__dirname, "baseline.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${outputPath}`);
  })
  .on("error", function(event) {
    console.error("Benchmark error:", event.target.error);
  })

  // Run the benchmarks
  .run({ async: true });
