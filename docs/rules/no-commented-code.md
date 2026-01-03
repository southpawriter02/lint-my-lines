# no-commented-code

Detect and flag commented-out code.

## Rule Details

This rule detects code that has been commented out instead of being deleted. Commented-out code clutters the codebase and should be removed (Git can preserve history).

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `1` | Minimum code-like lines to flag |
| `allowPatterns` | `string[]` | `[]` | Regex patterns for allowed comments |

## Examples

### Default Configuration

**Valid:**

```js
// This is a regular comment explaining the code
// TODO (TICKET-123): Add validation here
/** @param {string} name - The user's name */
```

**Invalid:**

```js
// function oldHandler() {
//   return true;
// }

// const oldValue = calculateSomething();
// import { something } from 'module';
```

### With Threshold

```json
{
  "rules": {
    "lint-my-lines/no-commented-code": ["error", {
      "threshold": 3
    }]
  }
}
```

This only flags comments with 3+ lines of code-like content.

### Allow Patterns

```json
{
  "rules": {
    "lint-my-lines/no-commented-code": ["error", {
      "allowPatterns": ["^example:", "^sample:"]
    }]
  }
}
```

## Detection Patterns

The rule detects many code patterns including:

- Function declarations and expressions
- Class definitions
- Import/export statements
- Variable declarations
- Control flow (if, for, while, switch)
- Return statements
- Console and debug calls
- Arrow functions
- Object/array literals
- Assignment expressions

## Automatic Skipping

The rule automatically skips:

- JSDoc comments (`@param`, `@returns`, etc.)
- URLs (`http://`, `https://`)
- TODO/FIXME/NOTE comments
- ESLint directives (`eslint-disable`)
- License headers

## When Not To Use It

- When you intentionally keep code examples in comments
- When documentation includes code snippets

## Related Rules

- [ban-specific-words](ban-specific-words.md)
