# Ignore Patterns Guide

> **Version:** 1.1.2
> **Added in:** lint-my-lines v1.1.2

This guide covers the ignore pattern options available in lint-my-lines rules. These options allow you to exclude specific content from rule analysis, reducing false positives and giving you fine-grained control over what gets checked.

## Table of Contents

- [Overview](#overview)
- [Available Options](#available-options)
- [Rules with Ignore Options](#rules-with-ignore-options)
- [Common Use Cases](#common-use-cases)
- [Path-Based Exclusions](#path-based-exclusions)
- [Examples](#examples)

---

## Overview

Many comments contain content that shouldn't be analyzed by linting rules:
- **URLs** are often long and unavoidable
- **Code blocks** in documentation should be preserved
- **Custom patterns** like `@see` references may need special handling

The v1.1.2 ignore options let you exclude this content from analysis.

---

## Available Options

### `ignoreUrls`

**Type:** `boolean`
**Default:** `true`

Excludes HTTP and HTTPS URLs from analysis.

```javascript
// eslint.config.js
{
  rules: {
    "lint-my-lines/enforce-comment-length": ["warn", {
      maxLength: 80,
      ignoreUrls: true  // URLs won't count toward length
    }]
  }
}
```

**Example comment:**
```javascript
// See https://very-long-documentation-url.example.com/api/reference for details
// ↑ URL is ignored, so this won't exceed maxLength
```

### `ignoreCodeBlocks`

**Type:** `boolean`
**Default:** `true`

Excludes markdown code blocks (triple backticks) from analysis.

```javascript
{
  rules: {
    "lint-my-lines/enforce-comment-length": ["warn", {
      maxLength: 100,
      ignoreCodeBlocks: true
    }]
  }
}
```

**Example comment:**
```javascript
/**
 * Use the following pattern:
 * ```javascript
 * const result = myFunction(arg1, arg2);
 * console.log(result);
 * ```
 */
// ↑ Code block content is ignored in length calculation
```

### `ignoreInlineCode`

**Type:** `boolean`
**Default:** `true` (where applicable)

Excludes inline code (single backticks) from analysis.

```javascript
{
  rules: {
    "lint-my-lines/ban-specific-words": ["warn", {
      ignoreInlineCode: true  // `blacklist` in code won't trigger
    }]
  }
}
```

### `ignoreRegex`

**Type:** `string`
**Default:** `null` (disabled)

Custom regex pattern to strip from comment content before analysis.

```javascript
{
  rules: {
    "lint-my-lines/enforce-comment-length": ["warn", {
      maxLength: 80,
      ignoreRegex: "@see\\s+\\S+"  // Remove @see references
    }]
  }
}
```

**Example comment:**
```javascript
// Initialize the user @see UserClass for implementation details
// ↑ "@see UserClass" is stripped, remaining text is checked
```

---

## Rules with Ignore Options

| Rule | `ignoreUrls` | `ignoreCodeBlocks` | `ignoreInlineCode` | `ignoreRegex` |
|------|:------------:|:------------------:|:------------------:|:-------------:|
| `enforce-comment-length` | ✅ | ✅ | ✅ | ✅ |
| `enforce-capitalization` | ✅ | ✅ | - | ✅ |
| `ban-specific-words` | ✅ | ✅ | ✅ | ✅ |
| `no-obvious-comments` | ✅ | ✅ | - | ✅ |
| `require-explanation-comments` | - | - | - | ✅ |
| `stale-comment-detection` | - | - | - | ✅ |

---

## Common Use Cases

### 1. Ignoring Long URLs in Length Checks

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "lint-my-lines/enforce-comment-length": ["warn", {
        maxLength: 80,
        ignoreUrls: true,  // Don't count URL length
        ignoreCodeBlocks: true  // Don't count code examples
      }]
    }
  }
];
```

### 2. Allowing Banned Words in Code Examples

```javascript
{
  rules: {
    "lint-my-lines/ban-specific-words": ["warn", {
      bannedWords: ["blacklist", "whitelist"],
      ignoreCodeBlocks: true,  // Allow in ```code```
      ignoreInlineCode: true   // Allow in `code`
    }]
  }
}
```

### 3. Ignoring JSDoc References

```javascript
{
  rules: {
    "lint-my-lines/enforce-comment-length": ["warn", {
      maxLength: 100,
      ignoreRegex: "@(see|link|typedef)\\s+\\S+"
    }]
  }
}
```

### 4. Custom Tag Patterns

```javascript
{
  rules: {
    "lint-my-lines/no-obvious-comments": ["warn", {
      ignoreRegex: "\\[Internal\\]"  // Ignore [Internal] markers
    }]
  }
}
```

---

## Path-Based Exclusions

For excluding entire files or directories from rules, use ESLint's native configuration patterns instead of rule-level options.

### Using `ignores` (Global Exclusion)

```javascript
// eslint.config.js
export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "**/*.min.js",
      "**/generated/**"
    ]
  },
  {
    rules: {
      "lint-my-lines/enforce-comment-length": "warn"
    }
  }
];
```

### Using `files` (Targeted Application)

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  // Apply strict rules only to source files
  {
    files: ["src/**/*.js"],
    ...lintMyLines.configs["flat/strict"]
  },

  // Relaxed rules for test files
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    ...lintMyLines.configs["flat/minimal"]
  }
];
```

### Using Config Helpers

```javascript
import lintMyLines, {
  createConfigForFiles,
  createConfigWithExclude
} from "eslint-plugin-lint-my-lines";

export default [
  // Only apply to src/
  createConfigForFiles(
    lintMyLines.configs["flat/recommended"],
    "src/**/*.js"
  ),

  // Exclude vendor files
  createConfigWithExclude(
    lintMyLines.configs["flat/strict"],
    ["vendor/**", "third-party/**"]
  )
];
```

---

## Examples

### Full Configuration Example

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  {
    plugins: {
      "lint-my-lines": lintMyLines
    },
    rules: {
      // Comment length with all ignore options
      "lint-my-lines/enforce-comment-length": ["warn", {
        maxLength: 100,
        ignoreUrls: true,
        ignoreCodeBlocks: true,
        ignoreRegex: "@(see|link)\\s+\\S+"
      }],

      // Banned words with code protection
      "lint-my-lines/ban-specific-words": ["warn", {
        includeDefaults: true,
        ignoreUrls: true,
        ignoreCodeBlocks: true,
        ignoreInlineCode: true
      }],

      // Capitalization with URL exception
      "lint-my-lines/enforce-capitalization": ["warn", {
        ignoreUrls: true,
        ignoreCodeBlocks: true
      }],

      // Obvious comments with custom filter
      "lint-my-lines/no-obvious-comments": ["warn", {
        sensitivity: "medium",
        ignoreUrls: true,
        ignoreCodeBlocks: true,
        ignoreRegex: "\\[DEBUG\\]"
      }]
    }
  }
];
```

### TypeScript Configuration

```typescript
// eslint.config.ts
import lintMyLines from "eslint-plugin-lint-my-lines";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  {
    plugins: {
      "lint-my-lines": lintMyLines
    },
    rules: {
      "lint-my-lines/enforce-comment-length": ["warn", {
        maxLength: 120,
        ignoreUrls: true,
        ignoreCodeBlocks: true,
        ignoreRegex: "@(see|link|typedef|template)\\s+\\S+"
      }]
    }
  }
];

export default config;
```

---

## Migration Notes

When upgrading from v1.1.1 to v1.1.2:

1. **No breaking changes** - All new options default to sensible values
2. **Improved defaults** - `ignoreUrls` and `ignoreCodeBlocks` default to `true`
3. **New `ignoreRegex`** - Provides custom pattern exclusion where not previously available

If you previously had false positives from URLs or code blocks in comments, they should now be automatically handled with the new defaults.
