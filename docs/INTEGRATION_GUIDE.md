# Integration Guide

This guide covers integrating lint-my-lines into your development workflow, including CI/CD pipelines, pre-commit hooks, and editor configurations.

## Table of Contents

- [Quick Setup with CLI](#quick-setup-with-cli)
- [ESLint Configuration](#eslint-configuration)
  - [Flat Config (ESLint v9+)](#flat-config-eslint-v9)
  - [Legacy Config (ESLint v8)](#legacy-config-eslint-v8)
- [Language Support](#language-support)
  - [TypeScript](#typescript)
  - [JSX/TSX (React)](#jsxtsx-react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Markdown](#markdown)
  - [Accessibility](#accessibility)
- [Project Configuration File](#project-configuration-file)
- [Pre-commit Hooks](#pre-commit-hooks)
  - [Husky + lint-staged](#husky--lint-staged)
  - [pre-commit Framework](#pre-commit-framework)
- [CI/CD Integration](#cicd-integration)
  - [GitHub Actions](#github-actions)
  - [GitLab CI](#gitlab-ci)
  - [CircleCI](#circleci)
- [Editor Integration](#editor-integration)
- [Monorepo Setup](#monorepo-setup)

---

## Quick Setup with CLI

The fastest way to get started is with our CLI:

```bash
# Generate recommended ESLint config (flat config format)
npx lint-my-lines init

# Use a specific preset
npx lint-my-lines init --preset strict

# Generate legacy .eslintrc format
npx lint-my-lines init --no-flat
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --preset <name>` | Preset: minimal, recommended, strict | recommended |
| `--flat` | Use ESLint flat config format | true |
| `--no-flat` | Use legacy .eslintrc format | - |

---

## ESLint Configuration

### Flat Config (ESLint v9+)

Create `eslint.config.js`:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  // Your other configs...
];
```

With customizations:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  {
    rules: {
      "lint-my-lines/enforce-comment-length": ["error", { maxLength: 80 }],
      "lint-my-lines/no-obvious-comments": "off",
    },
  },
];
```

### Legacy Config (ESLint v8)

Create `.eslintrc.json`:

```json
{
  "extends": ["plugin:lint-my-lines/recommended"]
}
```

With customizations:

```json
{
  "extends": ["plugin:lint-my-lines/recommended"],
  "rules": {
    "lint-my-lines/enforce-comment-length": ["error", { "maxLength": 80 }],
    "lint-my-lines/no-obvious-comments": "off"
  }
}
```

---

## Language Support

lint-my-lines provides specialized support for TypeScript, JSX/TSX, Vue, Svelte, and Markdown files.

### TypeScript

TypeScript files work automatically with all comment rules. For TSDoc-specific validation, use the TypeScript preset:

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/typescript"],
  // or for strict TSDoc validation:
  lintMyLines.configs["flat/typescript-strict"],
];
```

#### Legacy Config

```json
{
  "extends": ["plugin:lint-my-lines/typescript"]
}
```

The `valid-tsdoc` rule validates TSDoc-specific tags like `@typeParam`, `@remarks`, `@beta`, etc.

### JSX/TSX (React)

JSX and TSX files work automatically. The autofix for TODO/FIXME/NOTE comments is JSX-aware and will use block comments when inside JSX expressions:

```jsx
function App() {
  return (
    <div>
      {/* TODO (TICKET-123): Add loading state */}
      <Content />
    </div>
  );
}
```

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/react"],
];
```

#### Legacy Config

```json
{
  "extends": ["plugin:lint-my-lines/react"]
}
```

### Vue

Vue Single File Components (SFCs) require the Vue processor to lint HTML comments in templates.

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/vue"],
];
```

#### Legacy Config

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

The `vue-template-comments` rule lints HTML comments in templates:

```vue
<template>
  <!-- TODO (TICKET-123): Add responsive layout -->
  <div class="container">
    <slot></slot>
  </div>
</template>
```

### Svelte

Svelte components require the Svelte processor to lint HTML comments in markup.

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/svelte"],
];
```

#### Legacy Config

```json
{
  "extends": ["plugin:lint-my-lines/svelte"],
  "overrides": [
    {
      "files": ["*.svelte"],
      "processor": "lint-my-lines/.svelte"
    }
  ]
}
```

The `svelte-template-comments` rule lints HTML comments in markup:

```svelte
<script>
  let count = 0;
</script>

<!-- TODO (TICKET-123): Add animation -->
<button on:click={() => count++}>
  Count: {count}
</button>
```

### Markdown

Markdown files can be linted for code blocks with fenced code (` ``` `).

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/markdown"],
];
```

#### Legacy Config

```json
{
  "extends": ["plugin:lint-my-lines/markdown"],
  "overrides": [
    {
      "files": ["*.md"],
      "processor": "lint-my-lines/.md"
    }
  ]
}
```

Supported code block languages: `js`, `javascript`, `ts`, `typescript`, `jsx`, `tsx`, `mjs`, `cjs`.

Errors in Markdown code blocks are prefixed with the language, e.g., `[Markdown javascript block] TODO comment should use format...`

### Accessibility

For projects requiring accessibility documentation, use the accessibility preset:

#### Flat Config

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/accessibility"],
];
```

#### Legacy Config

```json
{
  "extends": ["plugin:lint-my-lines/accessibility"]
}
```

The accessibility preset includes three rules:

| Rule | Description |
|------|-------------|
| `accessibility-todo-format` | Enforce `A11Y-TODO (ref): description` format for accessibility work |
| `require-alt-text-comments` | Require comments for UI elements (icons, images, buttons) |
| `screen-reader-context` | Require comments for aria-hidden, tabindex, aria-live elements |

#### Combining with Other Presets

For comprehensive linting with accessibility support:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  lintMyLines.configs["flat/accessibility"],
];
```

#### React/JSX Accessibility

For React projects with accessibility focus:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/react"],
  lintMyLines.configs["flat/accessibility"],
];
```

The `require-alt-text-comments` and `screen-reader-context` rules are JSX-aware and check elements like:

```jsx
// Icon button for search - aria-label describes action
<button aria-label="Search">
  <SearchIcon aria-hidden="true" />
</button>

{/* Decorative divider - hidden from assistive tech */}
<hr aria-hidden="true" className="divider" />

{/* Live region for form errors - announces validation messages */}
<div aria-live="polite" className="error-messages">
  {errors.map(e => <p key={e.id}>{e.message}</p>)}
</div>
```

See the [Accessibility Guide](./ACCESSIBILITY_GUIDE.md) for best practices on documenting accessibility in your codebase

**Language hint mapping:**

The processor maps language hints to file types:

| Hint | Processed As |
|------|--------------|
| `js`, `javascript`, `mjs`, `cjs` | JavaScript |
| `ts`, `typescript` | TypeScript |
| `jsx` | JSX |
| `tsx` | TypeScript JSX |

**Unsupported languages are skipped:**

Code blocks with other language hints (like `python`, `ruby`, `bash`, `json`, etc.) are not processed and won't trigger lint errors.

````markdown
```javascript
// TODO (TICKET-123): Fix this  <-- Will be linted
```

```python
# TODO: Fix this  <-- NOT linted (unsupported language)
```

```
// Plain code block  <-- NOT linted (no language hint)
```
````

---

## Project Configuration File

Create a `.lintmylinesrc` or `.lintmylinesrc.json` file to define project-specific settings that the CLI uses when generating configs:

```json
{
  "preset": "recommended",
  "overrides": {
    "lint-my-lines/enforce-comment-length": ["warn", { "maxLength": 100 }],
    "lint-my-lines/ban-specific-words": ["error", {
      "bannedWords": [
        { "word": "asap", "reason": "Be specific", "replacement": "by [date]" }
      ]
    }]
  }
}
```

Or add to `package.json`:

```json
{
  "lintmylines": {
    "preset": "strict",
    "overrides": {}
  }
}
```

When you run `npx lint-my-lines init`, these settings are applied automatically.

---

## Pre-commit Hooks

### Husky + lint-staged

This is the recommended approach for most projects.

1. Install dependencies:

```bash
npm install husky lint-staged --save-dev
```

2. Initialize Husky:

```bash
npx husky init
```

3. Add lint-staged config to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

4. Update the pre-commit hook (`.husky/pre-commit`):

```bash
npx lint-staged
```

### pre-commit Framework

For projects using the [pre-commit](https://pre-commit.com/) framework:

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        types: [javascript, jsx, ts, tsx]
        pass_filenames: true
```

Install hooks:

```bash
pre-commit install
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/lint-comments.yml`:

```yaml
name: Lint Comments

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npx eslint .
```

For PR annotations, add [reviewdog](https://github.com/reviewdog/action-eslint):

```yaml
- uses: reviewdog/action-eslint@v1
  with:
    reporter: github-pr-review
    eslint_flags: "."
```

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
lint-comments:
  image: node:20
  stage: test
  script:
    - npm ci
    - npx eslint .
  only:
    - merge_requests
    - main
```

### CircleCI

Add to `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  lint:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm ci
      - run: npx eslint .

workflows:
  test:
    jobs:
      - lint
```

---

## Editor Integration

Most editors support ESLint out of the box. Install the ESLint extension for your editor:

### VS Code

Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

Add to `.vscode/settings.json`:

```json
{
  "eslint.validate": ["javascript", "typescript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Multi-language configuration (Vue/Svelte):**

For projects with Vue or Svelte files, add them to the validation list:

```json
{
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue",
    "svelte"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.options": {
    "extensions": [".js", ".ts", ".vue", ".svelte"]
  }
}
```

### WebStorm/IntelliJ

ESLint integration is built-in. Go to:
- Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
- Enable "Automatic ESLint configuration"

### Vim/Neovim

With [ALE](https://github.com/dense-analysis/ale):

```vim
let g:ale_linters = { 'javascript': ['eslint'] }
let g:ale_fixers = { 'javascript': ['eslint'] }
```

With [coc.nvim](https://github.com/neoclide/coc.nvim), install coc-eslint.

---

## Monorepo Setup

### With Workspace Root Config

Create `eslint.config.js` at the monorepo root:

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
  lintMyLines.configs["flat/recommended"],
];
```

Run from root:

```bash
npx eslint packages/
```

### Per-Package Configuration

Each package can have its own config that extends the root:

```javascript
// packages/api/eslint.config.js
import rootConfig from "../../eslint.config.js";

export default [
  ...rootConfig,
  {
    rules: {
      // Package-specific overrides
      "lint-my-lines/require-jsdoc": "error",
    },
  },
];
```

### Mixed Presets in Monorepo

Different packages can use different presets based on their requirements:

```javascript
// eslint.config.js (monorepo root)
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },

  // Base rules for all packages
  lintMyLines.configs["flat/minimal"],

  // Stricter rules for library code (published packages)
  {
    files: ["packages/core/**/*.js", "packages/utils/**/*.js"],
    ...lintMyLines.configs["flat/strict"],
  },

  // TypeScript + TSDoc for typed packages
  {
    files: ["packages/types/**/*.ts"],
    ...lintMyLines.configs["flat/typescript-strict"],
  },

  // Relaxed rules for internal tools
  {
    files: ["tools/**/*.js", "scripts/**/*.js"],
    rules: {
      "lint-my-lines/require-jsdoc": "off",
      "lint-my-lines/require-file-header": "off",
    },
  },

  // Vue-specific for frontend package
  {
    files: ["packages/web/**/*.vue"],
    ...lintMyLines.configs["flat/vue"],
  },
];
```

### Nx/Turborepo

Add lint task to your pipeline:

```json
{
  "pipeline": {
    "lint": {
      "outputs": []
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**ESLint can't find the plugin**

Ensure lint-my-lines is installed:
```bash
npm install eslint-plugin-lint-my-lines --save-dev
```

For monorepos, ensure the plugin is installed at the workspace root or in the specific package where ESLint runs.

**Flat config not working**

Flat config requires ESLint v9+. Check your version:
```bash
npx eslint --version
```

For ESLint v8, use legacy config format:
```bash
npx lint-my-lines init --no-flat
```

**Rules not running**

Verify your config is loading:
```bash
npx eslint --print-config yourfile.js | grep lint-my-lines
```

If rules don't appear, check:
1. The file matches your config's `files` patterns
2. The file isn't excluded by `.eslintignore` or `ignores`
3. ESLint is processing the file extension (use `--ext .js,.ts,.vue`)

**Plugin conflicts with other ESLint plugins**

If lint-my-lines rules conflict with other plugins:

1. **Check rule order**: In flat config, later configs override earlier ones
2. **Disable conflicting rules**: If two plugins have similar rules, choose one:
   ```javascript
   {
     rules: {
       "other-plugin/capitalized-comments": "off",
       "lint-my-lines/enforce-capitalization": "error",
     }
   }
   ```
3. **Use separate configs for different files**: Apply different plugins to different file patterns

**Performance issues in large codebases**

For large projects:

1. **Enable ESLint caching**:
   ```bash
   npx eslint . --cache
   ```

2. **Exclude non-essential directories** in `.eslintignore`:
   ```
   node_modules/
   dist/
   build/
   coverage/
   ```

3. **Consider disabling heavy rules**: `stale-comment-detection` and `issue-tracker-integration` can be slower due to AST traversal and API calls

See the [Performance Guide](./PERFORMANCE_GUIDE.md) for detailed optimization tips.

**Vue/Svelte template comments not being linted**

Template comments require the appropriate processor. Ensure you're using the language preset:

```javascript
// Correct - includes Vue processor
import lintMyLines from "eslint-plugin-lint-my-lines";
export default [
  lintMyLines.configs["flat/vue"],
];

// Incorrect - no processor, template comments won't be linted
export default [
  lintMyLines.configs["flat/recommended"],
];
```

For legacy config, add the processor override:
```json
{
  "overrides": [
    {
      "files": ["*.vue"],
      "processor": "lint-my-lines/.vue"
    }
  ]
}
```

**Autofix not applying changes**

If `--fix` doesn't change anything:

1. **Check if the rule is fixable**: Not all rules support autofix. See the rule documentation for "Fixable" status.
2. **Ensure errors exist**: If a rule is `"off"` or the code is valid, there's nothing to fix
3. **Check for conflicting fixes**: Multiple rules trying to fix the same location may cancel out
4. **Review the fix**: Some fixes require human judgment and aren't auto-fixable

```bash
# See what would be fixed
npx eslint . --fix-dry-run
```

**Rules work in IDE but not in CI**

Common causes of IDE/CI discrepancies:

1. **Different config files**: IDE may find a local config while CI uses a different path
2. **Different ESLint versions**: Lock versions in `package-lock.json`
3. **Environment differences**: Some rules use environment variables (e.g., `issue-tracker-integration`)
4. **Working directory**: Ensure CI runs from the correct directory

Debug by running the same command locally that CI uses:
```bash
npx eslint . --debug 2>&1 | head -50
```

---

## Next Steps

- Review the [Style Guide](../STYLE_GUIDE.md) for comment best practices
- Browse [individual rule documentation](./rules/) for configuration options
- Check the [README](../README.md) for preset comparisons
