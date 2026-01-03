# enforce-comment-length

Enforce minimum and maximum length for comments.

## Rule Details

This rule enforces that comments fall within specified length bounds to ensure comments are neither too terse nor excessively long.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minLength` | `number` | - | Minimum comment length (optional) |
| `maxLength` | `number` | `120` | Maximum comment length |
| `ignoreUrls` | `boolean` | `true` | Ignore URLs when calculating length |

## Examples

### Default Configuration

**Valid:**

```js
// This is a well-structured comment explaining the purpose
// See https://very-long-url.example.com/docs/api/v2/endpoints for more info
```

**Invalid:**

```js
// Hi
// This comment is way too long and exceeds the maximum length limit that has been configured for this codebase and should be broken up into multiple lines
```

### With Minimum Length

```json
{
  "rules": {
    "lint-my-lines/enforce-comment-length": ["error", {
      "minLength": 10,
      "maxLength": 80
    }]
  }
}
```

**Invalid (too short):**

```js
// Yes
// OK
```

### Ignoring URLs

When `ignoreUrls` is true (default), URLs don't count toward the length limit:

```js
// See https://example.com/very/long/documentation/path/that/would/exceed/limit
```

## When Not To Use It

- When comment length doesn't matter for your project
- When you have many inline comments that are intentionally brief

## Related Rules

- [enforce-capitalization](enforce-capitalization.md)
- [comment-spacing](comment-spacing.md)
