# comment-spacing

Enforce consistent spacing in comments.

## Rule Details

This rule enforces a space after `//` in line comments and after `*` in block comments for readability.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requireSpaceAfterLine` | `boolean` | `true` | Require space after `//` |
| `requireSpaceAfterBlock` | `boolean` | `true` | Require space after `*` in block comments |

## Examples

### Default Configuration

**Valid:**

```js
// This has proper spacing
/* This is correct */
/**
 * Properly spaced JSDoc
 */
```

**Invalid:**

```js
//No space after slashes
/*No space in block*/
/**
 *Missing space after asterisk
 */
```

### Exceptions

The rule allows certain patterns without spaces:

- **Empty comments:** `//`
- **TypeScript references:** `/// <reference path='types.d.ts' />`

## Autofix

This rule provides automatic fixes by adding the required space:

```js
// Before
//Missing space
/*NoSpace*/

// After (autofix)
// Missing space
/* NoSpace */
```

## When Not To Use It

- When you prefer compact comment syntax
- When using tools that generate comments without spaces

## Related Rules

- [enforce-capitalization](enforce-capitalization.md)
- [enforce-comment-length](enforce-comment-length.md)
