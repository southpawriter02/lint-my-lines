/**
 * @fileoverview Configuration generator for lint-my-lines
 * @author Jules
 */
"use strict";

const fs = require("fs");
const path = require("path");

const PRESETS = ["minimal", "recommended", "strict"];

/**
 * Check for existing .lintmylinesrc configuration
 * @returns {object|null} Parsed config or null
 */
function loadProjectConfig() {
  const cwd = process.cwd();
  const configFiles = [
    ".lintmylinesrc",
    ".lintmylinesrc.json",
  ];

  for (const file of configFiles) {
    const filePath = path.join(cwd, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        return JSON.parse(content);
      } catch {
        console.warn(`Warning: Could not parse ${file}`);
      }
    }
  }

  // Check package.json
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg.lintmylines) {
        return pkg.lintmylines;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

/**
 * Generate legacy .eslintrc.json content
 * @param {string} preset - Preset name
 * @param {object} overrides - Rule overrides
 * @returns {string} JSON content
 */
function generateLegacyConfig(preset, overrides = {}) {
  const config = {
    extends: [`plugin:lint-my-lines/${preset}`],
  };

  if (Object.keys(overrides).length > 0) {
    config.rules = overrides;
  }

  return JSON.stringify(config, null, 2);
}

/**
 * Generate flat config eslint.config.js content
 * @param {string} preset - Preset name
 * @param {object} overrides - Rule overrides
 * @returns {string} JavaScript content
 */
function generateFlatConfig(preset, overrides = {}) {
  const hasOverrides = Object.keys(overrides).length > 0;

  let content = `import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/${preset}"],`;

  if (hasOverrides) {
    content += `
  {
    rules: ${JSON.stringify(overrides, null, 6).replace(/\n/g, "\n    ").trim()},
  },`;
  }

  content += `
];
`;

  return content;
}

/**
 * Generate CommonJS flat config eslint.config.cjs content
 * @param {string} preset - Preset name
 * @param {object} overrides - Rule overrides
 * @returns {string} JavaScript content
 */
function generateFlatConfigCJS(preset, overrides = {}) {
  const hasOverrides = Object.keys(overrides).length > 0;

  let content = `const lintMyLines = require("eslint-plugin-lint-my-lines");

module.exports = [
  lintMyLines.configs["flat/${preset}"],`;

  if (hasOverrides) {
    content += `
  {
    rules: ${JSON.stringify(overrides, null, 6).replace(/\n/g, "\n    ").trim()},
  },`;
  }

  content += `
];
`;

  return content;
}

/**
 * Detect if project uses ESM or CommonJS
 * @returns {boolean} True if ESM
 */
function isESM() {
  const pkgPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return pkg.type === "module";
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check if an ESLint config already exists
 * @returns {string|null} Name of existing config file or null
 */
function findExistingConfig() {
  const cwd = process.cwd();
  const configFiles = [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    ".eslintrc",
  ];

  for (const file of configFiles) {
    if (fs.existsSync(path.join(cwd, file))) {
      return file;
    }
  }

  return null;
}

/**
 * Main init command handler
 * @param {object} options - CLI options
 */
function init(options) {
  const { preset = "recommended", flat = true } = options;

  // Validate preset
  if (!PRESETS.includes(preset)) {
    console.error(`Error: Invalid preset "${preset}". Choose from: ${PRESETS.join(", ")}`);
    process.exit(1);
  }

  // Load project config for overrides
  const projectConfig = loadProjectConfig();
  const overrides = projectConfig?.overrides || {};

  // Check for existing config
  const existingConfig = findExistingConfig();
  if (existingConfig) {
    console.log(`\nExisting ESLint config found: ${existingConfig}`);
    console.log("Add the following to your existing configuration:\n");

    if (flat || existingConfig.startsWith("eslint.config")) {
      console.log("// Add to your eslint.config.js");
      console.log(`import lintMyLines from "eslint-plugin-lint-my-lines";`);
      console.log("");
      console.log("// In your config array:");
      console.log(`lintMyLines.configs["flat/${preset}"],`);
    } else {
      console.log("// Add to your .eslintrc extends array:");
      console.log(`"plugin:lint-my-lines/${preset}"`);
    }

    console.log("\nTo generate a new config file instead, remove the existing one first.");
    return;
  }

  // Generate new config
  let filename;
  let content;

  if (flat) {
    if (isESM()) {
      filename = "eslint.config.js";
      content = generateFlatConfig(preset, overrides);
    } else {
      filename = "eslint.config.cjs";
      content = generateFlatConfigCJS(preset, overrides);
    }
  } else {
    filename = ".eslintrc.json";
    content = generateLegacyConfig(preset, overrides);
  }

  // Write config file
  const outputPath = path.join(process.cwd(), filename);
  fs.writeFileSync(outputPath, content, "utf8");

  console.log(`\n Created ${filename} with ${preset} preset\n`);
  console.log("Next steps:");
  console.log("  1. Install ESLint if not already installed:");
  console.log("     npm install eslint --save-dev\n");
  console.log("  2. Run ESLint to check your comments:");
  console.log("     npx eslint .\n");
  console.log("  3. (Optional) Add a lint script to package.json:");
  console.log('     "scripts": { "lint": "eslint ." }\n');

  if (flat) {
    console.log("Note: Flat config requires ESLint v9 or later.");
    console.log("For ESLint v8, run: npx lint-my-lines init --no-flat\n");
  }
}

module.exports = { init, loadProjectConfig, generateLegacyConfig, generateFlatConfig, generateFlatConfigCJS };
