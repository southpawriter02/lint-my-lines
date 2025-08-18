# Feature: Enforce Comment Length

**Parent**: [Comment Style Rules](../ROADMAP.md#comment-style-rules)

## 1. Summary

This feature introduces a new ESLint rule to enforce a consistent length for comments. The rule will be configurable, allowing users to set both a minimum and a maximum length for single-line and block comments.

## 2. Motivation

The length of a comment can impact its readability and usefulness. Very short comments may lack sufficient context to be helpful, while overly long comments can be difficult to parse and may indicate that the code itself is too complex. By enforcing a consistent comment length, we can encourage developers to write comments that are both concise and informative.

## 3. Intended Functionality

The rule will check the length of each comment and report a violation if it falls outside the configured range.

### Configuration

Users will be able to configure the rule in their `.eslintrc` file with the following options:

- `minLength`: The minimum number of characters a comment must have. (Default: `10`)
- `maxLength`: The maximum number of characters a comment can have. (Default: `80`)
- `ignoreUrls`: A boolean to indicate whether to exclude URLs from the length check. (Default: `true`)

```json
{
  "plugins": [
    "lint-my-lines"
  ],
  "rules": {
    "lint-my-lines/enforce-comment-length": [
      "warn",
      {
        "minLength": 15,
        "maxLength": 100,
        "ignoreUrls": true
      }
    ]
  }
}
```

## 4. Requirements

- **Separate Checks:** The rule should be able to distinguish between single-line (`//`) and block (`/* */`) comments, as they may have different length requirements.
- **Whitespace Handling:** The rule should clarify how it handles leading and trailing whitespace in comments.
- **Clear Error Messages:** The error messages should be informative, indicating whether the comment is too short or too long and what the configured limits are.

## 5. Limitations and Dependencies

- **Dependency:** This is a new, standalone rule and has no external dependencies.
- **Limitation:** The rule will not be able to understand the context or quality of a comment. It is a purely stylistic rule based on character count.

## 6. Implementation Sketch

1.  **Create New Rule File:** Create a new file `enforce-comment-length.js` in the `lib/rules` directory.
2.  **Define Metadata:** Set up the `meta` object with the rule's description, category, and schema for the configuration options.
3.  **Implement `create` function:**
    - Access the user-defined options from `context.options`.
    - Use `sourceCode.getAllComments()` to get all comments in the file.
    - Iterate over the comments, calculate their length, and compare it to the configured `minLength` and `maxLength`.
    - If a comment's length is outside the valid range, report a violation using `context.report()`.
4.  **Add Documentation:** Create a new documentation file for the rule, explaining its purpose, options, and providing examples of correct and incorrect code.
5.  **Add Tests:** Write comprehensive tests to cover various scenarios, including different comment types, lengths, and configuration options.
