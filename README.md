# lint-my-lines

`lint-my-lines` is an ESLint plugin that provides a set of rules to enforce a clear, effective, and maintainable style for code comments.

Good comments are a crucial part of high-quality code, but they are often neglected. This project aims to help developers improve their commenting habits by providing real-time feedback within their code editor.

## Features

*   **21 Rules:** Comprehensive coverage for comment formatting, content quality, JSDoc/TSDoc validation, and advanced analysis.
*   **Multi-language Support:** TypeScript, JSX/TSX, Vue, Svelte, and Markdown code blocks.
*   **3+ Configuration Presets:** Start quickly with `minimal`, `recommended`, `strict`, or language-specific presets.
*   **Autofix Support:** Many rules automatically fix issues for you.
*   **Style Guide:** Based on a comprehensive [STYLE_GUIDE.md](STYLE_GUIDE.md) that explains the rationale behind each rule.
*   **Extensible:** Built as an ESLint plugin, making it easy to integrate into existing JavaScript and TypeScript projects.

## Getting Started

### Installation

```bash
npm install eslint-plugin-lint-my-lines --save-dev
```

### Quick Setup with CLI

The fastest way to configure lint-my-lines:

```bash
# Generate ESLint config with recommended preset
npx lint-my-lines init

# Use a different preset
npx lint-my-lines init --preset strict

# For ESLint v8 (legacy config)
npx lint-my-lines init --no-flat
```

### ESLint Flat Config (v9+)

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
];
```

### Legacy Config (ESLint v8)

```js
// .eslintrc.js
module.exports = {
  extends: ["plugin:lint-my-lines/recommended"]
};
```

### Available Presets

| Preset | Description | Rules |
|--------|-------------|-------|
| `plugin:lint-my-lines/minimal` | Essential comment hygiene | 4 rules |
| `plugin:lint-my-lines/recommended` | Balanced defaults for most projects | 8 rules |
| `plugin:lint-my-lines/strict` | Maximum enforcement for high-quality codebases | 14 rules |
| `plugin:lint-my-lines/analysis` | Advanced analysis (stale detection, aging, ratios) | 3 rules |

### Manual Configuration

You can also configure individual rules:

```json
{
  "plugins": ["lint-my-lines"],
  "rules": {
    "lint-my-lines/enforce-todo-format": "warn",
    "lint-my-lines/no-commented-code": "error",
    "lint-my-lines/enforce-capitalization": "warn"
  }
}
```

### Extending Presets

Start with a preset and customize as needed:

```js
// .eslintrc.js
module.exports = {
  extends: ["plugin:lint-my-lines/recommended"],
  rules: {
    // Override specific rules
    "lint-my-lines/enforce-comment-length": ["error", { maxLength: 80 }],
    // Disable a rule from the preset
    "lint-my-lines/ban-specific-words": "off"
  }
};
```

## Rules

### Comment Format Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [enforce-todo-format](docs/rules/enforce-todo-format.md) | Enforce `TODO (ref): description` format | ✅ |
| [enforce-fixme-format](docs/rules/enforce-fixme-format.md) | Enforce `FIXME (ref): description` format | ✅ |
| [enforce-note-format](docs/rules/enforce-note-format.md) | Enforce `NOTE (ref): description` format | ✅ |
| [enforce-comment-length](docs/rules/enforce-comment-length.md) | Enforce min/max comment length | |
| [enforce-capitalization](docs/rules/enforce-capitalization.md) | Require capital letter at start | ✅ |
| [comment-spacing](docs/rules/comment-spacing.md) | Require space after `//` and `*` | ✅ |

### Content Quality Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [no-commented-code](docs/rules/no-commented-code.md) | Detect commented-out code | |
| [no-obvious-comments](docs/rules/no-obvious-comments.md) | Detect comments that restate code | |
| [ban-specific-words](docs/rules/ban-specific-words.md) | Ban vague/non-inclusive terms | ✅ |
| [require-explanation-comments](docs/rules/require-explanation-comments.md) | Require comments for complex code | |

### JSDoc/TSDoc Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [require-jsdoc](docs/rules/require-jsdoc.md) | Require JSDoc for exported functions | ✅ |
| [valid-jsdoc](docs/rules/valid-jsdoc.md) | Validate JSDoc matches function signature | ✅ |
| [valid-tsdoc](docs/rules/valid-tsdoc.md) | Validate TSDoc-specific tags | |
| [jsdoc-type-syntax](docs/rules/jsdoc-type-syntax.md) | Enforce consistent type syntax | ✅ |
| [require-file-header](docs/rules/require-file-header.md) | Require file header comments | ✅ |

### Template Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [vue-template-comments](docs/rules/vue-template-comments.md) | Lint HTML comments in Vue templates | |
| [svelte-template-comments](docs/rules/svelte-template-comments.md) | Lint HTML comments in Svelte markup | |

### Advanced Analysis Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [stale-comment-detection](docs/rules/stale-comment-detection.md) | Detect comments referencing non-existent code | |
| [todo-aging-warnings](docs/rules/todo-aging-warnings.md) | Warn on old TODO/FIXME comments | |
| [comment-code-ratio](docs/rules/comment-code-ratio.md) | Report under/over-documented files | |
| [issue-tracker-integration](docs/rules/issue-tracker-integration.md) | Validate ticket IDs in issue trackers | |

## Preset Details

### Minimal

```js
{
  "lint-my-lines/enforce-todo-format": "warn",
  "lint-my-lines/enforce-fixme-format": "warn",
  "lint-my-lines/enforce-note-format": "warn",
  "lint-my-lines/no-commented-code": "warn"
}
```

### Recommended

Includes everything in `minimal`, plus:

```js
{
  "lint-my-lines/enforce-comment-length": ["warn", { maxLength: 120 }],
  "lint-my-lines/enforce-capitalization": "warn",
  "lint-my-lines/comment-spacing": "warn",
  "lint-my-lines/ban-specific-words": ["warn", { includeDefaults: true }]
}
```

### Strict

Includes everything in `recommended` (as errors), plus:

```js
{
  "lint-my-lines/no-obvious-comments": ["warn", { sensitivity: "medium" }],
  "lint-my-lines/require-explanation-comments": ["warn", { requireFor: ["regex", "bitwise"] }],
  "lint-my-lines/require-jsdoc": "warn",
  "lint-my-lines/valid-jsdoc": "warn",
  "lint-my-lines/jsdoc-type-syntax": ["warn", { prefer: "typescript" }],
  "lint-my-lines/require-file-header": ["warn", { requiredTags: ["@file"] }]
}
```

### Analysis

Advanced analysis rules for code quality insights:

```js
{
  "lint-my-lines/stale-comment-detection": "warn",
  "lint-my-lines/todo-aging-warnings": ["warn", { maxAgeDays: 30 }],
  "lint-my-lines/comment-code-ratio": ["warn", { minRatio: 0.05, maxRatio: 0.40 }]
  // issue-tracker-integration requires configuration
}
```

Note: `issue-tracker-integration` requires explicit configuration for your tracker. See [issue-tracker-integration docs](docs/rules/issue-tracker-integration.md).

## Integration

### Pre-commit Hooks

With [Husky](https://github.com/typicode/husky) and lint-staged:

```json
{
  "lint-staged": {
    "*.{js,ts}": "eslint --fix"
  }
}
```

### GitHub Actions

Copy the workflow from `.github/workflows/lint-comments.yml` or create your own:

```yaml
- run: npm ci
- run: npx eslint .
```

See the full [Integration Guide](docs/INTEGRATION_GUIDE.md) for CI/CD, editor setup, and monorepo configurations.

## Language Support

lint-my-lines supports multiple languages and frameworks:

| Language/Framework | Preset | Features |
|--------------------|--------|----------|
| JavaScript | `recommended` | All rules |
| TypeScript | `typescript` | All rules + TSDoc validation |
| JSX/TSX (React) | `react` | JSX-aware autofix |
| Vue | `vue` | Template HTML comment linting |
| Svelte | `svelte` | Template HTML comment linting |
| Markdown | `markdown` | Code block linting |

### Example: Multi-language Project

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  lintMyLines.configs["flat/typescript"],
  lintMyLines.configs["flat/vue"],
];
```

See the [Integration Guide](docs/INTEGRATION_GUIDE.md#language-support) for detailed setup instructions.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
