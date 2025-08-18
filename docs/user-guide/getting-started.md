# Getting Started

> **Note:** This project is currently under development.

Once published, you will be able to install and configure it like any other ESLint plugin.

## Installation

```bash
npm install eslint-plugin-lint-my-lines --save-dev
```

## Configuration

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
