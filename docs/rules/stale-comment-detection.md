# stale-comment-detection

Detect comments that reference identifiers (functions, variables, classes) that don't exist in the file.

## Rule Details

This rule flags comments that reference code identifiers which cannot be found in the current file. It helps catch outdated documentation that references renamed or deleted code.

The rule uses a **conservative detection strategy** to minimize false positives:
- Only checks backtick-quoted identifiers (e.g., `` `myFunction` ``)
- Optionally checks explicit reference patterns like "the X function" or "see X"
- Builds an identifier registry from the AST (declarations, imports, parameters)

### Examples

❌ **Incorrect** - Reference to non-existent function:

```javascript
// The `processData` function handles input
function handleInput(input) {
  return input;
}
```

❌ **Incorrect** - Reference to renamed variable:

```javascript
// Use `config` for settings
const options = { debug: true };
```

✅ **Correct** - Reference to existing function:

```javascript
// The `processData` function handles input
function processData(input) {
  return input;
}
```

✅ **Correct** - Reference to imported identifier:

```javascript
import { useState } from 'react';
// Use `useState` for state management
function Component() {
  const [state, setState] = useState(null);
  return state;
}
```

## Options

```json
{
  "lint-my-lines/stale-comment-detection": ["warn", {
    "checkBacktickRefs": true,
    "checkExplicitRefs": true,
    "ignorePatterns": [],
    "minIdentifierLength": 3
  }]
}
```

### `checkBacktickRefs` (default: `true`)

Check identifiers in backticks (`` `identifier` ``).

### `checkExplicitRefs` (default: `true`)

Check explicit reference patterns like:
- "the X function"
- "the X method"
- "the X variable"
- "the X class"
- "see X"
- "call X"

### `ignorePatterns` (default: `[]`)

Array of regex patterns for identifiers to ignore:

```json
{
  "ignorePatterns": ["^React$", "^_"]
}
```

### `minIdentifierLength` (default: `3`)

Minimum length for identifiers to check. Short identifiers like `id`, `x`, or `i` are skipped by default.

## When Not to Use This Rule

- If your codebase has many cross-file references in comments
- If you prefer aggressive refactoring without updating comments first
- In generated code or documentation files

## Related Rules

- [require-jsdoc](./require-jsdoc.md) - Require JSDoc for exported functions
- [valid-jsdoc](./valid-jsdoc.md) - Validate JSDoc matches function signature
