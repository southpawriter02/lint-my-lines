/**
 * @fileoverview Tests for todo-aging-warnings rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/todo-aging-warnings");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
  },
});

// Helper to create a date N days ago in ISO format
function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

// Helper to create a date N days in the future in ISO format
function daysFromNow(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().split("T")[0];
}

ruleTester.run("todo-aging-warnings", rule, {
  valid: [
    // Recent TODO (within default 30 days)
    {
      code: `// TODO (jules, ${daysAgo(5)}): Fix this soon`,
    },

    // TODO with future date (ignored by default)
    {
      code: `// TODO (jules, ${daysFromNow(10)}): Plan for next sprint`,
    },

    // Regular comments without TODO
    {
      code: `// This is a regular comment`,
    },

    // TODO without date (no warning by default)
    {
      code: `// TODO (TICKET-123): Fix this`,
    },

    // FIXME within threshold
    {
      code: `// FIXME (dev, ${daysAgo(15)}): Memory leak`,
    },

    // NOTE is ignored by default
    {
      code: `// NOTE (author, ${daysAgo(100)}): Very old note`,
    },

    // Old TODO but warnOnNoDate is false and no date present
    {
      code: `// TODO: Do something`,
    },

    // Block comment with recent date
    {
      code: `/* TODO (team, ${daysAgo(10)}): Refactor this module */`,
    },

    // TODO just under threshold
    {
      code: `// TODO (jules, ${daysAgo(29)}): Almost due`,
    },

    // With custom threshold, 45 days ago is ok for 60 day max
    {
      code: `// TODO (jules, ${daysAgo(45)}): Custom threshold`,
      options: [{ maxAgeDays: 60 }],
    },
  ],

  invalid: [
    // TODO older than default 30 days
    {
      code: `// TODO (jules, ${daysAgo(35)}): Old task`,
      errors: [
        {
          messageId: "todoAged",
        },
      ],
    },

    // FIXME older than default 30 days
    {
      code: `// FIXME (dev, ${daysAgo(40)}): Old bug`,
      errors: [
        {
          messageId: "fixmeAged",
        },
      ],
    },

    // Critical TODO (over 90 days)
    {
      code: `// TODO (jules, ${daysAgo(100)}): Very old task`,
      errors: [
        {
          messageId: "todoCritical",
        },
      ],
    },

    // Critical FIXME
    {
      code: `// FIXME (dev, ${daysAgo(120)}): Ancient bug`,
      errors: [
        {
          messageId: "fixmeCritical",
        },
      ],
    },

    // With warnOnNoDate enabled
    {
      code: `// TODO (TICKET-123): No date here`,
      options: [{ warnOnNoDate: true }],
      errors: [
        {
          messageId: "todoNoDate",
        },
      ],
    },

    // FIXME with warnOnNoDate
    {
      code: `// FIXME: No date bug`,
      options: [{ warnOnNoDate: true }],
      errors: [
        {
          messageId: "fixmeNoDate",
        },
      ],
    },

    // NOTE with includeNote enabled
    {
      code: `// NOTE (author, ${daysAgo(50)}): Old note`,
      options: [{ includeNote: true }],
      errors: [
        {
          messageId: "noteAged",
        },
      ],
    },

    // Custom threshold (10 days)
    {
      code: `// TODO (jules, ${daysAgo(15)}): Short threshold`,
      options: [{ maxAgeDays: 10 }],
      errors: [
        {
          messageId: "todoAged",
        },
      ],
    },

    // Custom critical threshold
    {
      code: `// TODO (jules, ${daysAgo(50)}): Custom critical`,
      options: [{ maxAgeDays: 20, criticalAgeDays: 45 }],
      errors: [
        {
          messageId: "todoCritical",
        },
      ],
    },

    // Block comment TODO
    {
      code: `/* TODO (team, ${daysAgo(60)}): Old block comment */`,
      errors: [
        {
          messageId: "todoAged",
        },
      ],
    },

    // Multiple old TODOs
    {
      code: `
// TODO (alice, ${daysAgo(35)}): First old task
// TODO (bob, ${daysAgo(40)}): Second old task
`,
      errors: [{ messageId: "todoAged" }, { messageId: "todoAged" }],
    },

    // US date format
    {
      code: `// TODO (jules, 01/15/2020): US format old date`,
      errors: [
        {
          messageId: "todoCritical",
        },
      ],
    },

    // Written date format
    {
      code: `// TODO (jules, Jan 15, 2020): Written format old date`,
      errors: [
        {
          messageId: "todoCritical",
        },
      ],
    },
  ],
});
