# svelte-template-comments

Enforce comment style in Svelte component markup.

## Rule Details

This rule lints HTML comments (`<!-- -->`) within Svelte component markup sections. It applies the same comment standards you use in JavaScript to your template markup.

The rule checks:

- TODO comment format (requires reference)
- FIXME comment format (requires reference)
- Banned words usage
- Comment length limits
- Capitalization requirements

## Examples

### Invalid

```svelte
<script>
  let message = "Hello";
</script>

<!-- TODO: fix this later -->
<div class="container">
  <!-- hack to make this work -->
  <span>{message}</span>
</div>
```

### Valid

```svelte
<script>
  let message = "Hello";
</script>

<!-- TODO (TICKET-123): Implement responsive layout -->
<div class="container">
  <!-- Workaround for Safari flexbox bug -->
  <span>{message}</span>
</div>
```

## Options

```json
{
  "rules": {
    "lint-my-lines/svelte-template-comments": ["warn", {
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

To use this rule with Svelte files, you need the Svelte processor enabled:

### Flat Config (ESLint 9+)

```javascript
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/svelte"],
  // or manually:
  {
    files: ["**/*.svelte"],
    processor: "lint-my-lines/.svelte",
    rules: {
      "lint-my-lines/svelte-template-comments": "warn"
    }
  }
];
```

### Legacy Config

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

## Svelte Component Structure

Svelte components have a different structure than Vue SFCs:

```svelte
<script>
  // JavaScript/TypeScript here - use JS comment rules
  let count = 0;
</script>

<!-- Template markup starts after script -->
<!-- This rule applies to HTML comments here -->
<div>
  <button on:click={() => count++}>
    Count: {count}
  </button>
</div>

<style>
  /* CSS here - not covered by this rule */
</style>
```

The rule only applies to HTML comments in the markup section, not comments in `<script>` or `<style>` blocks.

## Autofix

This rule does not provide autofix for template comments.

## When Not To Use It

- When you don't need to lint HTML comments in Svelte markup
- When your Svelte components have minimal or no template comments
- When you use a different comment convention in templates vs. scripts

## Related Rules

- [vue-template-comments](./vue-template-comments.md) - Same rule for Vue templates
- [enforce-todo-format](./enforce-todo-format.md) - TODO format for JavaScript comments
- [enforce-fixme-format](./enforce-fixme-format.md) - FIXME format for JavaScript comments
- [ban-specific-words](./ban-specific-words.md) - Ban words in JavaScript comments
