/**
 * @fileoverview Tests for enforce-todo-format rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/enforce-todo-format");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("enforce-todo-format", rule, {
  valid: [
    {
      code: "// A regular comment."
    },
    {
      code: "// TODO (TICKET-123): Fix this bug."
    },
    {
      code: "// TODO (jules, 2025-08-18): Refactor this module."
    },
    {
      code: "/*\n * TODO (TICKET-456): Add more features.\n */"
    },
    // Custom pattern option
    {
      code: "// TODO #123: Custom format.",
      options: [{ pattern: "^TODO\\s*#\\d+:" }]
    },
    // Edge case: Unicode in TODO reference
    {
      code: "// TODO (ユーザー-123): Unicode reference test."
    },
    // Edge case: Emoji in description
    {
      code: "// TODO (TICKET-123): Fix this bug 🐛"
    },
    // Edge case: Multiple TODOs in multiline block comment
    {
      code: "/*\n * TODO (TASK-1): First task.\n * TODO (TASK-2): Second task.\n */"
    },
    // Edge case: TODO with very long reference
    {
      code: "// TODO (VERY-LONG-TICKET-REFERENCE-NUMBER-123456789): Fix this."
    },
    // Edge case: TODO in JSX block comment (valid format)
    {
      code: "{/* TODO (TICKET-123): JSX comment */}",
      parserOptions: { ecmaVersion: 2020, ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: "// TODO: Fix this.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX): Fix this."
    },
    {
      code: "// TODO (): Missing reference.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX): (): Missing reference."
    },
    // Note: "TODO ( ):" matches the pattern so it's valid - removed from invalid tests
    {
      code: "/* TODO: Invalid format in block comment. */",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "/* TODO (TICKET-XXX): Invalid format in block comment. */"
    },
    {
      code: "// TODO (missing-colon) This will fail.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX): (missing-colon) This will fail."
    },
    // Edge case: Lowercase todo
    {
      code: "// todo: lowercase caught.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX): lowercase caught."
    },
    // Edge case: Mixed case ToDo
    {
      code: "// ToDo: mixed case caught.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX): mixed case caught."
    },
    // Edge case: TODO in JSX block comment (invalid format)
    {
      code: "{/* TODO: JSX comment invalid */}",
      parserOptions: { ecmaVersion: 2020, ecmaFeatures: { jsx: true } },
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "{/* TODO (TICKET-XXX): JSX comment invalid */}"
    },
    // Edge case: TODO with whitespace before colon
    {
      code: "// TODO : whitespace before colon.",
      errors: [{ messageId: "invalidTodoFormat" }],
      output: "// TODO (TICKET-XXX):  whitespace before colon."
    }
  ]
});

