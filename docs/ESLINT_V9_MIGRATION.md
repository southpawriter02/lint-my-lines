# ESLint v9 Migration Guide

This guide helps you migrate your lint-my-lines configuration from ESLint v8 to v9.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Step-by-Step Migration](#step-by-step-migration)
- [Available Flat Config Presets](#available-flat-config-presets)
- [Combining Presets](#combining-presets)
- [Caching (Performance)](#caching-performance)
- [Debugging](#debugging)
- [Common Issues](#common-issues)
- [TypeScript Configuration](#typescript-configuration)
- [Getting Help](#getting-help)

## Overview

ESLint v9 introduces significant changes to the configuration system:

| Feature | ESLint v8 | ESLint v9 |
|---------|-----------|-----------|
| Config format | `.eslintrc.*` files | `eslint.config.js` |
| Config style | Object with `extends` | Array of config objects |
| Plugin loading | String names (`"lint-my-lines"`) | Object imports |
| Caching | Basic | Improved with strategies |

### Key Benefits of ESLint v9

- **Simpler configuration**: No more extends resolution or plugin name magic
- **Better performance**: Improved caching and flat config efficiency
- **Type safety**: Full TypeScript support for config files
- **Explicit imports**: Clear understanding of what plugins are loaded

## Quick Start

### ESLint v8 (Legacy)

```javascript
// .eslintrc.js
module.exports = {
  extends: ["plugin:lint-my-lines/recommended"],
};
```

### ESLint v9 (Flat Config)

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
];
```

That's it! The flat config format is more explicit and easier to understand.

## Step-by-Step Migration

### 1. Update ESLint

First, update ESLint to version 9:

```bash
npm install eslint@^9.0.0 --save-dev
```

### 2. Update lint-my-lines

Update to the latest version with ESLint v9 support:

```bash
npm install eslint-plugin-lint-my-lines@^1.0.3 --save-dev
```

### 3. Create New Config File

Delete your `.eslintrc.*` file and create `eslint.config.js`:

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  // Base recommended config
  lintMyLines.configs["flat/recommended"],

  // Your custom overrides
  {
    rules: {
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
    },
  },
];
```

### 4. For CommonJS Projects

If your project uses CommonJS (no `"type": "module"` in package.json):

```javascript
// eslint.config.cjs
const lintMyLines = require("eslint-plugin-lint-my-lines");

module.exports = [
  lintMyLines.configs["flat/recommended"],
];
```

### 5. Update npm Scripts

Update your package.json scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

No changes needed here - ESLint automatically finds `eslint.config.js`.

## Available Flat Config Presets

lint-my-lines provides 10 flat config presets:

### Core Presets

| Preset | Description | Rules |
|--------|-------------|-------|
| `flat/minimal` | Essential TODO/FIXME format enforcement | 4 |
| `flat/recommended` | Balanced rules for most projects | 8 |
| `flat/strict` | Comprehensive enforcement for quality codebases | 14 |
| `flat/analysis` | Advanced analysis (stale detection, aging, ratios) | 3 |

### Language-Specific Presets

| Preset | Description | Files |
|--------|-------------|-------|
| `flat/typescript` | TypeScript with TSDoc validation | `*.ts`, `*.tsx` |
| `flat/typescript-strict` | Strict TypeScript enforcement | `*.ts`, `*.tsx` |
| `flat/react` | React/JSX support | `*.jsx`, `*.tsx` |
| `flat/vue` | Vue SFC support with template comments | `*.vue` |
| `flat/svelte` | Svelte component support | `*.svelte` |
| `flat/markdown` | Markdown code block linting | `*.md` |

## Combining Presets

You can combine multiple presets in your config:

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  // Base config for all files
  lintMyLines.configs["flat/recommended"],

  // TypeScript files get additional rules
  lintMyLines.configs["flat/typescript"],

  // Vue files get template comment support
  lintMyLines.configs["flat/vue"],

  // Analysis rules for auditing
  lintMyLines.configs["flat/analysis"],

  // Custom overrides
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    rules: {
      // Relax rules for test files
      "lint-my-lines/require-jsdoc": "off",
      "lint-my-lines/require-file-header": "off",
    },
  },
];
```

### Order Matters

Later configs override earlier ones. Put base configs first, then language-specific, then custom overrides.

## Caching (Performance)

ESLint v9 has improved caching. Enable it for faster repeat runs:

### Basic Caching

```bash
# Enable caching (stores in .eslintcache)
eslint --cache .

# Clear cache
rm .eslintcache
```

### Advanced Caching Options

```bash
# Custom cache location
eslint --cache --cache-location node_modules/.cache/eslint .

# Cache strategy: "metadata" (default) or "content"
# - metadata: Uses file modification time (faster)
# - content: Uses file content hash (more accurate)
eslint --cache --cache-strategy content .
```

### In package.json

```json
{
  "scripts": {
    "lint": "eslint --cache --cache-location node_modules/.cache/eslint ."
  }
}
```

## Debugging

### Enable Debug Logging

lint-my-lines supports debug logging via environment variable:

```bash
# Enable all debug logging
DEBUG_LINT_MY_LINES=1 eslint .

# Enable specific categories
DEBUG_LINT_MY_LINES=config eslint .    # Config-related logs
DEBUG_LINT_MY_LINES=cache eslint .     # Cache-related logs
DEBUG_LINT_MY_LINES=rules eslint .     # Rule execution logs
DEBUG_LINT_MY_LINES=config,cache eslint .  # Multiple categories
```

### ESLint Debug Mode

ESLint also has its own debug output:

```bash
# Show which config was loaded
DEBUG=eslint:* eslint .

# Show more details
eslint --debug .
```

### Config Inspector (ESLint v9)

ESLint v9 includes a config inspector:

```bash
npx @eslint/config-inspector
```

This opens a web UI showing exactly which rules apply to which files.

## Common Issues

### "Cannot find module" Error

**Problem:**
```
Error: Cannot find module 'eslint-plugin-lint-my-lines'
```

**Solution:** ESLint v9 requires explicit plugin imports:

```javascript
// Wrong - this doesn't work in v9
export default [{ plugins: ["lint-my-lines"] }];

// Correct - import the plugin
import lintMyLines from "eslint-plugin-lint-my-lines";
export default [{ plugins: { "lint-my-lines": lintMyLines } }];

// Easiest - use the preset which includes the plugin
import lintMyLines from "eslint-plugin-lint-my-lines";
export default [lintMyLines.configs["flat/recommended"]];
```

### "Invalid config" Error

**Problem:**
```
ESLint configuration is invalid
```

**Solution:** Make sure you're not mixing flat and legacy config formats:

```javascript
// Wrong - legacy format in eslint.config.js
export default {
  extends: ["plugin:lint-my-lines/recommended"],
};

// Correct - array format
export default [
  lintMyLines.configs["flat/recommended"],
];
```

### Processor Not Working

**Problem:** Vue/Svelte files not being processed correctly.

**Solution:** Use the correct preset which includes the processor:

```javascript
// This includes the Vue processor automatically
lintMyLines.configs["flat/vue"]

// If you need to configure manually
{
  files: ["**/*.vue"],
  processor: "lint-my-lines/.vue",
  plugins: { "lint-my-lines": lintMyLines },
  rules: { /* ... */ }
}
```

### Rules Not Applying to Certain Files

**Problem:** Rules don't seem to apply to some files.

**Solution:** Check your `files` patterns:

```javascript
export default [
  // This only applies to .js files
  {
    files: ["**/*.js"],
    rules: { /* ... */ }
  },

  // Add patterns for other file types
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],
    rules: { /* ... */ }
  },

  // Or use a preset that handles this
  lintMyLines.configs["flat/typescript"],
];
```

### Cache Issues

**Problem:** ESLint seems to ignore changes.

**Solution:** Clear the cache:

```bash
# Remove cache file
rm .eslintcache

# Or specify no cache for debugging
eslint --no-cache .
```

## TypeScript Configuration

### Type-Checked Config File

With TypeScript, you get full type checking for your config:

```typescript
// eslint.config.ts
import lintMyLines from "eslint-plugin-lint-my-lines";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  lintMyLines.configs["flat/recommended"],
  {
    rules: {
      // TypeScript will catch typos and invalid options here
      "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 100 }],
    },
  },
];

export default config;
```

### With Type Imports

```typescript
import lintMyLines from "eslint-plugin-lint-my-lines";
import type { FlatConfig, RulesConfig } from "eslint-plugin-lint-my-lines";

// Type-safe rule configuration
const customRules: RulesConfig = {
  "lint-my-lines/enforce-todo-format": ["warn", { placeholder: "JIRA-XXX" }],
  "lint-my-lines/ban-specific-words": ["error", { includeDefaults: true }],
};

const config: FlatConfig[] = [
  lintMyLines.configs["flat/recommended"],
  { rules: customRules },
];

export default config;
```

### Running TypeScript Config

ESLint v9 supports TypeScript config files natively with `tsx` or `ts-node`:

```bash
# With tsx
npm install tsx --save-dev
npx eslint .

# With ts-node
npm install ts-node --save-dev
npx eslint .
```

## Version Compatibility Matrix

| lint-my-lines | ESLint v8 | ESLint v9 | Node.js |
|---------------|-----------|-----------|---------|
| 1.0.0 - 1.0.2 | ✅ | ⚠️ Partial | >= 18 |
| 1.0.3+ | ✅ | ✅ Full | >= 18.18 |

### ESLint v8 Flat Config Support

ESLint v8.21+ supports flat config with `eslint.config.js`. If you need to use flat config with ESLint v8:

```javascript
// eslint.config.js (ESLint v8.21+)
const lintMyLines = require("eslint-plugin-lint-my-lines");

module.exports = [
  lintMyLines.configs["flat/recommended"],
];
```

## Getting Help

- **GitHub Issues**: [https://github.com/southpawriter02/lint-my-lines/issues](https://github.com/southpawriter02/lint-my-lines/issues)
- **FAQ**: [docs/FAQ.md](FAQ.md)
- **Integration Guide**: [docs/INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Style Guide**: [STYLE_GUIDE.md](../STYLE_GUIDE.md)

### Reporting Issues

When reporting ESLint v9 issues, please include:

1. ESLint version (`npx eslint --version`)
2. lint-my-lines version (`npm list eslint-plugin-lint-my-lines`)
3. Node.js version (`node --version`)
4. Your `eslint.config.js` file
5. Debug output (`DEBUG_LINT_MY_LINES=1 eslint . 2>&1 | head -50`)
