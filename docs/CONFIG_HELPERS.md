# Configuration Helpers

This guide covers the utility functions for creating flexible ESLint configurations with `eslint-plugin-lint-my-lines`.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Helpers Reference](#helpers-reference)
  - [createConfigForFiles](#createconfigforfilespreset-patterns)
  - [createConfigWithExclude](#createconfigwithexcludepreset-patterns)
  - [extendPreset](#extendpresetpreset-overrides)
  - [createSeverityVariants](#createseverityvariantspreset)
  - [mergeConfigs](#mergeconfigsconfigs)
  - [createFileTypePreset](#createfiletypepresetoptions)
- [Common Patterns](#common-patterns)
- [TypeScript Support](#typescript-support)

## Installation

The helpers are included with the main package:

```bash
npm install eslint-plugin-lint-my-lines
```

## Quick Start

There are two ways to import the helpers:

### Option 1: Subpath Import (Recommended)

```javascript
// ESM
import {
  createConfigForFiles,
  createConfigWithExclude,
  extendPreset,
  createSeverityVariants,
  mergeConfigs
} from "eslint-plugin-lint-my-lines/helpers";

// CommonJS
const {
  createConfigForFiles,
  createConfigWithExclude
} = require("eslint-plugin-lint-my-lines/helpers");
```

### Option 2: Main Package Import

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

// Helpers are available on the main export
const config = lintMyLines.createConfigForFiles(
  lintMyLines.configs["flat/recommended"],
  "src/**/*.js"
);
```

## Helpers Reference

### createConfigForFiles(preset, patterns)

Apply a preset only to files matching specific patterns.

**Parameters:**
- `preset` - Base preset config from `plugin.configs`
- `patterns` - Glob pattern(s) for files to include (string or array)

**Returns:** New config object with `files` property

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createConfigForFiles } from "eslint-plugin-lint-my-lines/helpers";

export default [
  // Strict rules for source code only
  createConfigForFiles(
    lintMyLines.configs["flat/strict"],
    ["src/**/*.js", "lib/**/*.js"]
  ),

  // Minimal rules for config files
  createConfigForFiles(
    lintMyLines.configs["flat/minimal"],
    ["*.config.js", "*.config.mjs"]
  ),
];
```

---

### createConfigWithExclude(preset, patterns)

Create a config that excludes specific files from a preset.

**Parameters:**
- `preset` - Base preset config
- `patterns` - Glob pattern(s) for files to exclude (string or array)

**Returns:** Config object with `ignores` property

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createConfigWithExclude } from "eslint-plugin-lint-my-lines/helpers";

export default [
  // Recommended for all except tests and generated code
  createConfigWithExclude(
    lintMyLines.configs["flat/recommended"],
    ["**/*.test.js", "**/*.spec.js", "dist/**", "coverage/**"]
  ),
];
```

---

### extendPreset(preset, overrides)

Extend a preset with custom rule overrides. This is the primary way to customize presets.

**Parameters:**
- `preset` - Base preset config
- `overrides` - Object with:
  - `rules` - Rule settings to override
  - `name` - Optional custom config name
  - `files` - Optional file patterns
  - `ignores` - Optional ignore patterns

**Returns:** Extended config object

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { extendPreset } from "eslint-plugin-lint-my-lines/helpers";

export default [
  extendPreset(lintMyLines.configs["flat/recommended"], {
    name: "my-company-standards",
    rules: {
      // Stricter comment length
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
      // Disable JSDoc requirement
      "lint-my-lines/require-jsdoc": "off",
      // Custom banned words
      "lint-my-lines/ban-specific-words": ["error", {
        includeDefaults: true,
        bannedWords: [{ word: "fixme", replacement: "TODO" }]
      }],
    },
  }),
];
```

---

### createSeverityVariants(preset)

Generate warn and error severity variants of a preset. Useful for different environments.

**Parameters:**
- `preset` - Base preset config

**Returns:** Object with `warn` and `error` variants

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createSeverityVariants } from "eslint-plugin-lint-my-lines/helpers";

const { warn, error } = createSeverityVariants(
  lintMyLines.configs["flat/recommended"]
);

export default [
  // Use warnings in development, errors in CI
  process.env.CI ? error : warn,
];
```

**How it works:**
- Rules set to `"off"` remain unchanged
- Rules like `"warn"` become `"error"` (or vice versa)
- Rules with options like `["warn", { maxLength: 100 }]` become `["error", { maxLength: 100 }]`

---

### mergeConfigs(...configs)

Merge multiple configs with proper precedence. Later configs override earlier ones.

**Parameters:**
- `...configs` - Config objects to merge

**Returns:** Merged config object

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { mergeConfigs } from "eslint-plugin-lint-my-lines/helpers";

// Create a custom preset combining recommended + analysis
const myPreset = mergeConfigs(
  lintMyLines.configs["flat/recommended"],
  lintMyLines.configs["flat/analysis"],
  {
    rules: {
      // Override the TODO aging to 2 weeks
      "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 14 }],
    },
  }
);

export default [myPreset];
```

---

### createFileTypePreset(options)

Create a preset for specific file types with proper inheritance. Convenience function combining file patterns with rule overrides.

**Parameters:**
- `options.basePreset` - Base preset to extend
- `options.files` - File patterns (required, array)
- `options.rules` - Rule overrides (optional)
- `options.name` - Config name (optional)

**Returns:** Configured preset

**Example:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createFileTypePreset } from "eslint-plugin-lint-my-lines/helpers";

export default [
  createFileTypePreset({
    basePreset: lintMyLines.configs["flat/strict"],
    files: ["packages/core/**/*.js"],
    name: "core-package-config",
    rules: {
      "lint-my-lines/require-file-header": "error",
    },
  }),
];
```

---

## Common Patterns

### Different Rules for Different Directories

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createConfigForFiles, extendPreset } from "eslint-plugin-lint-my-lines/helpers";

export default [
  // Strict for library code
  createConfigForFiles(
    lintMyLines.configs["flat/strict"],
    ["packages/*/src/**/*.js"]
  ),

  // Relaxed for scripts
  createConfigForFiles(
    extendPreset(lintMyLines.configs["flat/minimal"], {
      rules: { "lint-my-lines/require-jsdoc": "off" },
    }),
    ["scripts/**/*.js"]
  ),

  // Analysis for main codebase
  createConfigForFiles(
    lintMyLines.configs["flat/analysis"],
    ["src/**/*.js"]
  ),
];
```

### Environment-Specific Configuration

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createSeverityVariants } from "eslint-plugin-lint-my-lines/helpers";

const isDev = process.env.NODE_ENV === "development";
const { warn, error } = createSeverityVariants(
  lintMyLines.configs["flat/recommended"]
);

export default [
  isDev ? warn : error,

  // Always keep some rules as errors, even in development
  {
    rules: {
      "lint-my-lines/no-commented-code": "error",
    },
  },
];
```

### Monorepo Configuration

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { createConfigForFiles, createConfigWithExclude } from "eslint-plugin-lint-my-lines/helpers";

export default [
  // Global ignores
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  },

  // Base config for all packages
  createConfigWithExclude(
    lintMyLines.configs["flat/recommended"],
    ["**/dist/**", "**/node_modules/**"]
  ),

  // TypeScript packages
  createConfigForFiles(
    lintMyLines.configs["flat/typescript"],
    ["packages/core/**/*.ts", "packages/utils/**/*.ts"]
  ),

  // React packages
  createConfigForFiles(
    lintMyLines.configs["flat/react"],
    ["packages/ui/**/*.tsx"]
  ),

  // Vue packages
  createConfigForFiles(
    lintMyLines.configs["flat/vue"],
    ["packages/frontend/**/*.vue"]
  ),
];
```

### Team-Specific Preset

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";
import { extendPreset, mergeConfigs } from "eslint-plugin-lint-my-lines/helpers";

// Create a reusable team preset
const teamPreset = mergeConfigs(
  lintMyLines.configs["flat/recommended"],
  {
    rules: {
      // Team-specific rules
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
      "lint-my-lines/ban-specific-words": ["error", {
        includeDefaults: true,
        bannedWords: [
          { word: "TODO", replacement: "JIRA-XXX: TODO" },
        ],
      }],
    },
  }
);

export default [
  teamPreset,

  // Project-specific overrides
  {
    files: ["**/*.test.js"],
    rules: {
      "lint-my-lines/require-jsdoc": "off",
    },
  },
];
```

---

## TypeScript Support

Full TypeScript support is available:

```typescript
// eslint.config.ts
import lintMyLines from "eslint-plugin-lint-my-lines";
import type { FlatConfig } from "eslint-plugin-lint-my-lines";
import {
  createConfigForFiles,
  createSeverityVariants
} from "eslint-plugin-lint-my-lines/helpers";

const { warn, error } = createSeverityVariants(
  lintMyLines.configs["flat/recommended"]
);

const config: FlatConfig[] = [
  createConfigForFiles(error, ["src/**/*.ts"]),
  createConfigForFiles(warn, ["scripts/**/*.ts"]),
];

export default config;
```

### Type Definitions

All helper functions are fully typed:

```typescript
import type {
  FlatConfig,
  ExtendPresetOptions,
  SeverityVariants,
  FileTypePresetOptions,
} from "eslint-plugin-lint-my-lines";

// Or from the helpers subpath
import type {
  FlatConfig,
  SeverityVariants,
} from "eslint-plugin-lint-my-lines/helpers";
```

---

## Preset Inheritance

Understanding the preset inheritance hierarchy can help you choose the right base:

```
minimal (base)
  └── recommended
        └── strict
  └── markdown (relaxed minimal)

recommended
  └── typescript
  └── react
  └── vue
  └── svelte

strict
  └── typescript-strict

analysis (standalone)
```

When extending presets, start with the one closest to your needs and override from there.
