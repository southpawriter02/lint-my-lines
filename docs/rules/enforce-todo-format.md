# enforce-todo-format

Enforce consistent format for TODO comments.

## Rule Details

This rule enforces that TODO comments follow a consistent format with a reference (ticket number, author, or date) to ensure accountability and traceability.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | `string` | `"^TODO\\s*\\(([^)]+)\\):"` | Custom regex pattern for TODO format |

## Examples

### Default Configuration

**Valid:**

```js
// TODO (TICKET-123): Add error handling
// TODO (john): Refactor this function
// TODO (2025-01-15): Review before release
```

**Invalid:**

```js
// TODO: Fix this bug
// TODO fix this
// TODO() missing reference
```

### Custom Pattern

```json
{
  "rules": {
    "lint-my-lines/enforce-todo-format": ["error", {
      "pattern": "^TODO #[0-9]+:"
    }]
  }
}
```

**Valid with custom pattern:**

```js
// TODO #123: Implement feature
// TODO #456: Fix edge case
```

## Autofix

This rule provides automatic fixes by converting invalid TODO comments to the expected format:

```js
// Before
// TODO: Add validation

// After (autofix)
// TODO (REFERENCE): Add validation
```

## When Not To Use It

- When your team has different conventions for TODO comments
- When you don't require ticket references in comments

## Related Rules

- [enforce-fixme-format](enforce-fixme-format.md)
- [enforce-note-format](enforce-note-format.md)
