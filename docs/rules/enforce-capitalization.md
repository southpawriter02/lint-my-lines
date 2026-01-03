# enforce-capitalization

Enforce sentence case (initial capital letter) for comments.

## Rule Details

This rule enforces that comments begin with an uppercase letter for consistency and professionalism.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ignoreInlineCode` | `boolean` | `true` | Ignore comments starting with inline code in backticks |

## Examples

### Default Configuration

**Valid:**

```js
// This comment starts with a capital letter
// A well-formatted comment
// `functionName` is called here (allowed because starts with backtick)
```

**Invalid:**

```js
// this should be capitalized
// lower case start
```

### Automatic Skipping

The rule automatically skips:

- **JSDoc tags:** `// @param name - the name`
- **URLs:** `// https://example.com`
- **ESLint directives:** `// eslint-disable-next-line`
- **File paths:** `// ./path/to/file.js`
- **Numbers:** `// 123 items in the list`
- **Code references:** `// myFunction is used here`

## Autofix

This rule provides automatic fixes by capitalizing the first letter:

```js
// Before
// this needs capitalization

// After (autofix)
// This needs capitalization
```

## When Not To Use It

- When your codebase has many code references in comments
- When style guides don't require sentence case

## Related Rules

- [comment-spacing](comment-spacing.md)
- [enforce-comment-length](enforce-comment-length.md)
