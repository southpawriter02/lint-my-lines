# comment-code-ratio

Report files with too few or too many comments based on a configurable ratio.

## Rule Details

This rule analyzes the ratio of comment lines to code lines in a file and warns when the ratio falls outside the acceptable range. This helps maintain consistent documentation levels across your codebase.

### Calculation

```
ratio = commentLines / codeLines
```

- **Code lines**: Non-blank lines that are not comments
- **Comment lines**: Lines containing comments
- **Blank lines**: Excluded from the calculation

### How Multi-Line Comments Are Counted

Multi-line comments count each line they span:

```javascript
/*
 * This block comment
 * spans 4 lines
 */  // Counts as 4 comment lines

/**
 * This JSDoc comment
 * @param name - The name
 * @returns The greeting
 */  // Counts as 5 comment lines

// Single line comment  // Counts as 1 comment line
```

**Important:** The line count is based on the actual lines spanned in the source file, not the number of logical "statements" in the comment.

```javascript
/* Short block on one line */  // Counts as 1 comment line

/*
Same content
but on multiple lines
*/  // Counts as 4 comment lines
```

### Examples

❌ **Too few comments** (under 5% by default):

```javascript
function processData(data) {
  const result = data.map(item => item.value);
  const filtered = result.filter(v => v > 0);
  const sorted = filtered.sort((a, b) => b - a);
  const limited = sorted.slice(0, 10);
  return limited.reduce((sum, v) => sum + v, 0);
}
// (100 lines of code, 2 comment lines = 2%)
```

❌ **Too many comments** (over 40% by default):

```javascript
// This function processes data
// It takes an array as input
// Returns the sum of top 10 values
// Uses functional programming
// Map, filter, sort, slice, reduce
function processData(data) {
  return data.reduce((a, b) => a + b, 0);
}
// (2 lines of code, 5 comment lines = 250%)
```

✅ **Good ratio** (between 5% and 40%):

```javascript
/**
 * Process data and return sum of top values.
 * @param {number[]} data - Input array
 * @returns {number} Sum of top 10 positive values
 */
function processData(data) {
  const filtered = data.filter(v => v > 0);
  const sorted = filtered.sort((a, b) => b - a);
  return sorted.slice(0, 10).reduce((sum, v) => sum + v, 0);
}
```

## Options

```json
{
  "lint-my-lines/comment-code-ratio": ["warn", {
    "minRatio": 0.05,
    "maxRatio": 0.40,
    "minFileLines": 20,
    "excludeJSDoc": false,
    "excludeTodo": false
  }]
}
```

### `minRatio` (default: `0.05`)

Minimum comment-to-code ratio (5%). Files below this threshold trigger `tooFewComments`.

### `maxRatio` (default: `0.40`)

Maximum comment-to-code ratio (40%). Files above this threshold trigger `tooManyComments`.

### `minFileLines` (default: `20`)

Minimum file size (in lines) to check. Small files are skipped.

### `excludeJSDoc` (default: `false`)

Exclude JSDoc comments from the ratio calculation:

```json
{
  "excludeJSDoc": true
}
```

Useful when you want to focus on inline comments rather than API documentation.

### `excludeTodo` (default: `false`)

Exclude TODO/FIXME/NOTE comments from the ratio calculation:

```json
{
  "excludeTodo": true
}
```

Useful when action items shouldn't count toward documentation ratio.

## Messages

| Message ID | Description |
|------------|-------------|
| `tooFewComments` | File has too few comments ({{actual}}%, min: {{min}}%) |
| `tooManyComments` | File has too many comments ({{actual}}%, max: {{max}}%) |
| `noComments` | File has no comments |

## Configuration Examples

### Stricter documentation requirements

```json
{
  "lint-my-lines/comment-code-ratio": ["error", {
    "minRatio": 0.10,
    "maxRatio": 0.30
  }]
}
```

### Skip small files, focus on larger modules

```json
{
  "lint-my-lines/comment-code-ratio": ["warn", {
    "minFileLines": 50,
    "minRatio": 0.08
  }]
}
```

### Count only inline comments

```json
{
  "lint-my-lines/comment-code-ratio": ["warn", {
    "excludeJSDoc": true,
    "excludeTodo": true
  }]
}
```

## When Not to Use This Rule

- For generated code or configuration files
- In test files where less documentation is expected
- When using external documentation tools

## Related Rules

- [require-jsdoc](./require-jsdoc.md) - Require JSDoc for exported functions
- [no-obvious-comments](./no-obvious-comments.md) - Detect low-value comments
- [require-explanation-comments](./require-explanation-comments.md) - Require comments for complex code
