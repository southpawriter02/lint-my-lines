# require-jsdoc

Require JSDoc comments for exported functions.

## Rule Details

This rule enforces that all exported functions, classes, and methods have JSDoc documentation. It helps ensure that public APIs are properly documented for consumers of your code.

### What counts as "exported"?

- `export function foo() {}` - Named exports
- `export default function() {}` - Default exports
- `export const foo = () => {}` - Exported arrow functions
- `module.exports = function() {}` - CommonJS exports
- `module.exports.foo = function() {}` - CommonJS named exports
- `exports.foo = function() {}` - CommonJS exports shorthand

## Examples

### Invalid

```javascript
// Missing JSDoc on exported function
export function add(a, b) {
  return a + b;
}

// Missing JSDoc on exported arrow function
export const multiply = (x, y) => x * y;

// Missing JSDoc on default export
export default function() {
  return 42;
}

// Missing JSDoc on module.exports
module.exports = function(x) {
  return x * 2;
};
```

### Valid

```javascript
/**
 * Add two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
export function add(a, b) {
  return a + b;
}

/**
 * Multiply two numbers
 * @param {number} x - First factor
 * @param {number} y - Second factor
 * @returns {number} The product
 */
export const multiply = (x, y) => x * y;

// Non-exported functions don't require JSDoc
function internalHelper() {
  return 42;
}
```

## Options

```json
{
  "rules": {
    "lint-my-lines/require-jsdoc": ["warn", {
      "require": {
        "FunctionDeclaration": true,
        "ArrowFunctionExpression": true,
        "FunctionExpression": true,
        "ClassDeclaration": true,
        "MethodDefinition": true
      },
      "exemptEmptyFunctions": false,
      "minLineCount": 0
    }]
  }
}
```

### `require`

An object specifying which types of exported constructs require JSDoc:

- `FunctionDeclaration` (default: `true`) - Check `function foo() {}`
- `ArrowFunctionExpression` (default: `true`) - Check `const foo = () => {}`
- `FunctionExpression` (default: `true`) - Check `const foo = function() {}`
- `ClassDeclaration` (default: `true`) - Check `class Foo {}`
- `MethodDefinition` (default: `true`) - Check class methods

### `exemptEmptyFunctions`

When `true`, functions with empty bodies (no statements) are exempt from requiring JSDoc.

```javascript
// With exemptEmptyFunctions: true, this is valid
export function noop() {}
```

### `minLineCount`

Only require JSDoc for functions that span at least this many lines. Set to `0` (default) to require JSDoc for all functions.

```javascript
// With minLineCount: 5, this short function doesn't require JSDoc
export const double = x => x * 2;
```

## Autofix

This rule provides autofix support. When a function is missing JSDoc, the fixer will generate a template:

```javascript
// Before
export function greet(name, age) {
  return `Hello, ${name}! You are ${age} years old.`;
}

// After autofix
/**
 * [Description]
 * @param {*} name - [description]
 * @param {*} age - [description]
 * @returns {*} [description]
 */
export function greet(name, age) {
  return `Hello, ${name}! You are ${age} years old.`;
}
```

The autofix:
- Detects parameters and adds `@param` tags
- Detects if the function returns a value and adds `@returns`
- Handles rest parameters (`...args`) with `{...*}` type
- Handles default parameters as optional `[param]`

## When Not To Use It

- When you have a separate documentation system that doesn't use JSDoc
- For internal/private code where documentation requirements are less strict
- When using TypeScript with strict type checking (types provide some documentation)

## Related Rules

- [valid-jsdoc](./valid-jsdoc.md) - Validate JSDoc content matches function signatures
- [jsdoc-type-syntax](./jsdoc-type-syntax.md) - Enforce consistent type syntax
