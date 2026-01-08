# valid-tsdoc

Validate TSDoc-specific tags in TypeScript documentation.

## Rule Details

This rule validates [TSDoc](https://tsdoc.org/)-specific tags that extend standard JSDoc. TSDoc provides additional documentation tags commonly used in TypeScript projects for documenting generics, stability, and API visibility.

The rule checks for:

- Unknown documentation tags (neither JSDoc nor TSDoc standard)
- Banned tags that your team has disallowed
- Proper `@typeParam` usage for generic type parameters
- Required `@remarks` sections on public APIs

## TSDoc Tags

The following TSDoc-specific tags are recognized:

| Tag | Purpose |
|-----|---------|
| `@typeParam` | Document generic type parameters |
| `@remarks` | Extended description section |
| `@defaultValue` | Default value documentation |
| `@privateRemarks` | Internal documentation (stripped in builds) |
| `@sealed` | Class cannot be extended |
| `@virtual` | Method can be overridden |
| `@override` | Method overrides parent |
| `@eventProperty` | Event property marker |
| `@beta`, `@alpha` | API stability markers |
| `@public`, `@internal` | API visibility markers |
| `@packageDocumentation` | Package-level documentation |
| `@decorator` | Decorator documentation |
| `@inheritDoc` | Inherit documentation from parent |
| `@label` | Cross-reference label |
| `@link` | Inline link |

## Examples

### Invalid

```typescript
// Unknown tag
/**
 * Process data
 * @foobar This is not a valid tag
 */
function process(data: unknown) {}

// Banned tag
/**
 * Old function
 * @deprecated Use newFunction instead
 */
function oldFunction() {}  // With bannedTags: ["deprecated"]

// Missing @typeParam
/**
 * Generic container
 */
function Container<T>() {}  // With requireTypeParam: true

// Duplicate @typeParam
/**
 * Generic function
 * @typeParam T - First definition
 * @typeParam T - Duplicate!
 */
function generic<T>() {}

// Missing @remarks on public API
/**
 * Public function
 * @param name - The name
 */
export function publicFunc(name: string) {}  // With requireRemarks: true
```

### Valid

```typescript
/**
 * Add two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The sum
 */
function add(a: number, b: number): number {
  return a + b;
}

/**
 * Generic container for type-safe storage
 * @typeParam T - The type of items in the container
 * @remarks This class provides type-safe storage with automatic cleanup
 * @beta
 */
class Container<T> {
  private items: T[] = [];
}

/**
 * Process data with a transformer
 * @param data - Input data
 * @typeParam T - Output type
 * @remarks Transforms data according to the provided rules
 * @internal
 */
function process<T>(data: unknown): T {
  return data as T;
}

/**
 * Override parent method
 * @override
 */
function method() {}

/**
 * Configuration options
 * @defaultValue \{ timeout: 1000 \}
 */
const config = {};
```

## Options

```json
{
  "rules": {
    "lint-my-lines/valid-tsdoc": ["warn", {
      "requireTypeParam": false,
      "allowedTags": [],
      "bannedTags": [],
      "requireRemarks": false
    }]
  }
}
```

### `requireTypeParam`

When `true`, requires `@typeParam` documentation for every generic type parameter.

```typescript
// Invalid with requireTypeParam: true
/**
 * Container class
 */
class Container<T, U> {}

// Valid
/**
 * Container class
 * @typeParam T - The key type
 * @typeParam U - The value type
 */
class Container<T, U> {}
```

### `allowedTags`

Array of additional tag names to allow beyond the standard JSDoc and TSDoc tags.

```json
{
  "allowedTags": ["customTag", "internalNote"]
}
```

### `bannedTags`

Array of tags to disallow. Can be strings or objects with custom reasons:

```json
{
  "bannedTags": [
    "deprecated",
    { "tag": "constructor", "reason": "Use ES6 class syntax instead." }
  ]
}
```

### `requireRemarks`

When `true`, requires `@remarks` section for public API declarations. Default: `false`

**What counts as "public API":**

The rule considers these as public API (requiring `@remarks` when enabled):

| Declaration Type | When Required |
|-----------------|---------------|
| `export function` | Always |
| `export class` | Always |
| `export interface` | Always |
| `export type` | Always |
| `export const` (functions) | When value is a function |
| `export default` | Always |

**Not required for:**

- Non-exported declarations (internal functions, private classes)
- `export const` with non-function values (strings, numbers, objects)
- Method definitions inside classes (only the class itself needs `@remarks`)

```typescript
// Invalid with requireRemarks: true
/**
 * Public utility function
 * @param value - The input value
 */
export function processValue(value: string) {}

// Valid
/**
 * Public utility function
 * @param value - The input value
 * @remarks This function is designed for high-frequency calls
 * and uses memoization internally for performance.
 */
export function processValue(value: string) {}
```

```typescript
// These do NOT require @remarks (not public API):

/** Internal helper - no @remarks needed */
function helperFunction() {}

/** Configuration constant - no @remarks needed */
export const CONFIG_VALUE = 42;
```

## Autofix

This rule does not provide autofix as documentation content requires human judgment.

## When Not To Use It

- When your TypeScript project doesn't use TSDoc conventions
- When you prefer minimal documentation without strict tag validation
- For internal code where TSDoc compliance isn't necessary

## Related Rules

- [valid-jsdoc](./valid-jsdoc.md) - Validate JSDoc comments match function signatures
- [require-jsdoc](./require-jsdoc.md) - Require JSDoc for exported functions
- [jsdoc-type-syntax](./jsdoc-type-syntax.md) - Enforce consistent type syntax
