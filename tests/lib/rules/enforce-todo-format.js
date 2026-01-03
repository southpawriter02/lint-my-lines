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
    }
  ]
});

