# Feature: Ban Specific Words in Comments

**Parent**: [Comment Style Rules](../ROADMAP.md#comment-style-rules)

## 1. Summary

This feature introduces a new ESLint rule that allows teams to ban a custom list of words or phrases from being used in comments. This can help to enforce style guidelines, discourage the use of non-inclusive language, or prevent the inclusion of temporary or sensitive information in comments.

## 2. Motivation

Different teams have different communication styles and standards. This rule provides a flexible way to enforce those standards automatically. For example, a team might want to ban words like "guys" in favor of more inclusive alternatives, or they might want to prevent developers from committing code with comments like "FIXME" or "HACK".

## 3. Intended Functionality

The rule will scan all comments for the presence of any of the banned words or phrases. If a banned term is found, it will report a violation.

### Configuration

Users will configure the rule with an array of banned words. The check will be case-insensitive by default, but this can be configured.

```json
{
  "plugins": [
    "lint-my-lines"
  ],
  "rules": {
    "lint-my-lines/ban-specific-words": [
      "warn",
      {
        "words": ["fixme", "hack", "guys"],
        "caseSensitive": false
      }
    ]
  }
}
```

## 4. Requirements

- **Customizable Word List:** The list of banned words must be easily configurable by the user.
- **Case Sensitivity:** The rule should offer an option for case-sensitive matching.
- **Clear Error Messages:** The error message should indicate which banned word was found.
- **Whole Word Matching:** The rule should have an option to match whole words only, to avoid flagging words that contain a banned term as a substring (e.g., "push" in "pushing").

## 5. Limitations and Dependencies

- **Dependency:** This is a new, standalone rule and has no external dependencies.
- **Limitation:** The rule will not be able to understand the context in which a word is used. It will simply flag the presence of the word in a comment.

## 6. Implementation Sketch

1.  **Create New Rule File:** Create a new file `ban-specific-words.js` in the `lib/rules` directory.
2.  **Define Metadata:** Set up the `meta` object with the rule's description, category, and schema for the configuration options.
3.  **Implement `create` function:**
    - Access the list of banned words from `context.options`.
    - Use `sourceCode.getAllComments()` to get all comments.
    - For each comment, iterate through the list of banned words and check if the comment's text contains any of them.
    - If a banned word is found, report a violation.
4.  **Add Documentation:** Create a new documentation file for the rule, explaining its purpose, options, and providing examples.
5.  **Add Tests:** Write tests to cover various scenarios, including case sensitivity, whole word matching, and different comment types.
