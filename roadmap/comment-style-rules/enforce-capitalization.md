# Feature: Enforce Capitalization

**Parent**: [Comment Style Rules](../ROADMAP.md#comment-style-rules)

## 1. Summary

This feature introduces a new ESLint rule to enforce a consistent capitalization style for comments. The primary use case is to ensure that all comments begin with a capital letter, which is a common convention in many style guides.

## 2. Motivation

Consistent capitalization makes comments easier to read and gives the codebase a more professional and polished appearance. Automating this check with a linter rule helps to maintain this consistency without requiring manual effort from developers during code reviews.

## 3. Intended Functionality

The rule will check the first letter of each comment and report a violation if it does not match the configured capitalization style.

### Configuration

The rule will be configurable with the following options:

- `style`: The desired capitalization style. Possible values are `always` (the first letter must be uppercase) or `never` (the first letter must be lowercase). (Default: `always`)

```json
{
  "plugins": [
    "lint-my-lines"
  ],
  "rules": {
    "lint-my-lines/enforce-capitalization": [
      "warn",
      {
        "style": "always"
      }
    ]
  }
}
```

### Autofix

This rule is a good candidate for autofixing. It can automatically convert the first letter of a comment to the correct case.

## 4. Requirements

- **Ignore certain comments:** The rule should have a mechanism to ignore certain comments, such as those that are part of a code example or those that contain only a URL.
- **Whitespace Handling:** The rule should correctly handle leading whitespace in comments.
- **Clear Error Messages:** The error message should clearly state the expected capitalization style.

## 5. Limitations and Dependencies

- **Dependency:** This is a new, standalone rule and has no external dependencies.
- **Limitation:** The rule will not be able to handle complex cases, such as comments that start with an acronym or a non-alphabetic character. It will focus on the most common case of comments starting with a letter.

## 6. Implementation Sketch

1.  **Create New Rule File:** Create a new file `enforce-capitalization.js` in the `lib/rules` directory.
2.  **Define Metadata:** Set up the `meta` object with the rule's description, category, `fixable` property, and schema for the configuration options.
3.  **Implement `create` function:**
    - Access the user-defined options from `context.options`.
    - Use `sourceCode.getAllComments()` to get all comments in the file.
    - For each comment, check the first letter and compare it to the configured `style`.
    - If there is a violation, report it with a `fix` function that replaces the first letter with its capitalized or lowercased equivalent.
4.  **Add Documentation:** Create a new documentation file for the rule, explaining its purpose, options, and providing examples of correct and incorrect code.
5.  **Add Tests:** Write tests to cover different capitalization styles, edge cases, and the autofixing logic.
