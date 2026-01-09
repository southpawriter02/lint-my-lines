/**
 * @fileoverview Tests for accessibility-todo-format rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/accessibility-todo-format");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("accessibility-todo-format", rule, {
  valid: [
    {
      code: "// A regular comment."
    },
    {
      code: "// TODO (TICKET-123): Regular TODO is fine."
    },
    {
      code: "// A11Y-TODO (WCAG-2.1.1): Add keyboard navigation for modal."
    },
    {
      code: "// A11Y-TODO (JIRA-123): Fix color contrast ratio."
    },
    {
      code: "// A11Y-TODO (jules, 2025-01-09): Add focus indicators."
    },
    {
      code: "/*\n * A11Y-TODO (WCAG-1.4.3): Improve text contrast.\n */"
    },
    // Alternate prefix
    {
      code: "// ALLY-TODO (WCAG-2.4.7): Add visible focus states."
    },
    // Custom pattern
    {
      code: "// A11Y-TODO #123: Custom format.",
      options: [{ pattern: "^A11Y-TODO\\s*#\\d+:" }]
    },
    // JSX block comment
    {
      code: "{/* A11Y-TODO (WCAG-2.1.1): JSX comment */}",
      parserOptions: { ecmaVersion: 2020, ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: "// A11Y-TODO: Missing reference.",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "// A11Y-TODO (WCAG-X.X.X): Missing reference."
    },
    {
      code: "// A11Y-TODO fix the contrast",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "// A11Y-TODO (WCAG-X.X.X): fix the contrast"
    },
    {
      code: "// ally-todo: lowercase caught",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "// A11Y-TODO (WCAG-X.X.X): lowercase caught"
    },
    {
      code: "/* A11Y-TODO: Invalid format in block comment. */",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "/* A11Y-TODO (WCAG-X.X.X): Invalid format in block comment. */"
    },
    {
      code: "// A11Y-TODO (missing-colon) This will fail.",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "// A11Y-TODO (WCAG-X.X.X): (missing-colon) This will fail."
    },
    // ALLY-TODO variant
    {
      code: "// ALLY-TODO: needs reference",
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "// A11Y-TODO (WCAG-X.X.X): needs reference"
    },
    // JSX block comment invalid
    {
      code: "{/* A11Y-TODO: JSX invalid */}",
      parserOptions: { ecmaVersion: 2020, ecmaFeatures: { jsx: true } },
      errors: [{ messageId: "invalidA11yTodoFormat" }],
      output: "{/* A11Y-TODO (WCAG-X.X.X): JSX invalid */}"
    },
    // With requireWcagReference: true
    {
      code: "// A11Y-TODO (JIRA-123): No WCAG reference.",
      options: [{ requireWcagReference: true }],
      errors: [{ messageId: "missingWcagReference" }]
    }
  ]
});
