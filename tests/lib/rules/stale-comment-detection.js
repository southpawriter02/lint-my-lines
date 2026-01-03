/**
 * @fileoverview Tests for stale-comment-detection rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/stale-comment-detection");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("stale-comment-detection", rule, {
  valid: [
    // Reference to existing function
    {
      code: `
// The \`processData\` function handles input
function processData(input) {
  return input;
}
`,
    },

    // Reference to existing variable
    {
      code: `
// Use \`config\` for settings
const config = { debug: true };
`,
    },

    // Reference to existing class
    {
      code: `
// The \`UserService\` class handles authentication
class UserService {
  login() {}
}
`,
    },

    // Reference to imported identifier
    {
      code: `
import { useState } from 'react';
// Use \`useState\` for state management
function Component() {
  const [state, setState] = useState(null);
  return state;
}
`,
    },

    // Reference to parameter
    {
      code: `
// The \`options\` parameter configures behavior
function configure(options) {
  return options;
}
`,
    },

    // Common words in backticks are ignored
    {
      code: `
// Use \`the\` article correctly
const x = 1;
`,
    },

    // Short identifiers are ignored
    {
      code: `
// The \`id\` field
const x = 1;
`,
    },

    // No backtick references
    {
      code: `
// This is a regular comment without references
function doSomething() {}
`,
    },

    // Reference without backticks (not checked by default conservative mode)
    {
      code: `
// The nonExistentFunction should work
function realFunction() {}
`,
    },

    // Ignored pattern
    {
      code: `
// The \`React\` library is imported elsewhere
const x = 1;
`,
      options: [{ ignorePatterns: ["^React$"] }],
    },

    // Multiple valid references
    {
      code: `
// The \`foo\` and \`bar\` functions work together
function foo() { return bar(); }
function bar() { return 1; }
`,
    },

    // Block comment with valid reference
    {
      code: `
/*
 * The \`helper\` function is used internally
 */
function helper() {}
`,
    },
  ],

  invalid: [
    // Reference to non-existent function
    {
      code: `
// The \`processData\` function handles input
function handleInput(input) {
  return input;
}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "processData" },
        },
      ],
    },

    // Reference to non-existent variable
    {
      code: `
// Use \`config\` for settings
const options = { debug: true };
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "config" },
        },
      ],
    },

    // Reference to non-existent class
    {
      code: `
// The \`UserService\` class handles auth
class AuthService {
  login() {}
}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "UserService" },
        },
      ],
    },

    // Multiple stale references
    {
      code: `
// Use \`foo\` and \`bar\` together
function baz() {}
`,
      errors: [
        { messageId: "staleRef", data: { identifier: "foo" } },
        { messageId: "staleRef", data: { identifier: "bar" } },
      ],
    },

    // Explicit reference pattern: "see X"
    {
      code: `
// See \`helperFunction\` for details
function mainFunction() {}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "helperFunction" },
        },
      ],
    },

    // Explicit reference pattern: "call X"
    {
      code: `
// Call \`initializeApp\` first
function startApp() {}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "initializeApp" },
        },
      ],
    },

    // Block comment with stale reference
    {
      code: `
/*
 * The \`legacyHandler\` function was removed
 */
function newHandler() {}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "legacyHandler" },
        },
      ],
    },

    // Stale reference with custom min length
    {
      code: `
// The \`id\` field is important
const userId = 1;
`,
      options: [{ minIdentifierLength: 2 }],
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "id" },
        },
      ],
    },

    // Reference in middle of comment
    {
      code: `
// First call \`setup\` then proceed
function teardown() {}
`,
      errors: [
        {
          messageId: "staleRef",
          data: { identifier: "setup" },
        },
      ],
    },
  ],
});
