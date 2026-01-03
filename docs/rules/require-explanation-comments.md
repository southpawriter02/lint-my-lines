# require-explanation-comments

Require explanatory comments for complex code patterns.

## Rule Details

This rule enforces comments on code that may be difficult to understand at a glance, such as regex patterns, bitwise operations, deeply nested code, and recursive functions.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requireFor` | `string[]` | `["regex", "bitwise", "ternary"]` | Patterns requiring comments |
| `nestingDepth` | `number` | `3` | Nesting level that triggers requirement |
| `ternaryChainLength` | `number` | `2` | Chained ternaries that trigger requirement |
| `conditionComplexity` | `number` | `3` | Operators in condition that trigger requirement |

### Available `requireFor` Values

- `"regex"` - Regular expression literals
- `"bitwise"` - Bitwise operations (`&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`)
- `"ternary"` - Chained ternary expressions
- `"nesting"` - Deeply nested code blocks
- `"recursion"` - Recursive function calls
- `"complexity"` - Complex boolean conditions

## Examples

### Default Configuration

**Valid:**

```js
// Match email addresses with format: user@domain.tld
const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;

// Using bitwise OR to convert float to int (faster than Math.floor)
const intValue = value | 0;

// Determine status based on priority and approval
const status = priority > 5
    ? (approved ? "urgent" : "pending")
    : "normal";
```

**Invalid:**

```js
const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;

const flags = (read << 2) | (write << 1) | execute;

const result = a ? b ? c : d : e;
```

### Custom Requirements

```json
{
  "rules": {
    "lint-my-lines/require-explanation-comments": ["error", {
      "requireFor": ["regex", "bitwise", "nesting", "recursion"],
      "nestingDepth": 4,
      "conditionComplexity": 4
    }]
  }
}
```

### Only Regex and Bitwise

```json
{
  "rules": {
    "lint-my-lines/require-explanation-comments": ["error", {
      "requireFor": ["regex", "bitwise"]
    }]
  }
}
```

## What Counts as a Comment

The rule accepts:

- Line comments directly above the code
- Block comments directly above the code
- JSDoc comments (`/** @type {RegExp} ... */`)
- Trailing comments on the same line

## When Not To Use It

- When your team is highly familiar with the patterns used
- When working on performance-critical code where patterns are standard
- When using well-known regex patterns (the rule may still flag them)

## Related Rules

- [no-obvious-comments](no-obvious-comments.md)
