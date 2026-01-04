# Contributing to lint-my-lines

Thank you for your interest in contributing to `eslint-plugin-lint-my-lines`! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/southpawriter02/lint-my-lines.git
   cd lint-my-lines
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Run ESLint**
   ```bash
   npx eslint .
   ```

## Project Structure

```
lint-my-lines/
├── lib/
│   ├── index.js          # Plugin entry point, exports rules and configs
│   ├── rules/            # ESLint rule implementations
│   ├── processors/       # Language processors (Vue, Svelte, Markdown)
│   ├── utils/            # Shared utilities
│   └── cli/              # CLI tools
├── tests/
│   └── lib/rules/        # Rule tests
├── docs/
│   ├── rules/            # Individual rule documentation
│   ├── INTEGRATION_GUIDE.md
│   └── PERFORMANCE_GUIDE.md
├── bin/                  # CLI entry point
└── STYLE_GUIDE.md        # Commenting style guide
```

## Creating a New Rule

1. **Create the rule file**: `lib/rules/rule-name.js`
   ```javascript
   module.exports = {
     meta: {
       type: "suggestion",
       docs: {
         description: "Description of what the rule does",
         category: "Category",
         recommended: false,
       },
       fixable: null, // or "code" if autofix is supported
       schema: [], // rule options schema
       messages: {
         messageId: "Error message template",
       },
     },
     create(context) {
       return {
         // AST visitor methods
       };
     },
   };
   ```

2. **Create the test file**: `tests/lib/rules/rule-name.js`
   ```javascript
   const { RuleTester } = require("eslint");
   const rule = require("../../../lib/rules/rule-name");

   const ruleTester = new RuleTester();

   ruleTester.run("rule-name", rule, {
     valid: [
       // Valid code examples
     ],
     invalid: [
       // Invalid code examples with expected errors
     ],
   });
   ```

3. **Create documentation**: `docs/rules/rule-name.md`
   - Include rule description
   - List all options
   - Provide valid and invalid examples
   - Document autofix behavior (if applicable)

4. **Export the rule** in `lib/index.js`

5. **Add to appropriate preset(s)** in `lib/index.js`

## Pull Request Process

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write tests for new functionality
   - Update documentation as needed
   - Follow existing code patterns

3. **Ensure quality**
   ```bash
   npm test          # All tests must pass
   npx eslint .      # No ESLint errors
   ```

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow the commit message format below

5. **Submit a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure CI checks pass

## Commit Message Format

Use conventional commit format:

```
type: short description

Optional longer description explaining the change.

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring (no functional change)
- `perf`: Performance improvement
- `chore`: Maintenance tasks

**Examples:**
```
feat: add new rule for detecting stale comments

fix: handle edge case in TODO format detection

docs: update installation instructions for ESLint v9
```

## Code Style

- **Follow existing patterns** in the codebase
- **Use JSDoc comments** for function documentation
- **Run ESLint** before committing (`npx eslint .`)
- **Prefer clarity** over cleverness
- **Keep functions focused** - one purpose per function

### Naming Conventions

- Rule files: `kebab-case.js` (e.g., `enforce-todo-format.js`)
- Test files: Match rule file name
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Testing Guidelines

- **Cover all code paths** - valid and invalid cases
- **Test edge cases** - empty comments, special characters, etc.
- **Test autofix output** when applicable
- **Use descriptive test names** or comments

Example test structure:
```javascript
ruleTester.run("rule-name", rule, {
  valid: [
    // Basic valid case
    "// Valid comment",

    // With options
    {
      code: "// Another valid case",
      options: [{ someOption: true }],
    },
  ],
  invalid: [
    {
      code: "// invalid comment",
      errors: [{ messageId: "errorMessage" }],
    },

    // Test autofix
    {
      code: "// before fix",
      output: "// after fix",
      errors: [{ messageId: "errorMessage" }],
    },
  ],
});
```

## Reporting Issues

When reporting bugs, please include:

1. **ESLint version** and **Node.js version**
2. **Plugin version**
3. **ESLint configuration** (relevant parts)
4. **Code example** that reproduces the issue
5. **Expected behavior** vs **actual behavior**

## Questions?

If you have questions about contributing, feel free to:
- Open a [GitHub issue](https://github.com/southpawriter02/lint-my-lines/issues)
- Check existing issues for similar questions

Thank you for contributing!
