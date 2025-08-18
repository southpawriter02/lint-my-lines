# Feature: GitHub Action

**Parent**: [Integrations](../ROADMAP.md#integrations)

## 1. Summary

This feature will provide a dedicated GitHub Action for `lint-my-lines`. This action will make it easy to integrate comment style linting into a CI/CD pipeline, allowing teams to automatically check for violations in pull requests.

## 2. Motivation

While pre-commit hooks are useful for catching errors locally, they can be bypassed. A server-side check in a CI/CD pipeline is a more robust way to enforce coding standards. A dedicated GitHub Action will make it simple for teams using GitHub to add `lint-my-lines` to their workflows.

## 3. Intended Functionality

The GitHub Action will be published to the GitHub Marketplace. Users will be able to add it to their workflows with a few lines of YAML. The action will run `eslint` with the `lint-my-lines` plugin and report any violations.

### Example Workflow

```yaml
name: Lint Comments
on: [pull_request]

jobs:
  lint-comments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run lint-my-lines
        uses: southpawriter02/lint-my-lines-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 4. Requirements

- **Ease of Use:** The action should be simple to configure and use.
- **Good Defaults:** The action should have sensible defaults, but also allow for customization.
- **Clear Output:** The output of the action should be clear and easy to understand, making it simple to identify and fix any violations.
- **Annotations:** The action should use GitHub's annotation feature to display linting errors directly in the pull request's "Files changed" tab.

## 5. Limitations and Dependencies

- **Dependency:** This feature requires the user to be using GitHub and GitHub Actions.
- **Limitation:** The action will only be able to lint the files that are available in the repository at the time the workflow is run.

## 6. Implementation Sketch

1.  **Create a New Repository:** A new repository will be needed for the GitHub Action (e.g., `lint-my-lines-action`).
2.  **Develop the Action:** The action will be developed using JavaScript or TypeScript and the GitHub Actions toolkit. It will essentially be a wrapper around the `eslint` command-line interface.
3.  **Publish to Marketplace:** The action will be published to the GitHub Marketplace, which will involve creating a detailed `action.yml` file and adding it to the new repository.
4.  **Write Documentation:** Clear documentation will be created for the action, explaining how to use it and what configuration options are available.
5.  **Add to Main Roadmap:** Link to the new action and its documentation from the main `ROADMAP.md` file.
