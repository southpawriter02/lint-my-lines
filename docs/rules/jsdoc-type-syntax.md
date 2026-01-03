# jsdoc-type-syntax

Enforce consistent type syntax in JSDoc comments.

## Rule Details

This rule enforces consistent casing of primitive types in JSDoc comments. By default, it enforces TypeScript-style lowercase types (`string`, `number`, `boolean`) instead of capitalized JSDoc-style types (`String`, `Number`, `Boolean`).

### Type Mappings

| TypeScript Style (default) | JSDoc Style |
|---------------------------|-------------|
| `string` | `String` |
| `number` | `Number` |
| `boolean` | `Boolean` |
| `object` | `Object` |
| `function` | `Function` |
| `array` | `Array` |
| `symbol` | `Symbol` |
| `bigint` | `BigInt` |
| `null` | `Null` |
| `undefined` | `Undefined` |

## Examples

### Invalid (default TypeScript mode)

```javascript
/**
 * @param {String} name - The name
 */
function greet(name) {}

/**
 * @param {Number} x - Value
 * @returns {Boolean} Result
 */
function isPositive(x) {
  return x > 0;
}

/**
 * @param {Array<String>} names - List of names
 */
function greetAll(names) {}
```

### Valid (default TypeScript mode)

```javascript
/**
 * @param {string} name - The name
 */
function greet(name) {}

/**
 * @param {number} x - Value
 * @returns {boolean} Result
 */
function isPositive(x) {
  return x > 0;
}

/**
 * @param {Array<string>} names - List of names
 */
function greetAll(names) {}

// Custom types are not affected
/**
 * @param {MyClass} instance - Instance
 * @param {UserConfig} config - Configuration
 */
function setup(instance, config) {}
```

## Options

```json
{
  "rules": {
    "lint-my-lines/jsdoc-type-syntax": ["warn", {
      "prefer": "typescript",
      "typeMap": {}
    }]
  }
}
```

### `prefer`

- `"typescript"` (default) - Enforce lowercase primitive types (`string`, `number`, etc.)
- `"jsdoc"` - Enforce capitalized primitive types (`String`, `Number`, etc.)

```javascript
// With prefer: "jsdoc"
/**
 * @param {String} name - Valid in jsdoc mode
 */
function greet(name) {}
```

### `typeMap`

Custom type mappings to enforce. This extends the default mappings.

```json
{
  "rules": {
    "lint-my-lines/jsdoc-type-syntax": ["warn", {
      "prefer": "typescript",
      "typeMap": {
        "int": "number",
        "float": "number",
        "bool": "boolean"
      }
    }]
  }
}
```

With this configuration:

```javascript
// Invalid
/**
 * @param {int} count - Count
 */
function process(count) {}

// Valid (after autofix)
/**
 * @param {number} count - Count
 */
function process(count) {}
```

## Autofix

This rule provides full autofix support. It will replace incorrect type names with the preferred style:

```javascript
// Before
/**
 * @param {String} name - Name
 * @param {Number} age - Age
 * @returns {Boolean} Valid
 */
function validate(name, age) {
  return true;
}

// After autofix (typescript mode)
/**
 * @param {string} name - Name
 * @param {number} age - Age
 * @returns {boolean} Valid
 */
function validate(name, age) {
  return true;
}
```

The autofix handles:
- Simple types: `{String}` → `{string}`
- Generic types: `{Array<String>}` → `{Array<string>}`
- Union types: `{String|Number}` → `{string|number}`
- Nullable types: `{?String}` → `{?string}`
- Multiple types in one comment

## When Not To Use It

- When your team prefers capitalized JSDoc-style types
- When mixing with tools that require specific type casing
- When you don't care about type casing consistency

## Related Rules

- [require-jsdoc](./require-jsdoc.md) - Require JSDoc for exported functions
- [valid-jsdoc](./valid-jsdoc.md) - Validate JSDoc content matches function signatures
