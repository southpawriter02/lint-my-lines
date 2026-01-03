# enforce-fixme-format

Enforce consistent format for FIXME comments.

## Rule Details

This rule enforces that FIXME comments follow a consistent format with a reference (bug ticket, author, or date) to track issues that need to be fixed.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | `string` | `"^FIXME\\s*\\(([^)]+)\\):"` | Custom regex pattern for FIXME format |

## Examples

### Default Configuration

**Valid:**

```js
// FIXME (BUG-456): Handle null case
// FIXME (jane): Memory leak in cleanup
// FIXME (2025-01-15): Critical bug to address
```

**Invalid:**

```js
// FIXME: This is broken
// FIXME broken code here
// FIXME() missing reference
```

### Custom Pattern

```json
{
  "rules": {
    "lint-my-lines/enforce-fixme-format": ["error", {
      "pattern": "^FIXME #[0-9]+:"
    }]
  }
}
```

**Valid with custom pattern:**

```js
// FIXME #789: Critical security issue
// FIXME #101: Race condition in handler
```

## Autofix

This rule provides automatic fixes by converting invalid FIXME comments to the expected format:

```js
// Before
// FIXME: Handle edge case

// After (autofix)
// FIXME (REFERENCE): Handle edge case
```

## When Not To Use It

- When your team has different conventions for FIXME comments
- When you don't track bugs with ticket references

## Related Rules

- [enforce-todo-format](enforce-todo-format.md)
- [enforce-note-format](enforce-note-format.md)
