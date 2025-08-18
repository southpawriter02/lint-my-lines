# Feature: Pre-commit Hook

**Parent**: [Integrations](../ROADMAP.md#integrations)

## 1. Summary

This feature will provide guidance and support for integrating `lint-my-lines` into a pre-commit workflow. A pre-commit hook is a script that runs before a commit is made, and it can be used to automatically lint the code and prevent commits that have style violations.

## 2. Motivation

Running the linter in a pre-commit hook is a powerful way to enforce coding standards. It provides immediate feedback to the developer and helps to keep the codebase clean and consistent. By providing clear instructions on how to set this up, we can make it easier for teams to incorporate `lint-my-lines` into their development process.

## 3. Intended Functionality

We will not be building a pre-commit hook from scratch. Instead, we will provide documentation and examples for how to use `lint-my-lines` with popular pre-commit frameworks like `husky` and `pre-commit`.

### Example with `husky`

The documentation will include a step-by-step guide for setting up `husky` to run `eslint` on staged files before each commit.

```json
// package.json
{
  "scripts": {
    "lint": "eslint ."
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint"
    }
  }
}
```

## 4. Requirements

- **Clear Documentation:** The documentation must be easy to follow for developers who may not be familiar with pre-commit hooks.
- **Support for Popular Tools:** We should provide examples for at least two popular pre-commit frameworks (`husky` and `pre-commit`).
- **Focus on Staged Files:** The examples should demonstrate how to run the linter only on the files that are being committed, as this is more efficient than linting the entire project.

## 5. Limitations and Dependencies

- **Dependency:** This feature depends on third-party pre-commit hook frameworks. The user will need to install and configure these tools themselves.
- **Limitation:** The effectiveness of the pre-commit hook is dependent on the user's local development environment. It is not a substitute for server-side checks, such as those in a CI/CD pipeline.

## 6. Implementation Sketch

1.  **Research:** Investigate the best practices for integrating ESLint with `husky` and `pre-commit`.
2.  **Write Documentation:** Create a new documentation page that explains the benefits of pre-commit hooks and provides clear, step-by-step instructions for setting them up.
3.  **Create Example Configurations:** Provide example configuration files that users can copy and paste into their projects.
4.  **Add to Main Roadmap:** Link to the new documentation from the main `ROADMAP.md` file.
