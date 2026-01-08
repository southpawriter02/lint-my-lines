# Frequently Asked Questions

This FAQ covers common questions about `eslint-plugin-lint-my-lines`. For detailed rule documentation, see the [rules directory](./rules/).

---

## General

### What is lint-my-lines?

`lint-my-lines` is an ESLint plugin that provides 21 rules to enforce comment quality in your JavaScript and TypeScript codebase. It helps teams maintain consistent, meaningful comments by detecting issues like:

- Improperly formatted TODO/FIXME/NOTE comments
- Commented-out code that should be removed
- Comments that restate the obvious
- Missing JSDoc documentation
- Stale comments referencing non-existent code

### How does this differ from ESLint's built-in comment rules?

ESLint includes basic comment rules like `spaced-comment` and `capitalized-comments`. `lint-my-lines` goes much further:

| Feature | ESLint Built-in | lint-my-lines |
|---------|-----------------|---------------|
| Comment spacing | Yes | Yes |
| Capitalization | Yes | Yes (with more skip patterns) |
| TODO format enforcement | No | Yes |
| Commented-out code detection | No | Yes |
| JSDoc validation | No | Yes |
| TSDoc support | No | Yes |
| Stale comment detection | No | Yes |
| Issue tracker integration | No | Yes |
| Comment-to-code ratio | No | Yes |

### Which preset should I use?

| If you want... | Use this preset |
|----------------|-----------------|
| Basic hygiene with minimal friction | `minimal` (4 rules) |
| Balanced enforcement for most projects | `recommended` (8 rules) |
| Maximum quality for library code | `strict` (14 rules) |
| Advanced analysis (aging, ratios) | `analysis` (3 rules) |

You can also combine presets and customize individual rules.

### Does lint-my-lines work with ESLint v9?

Yes. The plugin fully supports both ESLint v8 (legacy config) and ESLint v9+ (flat config):

```javascript
// ESLint v9+ flat config
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
];
```

```javascript
// ESLint v8 legacy config
module.exports = {
  extends: ["plugin:lint-my-lines/recommended"]
};
```

---

## Configuration

### How do I disable a rule for one line?

Use ESLint's standard disable comment:

```javascript
// eslint-disable-next-line lint-my-lines/no-commented-code
// const oldCode = value;
```

### How do I disable a rule for an entire file?

Add at the top of the file:

```javascript
/* eslint-disable lint-my-lines/no-commented-code */
```

### Can I use different presets for different folders?

Yes, with ESLint's configuration overrides:

**Flat config (v9+):**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  {
    files: ["src/lib/**/*.js"],
    rules: {
      "lint-my-lines/require-jsdoc": "error", // Stricter for library code
    },
  },
  {
    files: ["tests/**/*.js"],
    rules: {
      "lint-my-lines/require-jsdoc": "off", // Relaxed for tests
    },
  },
];
```

**Legacy config (v8):**

```json
{
  "extends": ["plugin:lint-my-lines/recommended"],
  "overrides": [
    {
      "files": ["src/lib/**/*.js"],
      "rules": {
        "lint-my-lines/require-jsdoc": "error"
      }
    },
    {
      "files": ["tests/**/*.js"],
      "rules": {
        "lint-my-lines/require-jsdoc": "off"
      }
    }
  ]
}
```

### How do I configure rules differently for test files?

Use file pattern overrides as shown above. Common test file patterns:

- `**/*.test.js`
- `**/*.spec.js`
- `tests/**/*.js`
- `__tests__/**/*.js`

### Why isn't my configuration being applied?

Common causes:

1. **Config not found**: Ensure `eslint.config.js` (flat) or `.eslintrc.*` (legacy) is in your project root
2. **Wrong format**: ESLint v9 uses flat config by default; v8 uses legacy
3. **File not matched**: Check your `files` patterns include the target files
4. **Plugin not installed**: Run `npm install eslint-plugin-lint-my-lines --save-dev`

Debug with:

```bash
npx eslint --print-config yourfile.js | grep lint-my-lines
```

---

## Rule-Specific Questions

### Why did `no-obvious-comments` flag my comment?

The rule detects comments that restate what the code already expresses. For example:

```javascript
// Increment counter  <-- Flagged: restates `counter++`
counter++;

// Track failed login attempts for rate limiting  <-- OK: explains WHY
counter++;
```

If you believe a comment is incorrectly flagged:

1. Try adding more context about **why**, not **what**
2. Adjust `sensitivity` option (`low`, `medium`, `high`)
3. Disable for specific lines if needed

### Why isn't `enforce-todo-format` detecting my TODO?

The rule looks for specific patterns. Ensure your TODO:

1. Uses uppercase: `TODO` not `todo` or `Todo`
2. Has the format: `TODO (reference): description`

Common issues:

```javascript
// todo: fix this           <-- Not detected (lowercase)
// TODO fix this            <-- Detected but flagged (missing parentheses)
// TODO (JIRA-123): fix     <-- Valid format
// TODO (author): fix       <-- Valid format
```

### How do I customize the banned words list?

```json
{
  "rules": {
    "lint-my-lines/ban-specific-words": ["error", {
      "bannedWords": [
        "obviously",
        {
          "word": "hack",
          "reason": "Be specific about what's temporary",
          "replacement": "workaround for [issue]"
        }
      ],
      "includeDefaults": true
    }]
  }
}
```

Default banned words include non-inclusive language like `whitelist`, `blacklist`, `master`, `slave`.

### What counts as "commented-out code"?

The `no-commented-code` rule detects patterns that look like code:

- Function/class declarations: `// function foo() {`
- Variable assignments: `// const x = 5;`
- Import/export statements: `// import { x } from 'y'`
- Control flow: `// if (condition) {`
- Method calls: `// object.method();`

The rule uses a threshold (default: 1 line) before flagging. Adjust with:

```json
{
  "lint-my-lines/no-commented-code": ["warn", { "threshold": 3 }]
}
```

### How is the comment-to-code ratio calculated?

```
ratio = commentLines / codeLines
```

- **Code lines**: Non-blank lines that are not comments
- **Comment lines**: Lines containing comments (multi-line comments count each line)
- **Blank lines**: Excluded

Options to fine-tune:

```json
{
  "lint-my-lines/comment-code-ratio": ["warn", {
    "minRatio": 0.05,
    "maxRatio": 0.40,
    "excludeJSDoc": true,
    "excludeTodo": true
  }]
}
```

---

## Integration Questions

### Can I use this with TypeScript?

Yes. TypeScript works automatically for all comment rules. For TSDoc-specific validation:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/typescript"],
];
```

This adds the `valid-tsdoc` rule for TSDoc tags like `@typeParam`, `@remarks`, `@beta`.

### How do I set up Vue/Svelte support?

**Vue:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/vue"],
];
```

**Svelte:**

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/svelte"],
];
```

These presets include processors that extract HTML comments from templates:

```vue
<template>
  <!-- TODO (TICKET-123): Add responsive layout -->
  <div>...</div>
</template>
```

### How do I integrate with my CI/CD pipeline?

**GitHub Actions:**

```yaml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npx eslint .
```

**GitLab CI:**

```yaml
lint:
  image: node:20
  script:
    - npm ci
    - npx eslint .
```

See the [Integration Guide](./INTEGRATION_GUIDE.md) for more CI/CD examples.

### Why aren't my Vue template comments being linted?

Ensure you're using the Vue preset which includes the `.vue` processor:

```javascript
// Correct
export default [
  lintMyLines.configs["flat/vue"],
];

// Incorrect - missing processor
export default [
  lintMyLines.configs["flat/recommended"],
  // Vue files won't have template comments linted
];
```

For legacy config, add the processor override:

```json
{
  "extends": ["plugin:lint-my-lines/vue"],
  "overrides": [
    {
      "files": ["*.vue"],
      "processor": "lint-my-lines/.vue"
    }
  ]
}
```

---

## Troubleshooting

### "Plugin not found" error

Ensure the plugin is installed:

```bash
npm install eslint-plugin-lint-my-lines --save-dev
```

For monorepos, ensure it's installed in the workspace root or the specific package.

### Rules not running on certain files

1. **Check file patterns**: ESLint may not be processing those files
   ```bash
   npx eslint --print-config path/to/file.js
   ```

2. **Check extensions**: By default, ESLint processes `.js` files. For other extensions:
   ```bash
   npx eslint . --ext .js,.ts,.vue
   ```

3. **Check ignores**: Review `.eslintignore` or `ignores` in config

### Autofix not working as expected

Not all rules support autofix. Check the rule documentation for "Fixable" status.

For fixable rules:

```bash
npx eslint . --fix
```

Common issues:

- `--fix` flag missing
- Rule is set to `"off"` (no errors = no fixes)
- Conflicting fixes from multiple rules

### Performance issues in large codebases

1. **Use `.eslintignore`**: Exclude `node_modules`, `dist`, `build`

2. **Enable caching**:
   ```bash
   npx eslint . --cache
   ```

3. **Disable heavy rules**: `stale-comment-detection` and `issue-tracker-integration` can be slower

4. **See**: [Performance Guide](./PERFORMANCE_GUIDE.md)

### Conflicts with other ESLint plugins

If rules conflict:

1. **Order matters**: In flat config, later configs override earlier ones
2. **Disable conflicting rules**: Choose one plugin's rule over another
3. **Check rule names**: Ensure you're using the correct prefix (`lint-my-lines/`)

---

## Contributing

### How do I report a false positive?

1. Open a [GitHub issue](https://github.com/southpawriter02/lint-my-lines/issues)
2. Include:
   - Rule name
   - Code example
   - ESLint version
   - Configuration
   - Expected vs actual behavior

### How do I request a new feature?

1. Check [existing issues](https://github.com/southpawriter02/lint-my-lines/issues) for duplicates
2. Open a new issue with the `enhancement` label
3. Describe the use case and expected behavior

### How do I contribute a fix?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Development setup
- Creating new rules
- Testing guidelines
- Pull request process

---

## More Help

- [README](../README.md) - Quick start and rule overview
- [Style Guide](../STYLE_GUIDE.md) - Comment best practices
- [Integration Guide](./INTEGRATION_GUIDE.md) - CI/CD, editors, monorepos
- [Migration Guide](./MIGRATION.md) - Upgrading versions
- [GitHub Issues](https://github.com/southpawriter02/lint-my-lines/issues) - Bug reports and feature requests
