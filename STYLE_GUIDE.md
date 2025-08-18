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

#### Conditions and Considerations

Use comments to explain:

*   **Business Logic:** The reasons behind specific rules or constraints that originate from business requirements.
*   **Performance Trade-offs:** Why a less-than-obvious implementation was chosen for performance reasons (e.g., using a bitwise operation instead of a standard arithmetic one).
*   **Complex Algorithms:** The high-level idea behind a complex or non-trivial algorithm.
*   **Workarounds:** Why a piece of code is necessary to work around a known issue in a library or platform.

#### Examples

**👎 Bad:**
```javascript
// a is incremented by 1
a++;
```

**👍 Good (Explaining a Workaround):**
```javascript
// We increment 'a' here to account for the off-by-one error
// that occurs in the legacy data processing library.
// See ticket #42 for more details.
a++;
```

**👍 Good (Explaining Business Logic):**
```javascript
// By business requirement, VIP users get a 24-hour grace period
// for payments. This adds a day to the due date for them.
if (user.isVIP) {
  dueDate.add(1, 'day');
}
```

**👍 Good (Explaining a Performance Trade-off):**
```javascript
// Using bitwise NOT for flooring is faster than Math.floor().
// This is a performance-critical path for our rendering engine.
const flooredValue = ~~someFloat;
```

### 2. Standardize Action-Oriented Comments

Action-oriented comments like `TODO` and `FIXME` are essential for tracking required future work directly in the code. To make them effective and searchable, they must follow a standard format.

#### `TODO`: For Planned Features or Improvements

Use `TODO` to mark a place in the code where a planned feature, refactoring, or improvement will be added. It signifies that something is missing but the current code is not broken.

*   **Format:** `// TODO (context): Description of the task.`
*   **Context:** Should be a ticket ID (e.g., `TICKET-123`) or a username and date (e.g., `jules, 2025-08-18`).

**👍 Good:**
```javascript
// TODO (TICKET-123): Refactor this to use the new UserSettings API once it's available.
// TODO (jules, 2025-08-18): Add support for more file formats.
```

**👎 Bad:**
```javascript
// TODO: Fix this later
// TODO: remember to add more stuff
```

#### `FIXME`: For Known Bugs That Need Fixing

Use `FIXME` to mark a piece of code that is known to be broken or has a bug that needs to be corrected. Unlike `TODO`, `FIXME` implies that the code is not working as intended.

*   **Format:** `// FIXME (context): Description of the problem.`
*   **Context:** Should be a ticket ID or a username and date.

**👍 Good:**
```javascript
// FIXME (BUG-456): This calculation is incorrect for leap years.
// FIXME (jules, 2025-08-18): The current implementation causes a memory leak under heavy load.
```

**👎 Bad:**
```javascript
// FIXME: This is broken.
```

#### `NOTE`: For Explanatory Remarks

Use `NOTE` to draw attention to a particularly clever or important piece of code that might otherwise be overlooked. It's not for action items but for clarification.

*   **Format:** `// NOTE (context): Explanation.`
*   **Context:** Usually a username or a relevant keyword.

**👍 Good:**
```javascript
// NOTE (jules): This recursive approach is significantly more readable
// than an iterative one and the performance impact is negligible here.
```

### 3. Formatting and Style

How comments are written is just as important as what they say. Consistent formatting makes comments easier to read and parse.

#### Use Markdown for Readability

Use markdown elements like lists, bolding, and code fences to structure complex comments and improve their readability.

**👍 Good:**
```javascript
/**
 * Processes a user's shopping cart.
 *
 * Key considerations:
 * - Calculates sales tax based on the user's location.
 * - Applies discounts in a specific order:
 *   1. Coupon codes
 *   2. Loyalty points
 *   3. Special promotions
 * - `inventory` is not checked here; it's assumed to be handled upstream.
 */
```

#### Keep Line Lengths Reasonable

Long lines of comments can be hard to read, especially in a side-by-side code review tool. Aim to wrap comment lines at around 80-100 characters.

#### Block vs. Inline Comments

*   **Block Comments:** Use block comments (`/* ... */` or multiple `//`) for file headers, function documentation, and complex explanations.
*   **Inline Comments:** Use inline comments (`//`) for short, targeted remarks on a specific line of code. Place them on the line above the code they refer to, not at the end of the line.

**👎 Bad (End-of-line comment):**
```javascript
const threshold = 100; // Do not exceed this value
```

**👍 Good (Comment on preceding line):**
```javascript
// The threshold must not be exceeded to prevent buffer overflows.
const threshold = 100;
```

#### Avoid Commented-Out Code

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

#### Keep Comments Concise

While comments should be informative, they should also be as concise as possible. Avoid writing long, rambling paragraphs. If a more detailed explanation is needed, consider moving it to external documentation and linking to it from the comment.

**👎 Bad:**
```javascript
// This function is responsible for taking the user's input, which is expected to be a string, and then it processes this string by first trimming any whitespace from the beginning and the end. After that, it converts the string to lowercase to ensure case-insensitive comparison later on. Finally, it returns the processed string.
function processInput(input) {
  return input.trim().toLowerCase();
}
```

### 4. Function and Method Documentation

All public functions and methods should have a comment block that explains their purpose, parameters, and return values. This is crucial for making the code usable by others without them needing to read the entire implementation.

We recommend a format similar to JSDoc for this.

#### Structure

*   **Description:** A brief, one-sentence summary of what the function does.
*   **Parameters (`@param`):** Describe each parameter, its type, and what it's used for.
*   **Return Value (`@returns`):** Describe what the function returns, including its type.

#### Example

**👍 Good:**
```javascript
/**
 * Calculates the final price of an item after applying a discount.
 *
 * @param {number} basePrice - The original price of the item.
 * @param {number} discountPercentage - The discount to apply, from 0 to 1.
 * @returns {number} The final price after the discount is applied.
 */
function calculateFinalPrice(basePrice, discountPercentage) {
  return basePrice * (1 - discountPercentage);
}
```

### 5. File Header Comments

Every file should start with a header comment that provides a summary of the file's purpose and contents. This gives readers a high-level overview before they dive into the code.

#### Structure

*   **Description:** A brief summary of the responsibility of the code in the file.
*   **Author (Optional):** The original author of the file.
*   **Link to Docs/Ticket (Optional):** A link to relevant external documentation or the main project ticket.

#### Example

**👍 Good:**
```javascript
/**
 * @file This file contains the main business logic for processing customer orders.
 * @author jules@example.com
 * @see TICKET-789
 */

// ... rest of the file's code
```

**👎 Bad (Missing a proper header):**
```javascript
// Order processing logic
```
