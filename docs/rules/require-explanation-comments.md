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

### `ternaryChainLength`

Controls how many chained ternary operators trigger a comment requirement. Default: `2`

```javascript
// ternaryChainLength: 2 (default)
// This is OK (only 1 ternary):
const simple = condition ? "yes" : "no";

// This triggers the rule (2 chained ternaries):
const result = a ? b : c ? d : e;
```

```javascript
// ternaryChainLength: 3
// This is now OK (only 2 chained ternaries):
const result = a ? b : c ? d : e;

// This triggers the rule (3 chained ternaries):
const complex = a ? b : c ? d : e ? f : g;
```

### `conditionComplexity`

Controls how many logical operators (`&&`, `||`, `!`) in a single condition trigger a comment requirement. Default: `3`

```javascript
// conditionComplexity: 3 (default)
// This is OK (only 2 operators):
if (a && b || c) { }

// This triggers the rule (3+ operators):
if (a && b || c && d) { }
```

```javascript
// conditionComplexity: 4
// This is now OK (only 3 operators):
if (a && b || c && d) { }

// This triggers the rule (4+ operators):
if (a && b && c || d && e) { }
```

The complexity score counts:
- Each `&&` operator
- Each `||` operator
- Each `!` (negation) operator
- Nested conditions in parentheses

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
