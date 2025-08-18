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
    }
  ],
  invalid: [
    {
      code: "// TODO: Fix this.",
      errors: [{ messageId: "invalidTodoFormat" }]
    },
    {
      code: "// TODO (): Missing reference.",
      errors: [{ messageId: "invalidTodoFormat" }]
    },
    {
      code: "// TODO ( ): Missing reference.",
      errors: [{ messageId: "invalidTodoFormat" }]
    },
    {
      code: "/* TODO: Invalid format in block comment. */",
      errors: [{ messageId: "invalidTodoFormat" }]
    },
    {
      code: "// TODO (missing-colon) This will fail.",
      errors: [{ messageId: "invalidTodoFormat" }]
    }
  ]
});
