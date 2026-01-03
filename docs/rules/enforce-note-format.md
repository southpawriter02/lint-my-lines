# enforce-note-format

Enforce consistent format for NOTE comments.

## Rule Details

This rule enforces that NOTE comments follow a consistent format with a reference (topic, author, or context) to provide clarity about why the note exists.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | `string` | `"^NOTE\\s*\\(([^)]+)\\):"` | Custom regex pattern for NOTE format |

## Examples

### Default Configuration

**Valid:**

```js
// NOTE (performance): Using bitwise operations for speed
// NOTE (author): This is intentionally verbose for readability
// NOTE (legacy): Keeping for backward compatibility
```

**Invalid:**

```js
// NOTE: This is important
// NOTE important info here
// NOTE() missing reference
```

### Custom Pattern

```json
{
  "rules": {
    "lint-my-lines/enforce-note-format": ["error", {
      "pattern": "^NOTE \\[[a-z]+\\]:"
    }]
  }
}
```

**Valid with custom pattern:**

```js
// NOTE [perf]: Optimized for large datasets
// NOTE [security]: Input is sanitized above
```

## Autofix

This rule provides automatic fixes by converting invalid NOTE comments to the expected format:

```js
// Before
// NOTE: This approach is intentional

// After (autofix)
// NOTE (REFERENCE): This approach is intentional
```

## When Not To Use It

- When your team has different conventions for NOTE comments
- When informal notes don't need categorization

## Related Rules

- [enforce-todo-format](enforce-todo-format.md)
- [enforce-fixme-format](enforce-fixme-format.md)
