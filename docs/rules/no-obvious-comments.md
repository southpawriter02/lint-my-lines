# no-obvious-comments

Detect comments that merely restate the adjacent code.

## Rule Details

This rule flags comments that don't add value because they simply describe what the code already clearly expresses. Good comments explain *why*, not *what*.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sensitivity` | `"low"` \| `"medium"` \| `"high"` | `"medium"` | Detection sensitivity |
| `ignorePatterns` | `string[]` | `[]` | Regex patterns to ignore |
| `checkLeadingComments` | `boolean` | `true` | Check comments before code |
| `checkTrailingComments` | `boolean` | `true` | Check inline comments |

## Examples

### Default Configuration

**Valid:**

```js
// Business rule: users get 1 day grace period
dueDate.add(1, 'day');

// Workaround for Safari bug #1234
element.style.transform = 'translateZ(0)';

// Performance optimization: bitwise faster than Math.floor
const intValue = value | 0;
```

**Invalid:**

```js
// increment i
i++;

// return the value
return value;

// call doSomething
doSomething();

// loop through items
for (const item of items) {}
```

### Sensitivity Levels

**Low sensitivity:** Only flags the most obvious cases (exact matches)

**Medium sensitivity (default):** Flags common patterns like "increment", "return", "loop"

**High sensitivity:** Flags more subtle restatements

```json
{
  "rules": {
    "lint-my-lines/no-obvious-comments": ["error", {
      "sensitivity": "high"
    }]
  }
}
```

## Automatic Skipping

The rule automatically skips:

- JSDoc comments (`@param`, `@returns`)
- TODO/FIXME/NOTE comments
- URLs
- Comments explaining *why* (containing "because", "workaround", "optimization", etc.)
- ESLint directives

## When Not To Use It

- When teaching or creating educational content
- When code style requires comments on every line
- When working with complex algorithms that benefit from step-by-step comments

## Related Rules

- [require-explanation-comments](require-explanation-comments.md)
