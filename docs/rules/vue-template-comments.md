# vue-template-comments

Enforce comment style in Vue component templates.

## Rule Details

This rule lints HTML comments (`<!-- -->`) within Vue Single File Component (SFC) templates. It applies the same comment standards you use in JavaScript to your template markup.

The rule checks:

- TODO comment format (requires reference)
- FIXME comment format (requires reference)
- Banned words usage
- Comment length limits
- Capitalization requirements

## Examples

### Invalid

```vue
<template>
  <!-- TODO: fix this later -->
  <div class="container">
    <!-- hack to make this work -->
    <span>{{ message }}</span>
  </div>
</template>
```

### Valid

```vue
<template>
  <!-- TODO (TICKET-123): Implement responsive layout -->
  <div class="container">
    <!-- Workaround for Safari flexbox bug -->
    <span>{{ message }}</span>
  </div>
</template>
```

## Options

```json
{
  "rules": {
    "lint-my-lines/vue-template-comments": ["warn", {
      "checkTodoFormat": true,
      "checkFixmeFormat": true,
      "checkBannedWords": true,
      "bannedWords": [],
      "maxLength": 0,
      "requireCapitalization": false
    }]
  }
}
```

### `checkTodoFormat`

When `true` (default), requires TODO comments to follow the format:

```html
<!-- TODO (reference): description -->
```

### `checkFixmeFormat`

When `true` (default), requires FIXME comments to follow the format:

```html
<!-- FIXME (reference): description -->
```

### `checkBannedWords`

When `true` (default), checks for banned words in template comments. Default banned words:

| Word | Suggested Replacement |
|------|----------------------|
| `hack` | `workaround` |
| `xxx` | `TODO` |
| `fixme` | `FIXME (reference):` |
| `todo` | `TODO (reference):` |

### `bannedWords`

Custom list of banned words with optional replacements:

```json
{
  "bannedWords": [
    { "word": "hack", "replacement": "workaround" },
    { "word": "temp" }
  ]
}
```

### `maxLength`

Maximum allowed comment length. Set to `0` (default) to disable.

```json
{
  "maxLength": 100
}
```

### `requireCapitalization`

When `true`, requires template comments to start with a capital letter.

```html
<!-- Invalid -->
<!-- this should be capitalized -->

<!-- Valid -->
<!-- This is properly capitalized -->
```

## Setup

To use this rule with Vue files, you need the Vue processor enabled:

### Flat Config (ESLint 9+)

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/vue"],
  // or manually:
  {
    files: ["**/*.vue"],
    processor: "lint-my-lines/.vue",
    rules: {
      "lint-my-lines/vue-template-comments": "warn"
    }
  }
];
```

### Legacy Config

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

## Autofix

This rule does not provide autofix for template comments.

## When Not To Use It

- When you don't need to lint HTML comments in Vue templates
- When your Vue templates have minimal or no comments
- When you use a different comment convention in templates vs. scripts

## Related Rules

- [enforce-todo-format](./enforce-todo-format.md) - TODO format for JavaScript comments
- [enforce-fixme-format](./enforce-fixme-format.md) - FIXME format for JavaScript comments
- [ban-specific-words](./ban-specific-words.md) - Ban words in JavaScript comments
