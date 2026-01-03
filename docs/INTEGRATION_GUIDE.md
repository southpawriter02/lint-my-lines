# Integration Guide

This guide covers integrating lint-my-lines into your development workflow, including CI/CD pipelines, pre-commit hooks, and editor configurations.

## Table of Contents

- [Quick Setup with CLI](#quick-setup-with-cli)
- [ESLint Configuration](#eslint-configuration)
  - [Flat Config (ESLint v9+)](#flat-config-eslint-v9)
  - [Legacy Config (ESLint v8)](#legacy-config-eslint-v8)
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

---

## Next Steps

- Review the [Style Guide](../STYLE_GUIDE.md) for comment best practices
- Browse [individual rule documentation](./rules/) for configuration options
- Check the [README](../README.md) for preset comparisons
