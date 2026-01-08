/**
 * @fileoverview Check for performance regressions against baseline.
 * @author Jules
 *
 * Run with: npm run bench:check
 */
"use strict";

const fs = require("fs");
const path = require("path");

const THRESHOLD = 0.20; // 20% regression threshold

const baselinePath = path.join(__dirname, "baseline.json");
const currentPath = path.join(__dirname, "current.json");

// Check if baseline exists
if (!fs.existsSync(baselinePath)) {
  console.log("No baseline.json found. Run 'npm run bench' first to establish a baseline.");
  process.exit(0);
}

// Check if current results exist
if (!fs.existsSync(currentPath)) {
  console.log("No current.json found. Run benchmarks and save to current.json to compare.");
  console.log("Usage: npm run bench && mv tests/benchmarks/baseline.json tests/benchmarks/current.json");
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));

console.log("Performance Regression Check");
console.log("============================");
console.log(`Threshold: ${(THRESHOLD * 100).toFixed(0)}% slower\n`);

let failed = false;
let improvements = 0;
let regressions = 0;
let unchanged = 0;

for (const base of baseline) {
  const curr = current.find(c => c.name === base.name);

  if (!curr) {
    console.log(`SKIP: ${base.name} (not found in current results)`);
    continue;
  }

  const change = (curr.mean - base.mean) / base.mean;
  const changePercent = (change * 100).toFixed(1);
  const status = change > THRESHOLD ? "REGRESSION" :
                 change < -0.05 ? "IMPROVED" : "OK";

  const icon = status === "REGRESSION" ? "❌" :
               status === "IMPROVED" ? "✅" : "➖";

  console.log(`${icon} ${status}: ${base.name}`);
  console.log(`   Baseline: ${base.mean.toFixed(2)}ms`);
  console.log(`   Current:  ${curr.mean.toFixed(2)}ms`);
  console.log(`   Change:   ${change >= 0 ? "+" : ""}${changePercent}%`);
  console.log("");

  if (status === "REGRESSION") {
    regressions++;
    failed = true;
  } else if (status === "IMPROVED") {
    improvements++;
  } else {
    unchanged++;
  }
}

console.log("Summary");
console.log("-------");
console.log(`Regressions: ${regressions}`);
console.log(`Improvements: ${improvements}`);
console.log(`Unchanged: ${unchanged}`);

if (failed) {
  console.log("\n❌ Performance regression detected!");
  process.exit(1);
} else {
  console.log("\n✅ No performance regressions detected.");
  process.exit(0);
}
