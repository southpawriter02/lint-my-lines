# valid-jsdoc

Validate that JSDoc comments match function signatures.

## Rule Details

This rule ensures that JSDoc comments accurately reflect the functions they document. It checks that:

- Every function parameter has a corresponding `@param` tag
- No extra `@param` tags exist for non-existent parameters
- `@param` tags appear in the same order as function parameters
- Functions that return values have `@returns` tags
- Types and descriptions are present when required

## Examples

### Invalid

```javascript
// Missing @param for 'b'
/**
 * Add two numbers
 * @param {number} a - First number
 * @returns {number} Sum
 */
function add(a, b) {
  return a + b;
}

// Extra @param 'c' that doesn't exist
/**
 * Multiply
 * @param {number} x - First
 * @param {number} y - Second
 * @param {number} c - Third (doesn't exist!)
 */
function multiply(x, y) {
  return x * y;
}

// Wrong parameter order
/**
 * Divide
 * @param {number} divisor - Second param documented first
 * @param {number} dividend - First param documented second
 */
function divide(dividend, divisor) {
  return dividend / divisor;
}

// Missing @returns for function that returns value
/**
 * Get value
 * @param {number} x - Input
 */
function getValue(x) {
  return x * 2;
}
```

### Valid

```javascript
/**
 * Add two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  return a + b;
}

/**
 * Log a message (no return value, no @returns needed)
 * @param {string} message - The message to log
 */
function log(message) {
  console.log(message);
}

/**
 * Sum all numbers
 * @param {...number} nums - Numbers to sum
 * @returns {number} Total
 */
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

## Options

```json
{
  "rules": {
    "lint-my-lines/valid-jsdoc": ["warn", {
      "requireParamDescription": false,
      "requireReturnDescription": false,
      "requireParamType": true,
      "requireReturnType": true,
      "checkParamNames": true,
      "checkParamOrder": true
    }]
  }
}
```

### `requireParamDescription`

When `true`, requires a description for every `@param` tag.

```javascript
// Invalid with requireParamDescription: true
/**
 * @param {number} x
 */
function test(x) {}

// Valid
/**
 * @param {number} x - The input value
 */
function test(x) {}
```

### `requireReturnDescription`

When `true`, requires a description for `@returns` tags.

### `requireParamType`

When `true` (default), requires a type for every `@param` tag.

```javascript
// Invalid with requireParamType: true
/**
 * @param x - Value
 */
function test(x) {}

// Valid
/**
 * @param {number} x - Value
 */
function test(x) {}
```

### `requireReturnType`

When `true` (default), requires a type for `@returns` tags.

### `checkParamNames`

When `true` (default), verifies that `@param` names match function parameter names.

### `checkParamOrder`

When `true` (default), verifies that `@param` tags appear in the same order as function parameters.

## Autofix

This rule provides limited autofix support:

- **Missing `@param`**: Adds a template `@param {*} name - [description]`
- **Missing `@returns`**: Adds a template `@returns {*} [description]`

Autofix does not:
- Remove extra `@param` tags (may be intentional documentation)
- Reorder `@param` tags (could break existing documentation)

## When Not To Use It

- When you use TypeScript and rely on type annotations instead of JSDoc types
- When your project has a different documentation standard
- For internal code where strict documentation isn't necessary

## Related Rules

- [require-jsdoc](./require-jsdoc.md) - Require JSDoc for exported functions
- [jsdoc-type-syntax](./jsdoc-type-syntax.md) - Enforce consistent type syntax
