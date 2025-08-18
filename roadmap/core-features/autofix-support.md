# Feature: Autofix Support

**Parent**: [Core Features](../ROADMAP.md#core-features)

## 1. Summary

This feature will add autofixing capabilities to applicable rules in `lint-my-lines`. When a fixable violation is detected, ESLint will be able to automatically correct the code to match the expected style. This will save developers time and effort, and it will help to ensure consistent comment styles across the codebase.

## 2. Motivation

Manual correction of linting errors can be a tedious and time-consuming process. By providing autofix support, we can significantly improve the developer experience and encourage broader adoption of the plugin. Autofixing is a standard feature in many popular ESLint plugins, and adding it to `lint-my-lines` will make it more competitive and valuable.

## 3. Intended Functionality

When a rule detects a violation that can be safely and automatically corrected, it will report a fix to ESLint. Users can then trigger the fix by running ESLint with the `--fix` flag or by using the autofix feature in their code editor.

### Example: `enforce-capitalization`

If a rule `enforce-capitalization` (as proposed in the roadmap) requires comments to start with a capital letter, it could automatically capitalize the first letter of a non-compliant comment.

**Before:**
```javascript
// this is a comment.
```

**After Autofix:**
```javascript
// This is a comment.
```

## 4. Requirements

- **Safety:** Autofixes must be safe and should never change the semantic meaning of the code. For comment-linting rules, this is generally less of a concern, but it's still an important principle to follow.
- **Rule-by-Rule Implementation:** Autofix support will need to be implemented on a per-rule basis. Not all rules will be able to support autofixing.
- **Clear Commit Messages:** When autofixes are applied via a version control system, the commit messages should be clear about what changes were made.

## 5. Limitations and Dependencies

- **Dependency:** This feature relies on ESLint's built-in support for autofixing. No external dependencies are required.
- **Limitation:** Autofixing is not suitable for all types of violations. For example, if a rule requires a `TODO` comment to have a more descriptive message, this cannot be fixed automatically. The plugin will only be able to fix violations where the intended correction is unambiguous.

## 6. Implementation Sketch

1.  **Identify Fixable Rules:** Determine which existing and proposed rules are candidates for autofixing.
2.  **Update Rule Metadata:** Add the `fixable: "code"` property to the `meta` object of the rule.
3.  **Implement the `fix` function:** When reporting a violation, provide a `fix` function that returns a `fix` object. This object describes the range of text to be replaced and the new text to be inserted.
4.  **Add Tests:** Create new test cases to verify that the autofixing logic works as expected. These tests should check that the code is correctly transformed and that no unintended side effects occur.
