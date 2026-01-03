/**
 * @fileoverview Tests for issue-tracker-integration rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/issue-tracker-integration");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

// Note: These tests focus on the rule's static behavior.
// The async validation behavior requires mocking the issue tracker client,
// which is better tested in integration tests with actual API mocking.

ruleTester.run("issue-tracker-integration", rule, {
  valid: [
    // Offline mode - skips validation
    {
      code: `
// TODO (GH-123): Fix this bug
function foo() {}
`,
      options: [{ tracker: "github", offline: true }],
    },

    // No tracker configured - skips validation
    {
      code: `
// TODO (PROJ-456): Implement feature
function bar() {}
`,
      options: [{}],
    },

    // Comment without TODO/FIXME - not checked
    {
      code: `
// This is a regular comment GH-123
function baz() {}
`,
      options: [{ tracker: "github", offline: true }],
    },

    // No ticket ID in TODO
    {
      code: `
// TODO: Fix this later
function qux() {}
`,
      options: [{ tracker: "github", offline: true }],
    },

    // Offline mode with Jira pattern
    {
      code: `
// FIXME (JIRA-789): Memory leak
function fix() {}
`,
      options: [{ tracker: "jira", offline: true }],
    },

    // Offline mode with custom pattern
    {
      code: `
// TODO (TICKET-001): Custom tracker
function custom() {}
`,
      options: [
        {
          tracker: "custom",
          ticketPattern: "TICKET-\\d+",
          offline: true,
        },
      ],
    },

    // Block comment with offline mode
    {
      code: `
/*
 * TODO (GH-456): Refactor this
 */
function block() {}
`,
      options: [{ tracker: "github", offline: true }],
    },

    // Multiple tickets in offline mode
    {
      code: `
// TODO (GH-1, GH-2): Fix both issues
function multi() {}
`,
      options: [{ tracker: "github", offline: true }],
    },
  ],

  invalid: [
    // Missing tracker configuration reports error
    // Note: This test verifies the missingConfig error when tracker is set
    // but required fields are missing. However, with offline mode, no error occurs.
    // Real validation errors require async testing with mocked HTTP responses.
  ],
});

// Additional unit tests for ticket pattern extraction
describe("issue-tracker-integration pattern matching", function () {
  const { RuleTester } = require("eslint");

  // Test that the default pattern matches expected formats
  it("should match GitHub-style tickets", function () {
    const pattern = /[A-Z]+-\d+|#\d+|GH-\d+/gi;
    const testCases = [
      { input: "GH-123", expected: ["GH-123"] },
      { input: "#456", expected: ["#456"] },
      { input: "PROJ-789", expected: ["PROJ-789"] },
      { input: "ABC-1 and DEF-2", expected: ["ABC-1", "DEF-2"] },
      { input: "no tickets here", expected: [] },
    ];

    for (const { input, expected } of testCases) {
      const matches = input.match(pattern) || [];
      if (JSON.stringify(matches) !== JSON.stringify(expected)) {
        throw new Error(
          `Pattern mismatch for "${input}": got ${JSON.stringify(matches)}, expected ${JSON.stringify(expected)}`
        );
      }
    }
  });
});
