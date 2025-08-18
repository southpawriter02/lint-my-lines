# lint-my-lines Style Guide

This document outlines the style guide for writing clear, effective, and maintainable code comments. The rules in this guide are enforced by the `eslint-plugin-lint-my-lines` linter.

## Guiding Principles

The purpose of a comment is to explain the **"why"** behind the code, not the **"what"**. Good code should be self-documenting, but comments are crucial for providing context that the code itself cannot, such as:

*   The reasoning behind a complex implementation.
*   Links to external documentation or issue trackers.
*   Clarification of business logic or constraints.

## Rules

### 1. Explain "Why," Not "What"

Comments should provide context that is not immediately obvious from reading the code. Avoid comments that simply restate what the code is doing.

**👎 Bad:**
```javascript
// a is incremented by 1
a++;
```

**👍 Good:**
```javascript
// We increment 'a' here to account for the off-by-one error
// that occurs in the legacy data processing library.
// See ticket #42 for more details.
a++;
```

### 2. Standardize TODO Comments

`TODO` comments are useful for marking areas of the code that need future attention. To make them effective, they must follow a standard format.

All `TODO` comments must include a reference to a ticket number or a user/author and a date.

**👎 Bad:**
```javascript
// TODO: Fix this later
```

**👍 Good:**
```javascript
// TODO (TICKET-123): Refactor this to use the new API
// TODO (jules, 2025-08-18): Remove this workaround once the upstream bug is fixed.
```

### 3. Avoid Commented-Out Code

Do not leave blocks of commented-out code in the codebase. If you need to save code for later, use your version control system (e.g., Git branches or stashes). Commented-out code clutters the codebase and can become outdated.

**👎 Bad:**
```javascript
// function oldImplementation(a, b) {
//   return a - b;
// }
function newImplementation(a, b) {
  return a + b;
}
```

**👍 Good:**
```javascript
// The previous implementation had a bug in subtraction.
// The new implementation correctly performs addition.
function newImplementation(a, b) {
  return a + b;
}
```

### 4. Keep Comments Concise

While comments should be informative, they should also be as concise as possible. Avoid writing long, rambling paragraphs. If a more detailed explanation is needed, consider moving it to external documentation and linking to it from the comment.

**👎 Bad:**
```javascript
// This function is responsible for taking the user's input, which is expected to be a string, and then it processes this string by first trimming any whitespace from the beginning and the end. After that, it converts the string to lowercase to ensure case-insensitive comparison later on. Finally, it returns the processed string.
function processInput(input) {
  return input.trim().toLowerCase();
}
```

**👍 Good:**
```javascript
// Cleans and normalizes user input for case-insensitive matching.
function processInput(input) {
  return input.trim().toLowerCase();
}
```
