# lint-my-lines

`lint-my-lines` is an ESLint plugin that provides a set of rules to enforce a clear, effective, and maintainable style for code comments.

Good comments are a crucial part of high-quality code, but they are often neglected. This project aims to help developers improve their commenting habits by providing real-time feedback within their code editor.

## Features

*   **Customizable Rules:** Enforce a consistent style for comments across your entire codebase.
*   **Style Guide:** Based on a comprehensive [STYLE_GUIDE.md](STYLE_GUIDE.md) that explains the rationale behind each rule.
*   **Extensible:** Built as an ESLint plugin, making it easy to integrate into existing JavaScript and TypeScript projects.

## Getting Started

> **Note:** This project is currently under development.

Once published, you will be able to install and configure it like any other ESLint plugin.

### Installation

```bash
npm install eslint-plugin-lint-my-lines --save-dev
```

### Configuration

Add `lint-my-lines` to the plugins section of your `.eslintrc` configuration file. You can also configure the rules you want to use.

```json
{
  "plugins": [
    "lint-my-lines"
  ],
  "rules": {
    "lint-my-lines/enforce-todo-format": "warn"
  }
}
```

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
