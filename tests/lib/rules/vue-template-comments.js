/**
 * @fileoverview Tests for vue-template-comments rule.
 * @author Jules
 *
 * NOTE: These tests require vue-eslint-parser to be installed.
 * Run with: npm run test:parsers (after installing vue-eslint-parser)
 */
"use strict";

const rule = require("../../../lib/rules/vue-template-comments");
const { RuleTester } = require("eslint");

// Check if vue-eslint-parser is available
let vueParser;
try {
  vueParser = require("vue-eslint-parser");
} catch {
  // Parser not installed, skip tests
}

// Only run tests if parser is available
if (vueParser) {
  const ruleTester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  });

  ruleTester.run("vue-template-comments", rule, {
    valid: [
      // Valid TODO format in template (disable bannedWords to test format only)
      {
        code: `<template>
        <!-- TODO (TICKET-123): Fix layout -->
        <div>Content</div>
      </template>
      <script>export default {}</script>`,
        options: [{ checkBannedWords: false }],
      },
      // Valid FIXME format in template (disable bannedWords to test format only)
      {
        code: `<template>
        <!-- FIXME (BUG-456): Correct alignment -->
        <div>Content</div>
      </template>
      <script>export default {}</script>`,
        options: [{ checkBannedWords: false }],
      },
      // Regular comment (no TODO/FIXME)
      {
        code: `<template>
        <!-- User information section -->
        <div>User info here</div>
      </template>
      <script>export default {}</script>`,
      },
      // Script section comments should be ignored
      {
        code: `<template>
        <div>Content</div>
      </template>
      <script>
        // TODO: This is in script, not template
        export default {}
      </script>`,
      },
      // Comments outside template should be ignored
      {
        code: `<!-- TODO: Outside template -->
      <template>
        <div>Content</div>
      </template>`,
      },
      // Comment with maxLength option - within limit
      {
        code: `<template>
        <!-- Short comment -->
        <div>Content</div>
      </template>`,
        options: [{ maxLength: 50 }],
      },
      // Comment with requireCapitalization - properly capitalized
      {
        code: `<template>
        <!-- This starts with capital -->
        <div>Content</div>
      </template>`,
        options: [{ requireCapitalization: true }],
      },
      // Comment starting with special characters (skip capitalization check)
      {
        code: `<template>
        <!-- @deprecated use NewComponent instead -->
        <div>Content</div>
      </template>`,
        options: [{ requireCapitalization: true }],
      },
      // Empty template section
      {
        code: `<template></template>
      <script>export default {}</script>`,
      },
      // No template section at all
      {
        code: `<script>export default {}</script>`,
      },
      // Disabled TODO format check (so TODO: without ref is valid)
      {
        code: `<template>
        <!-- TODO: No reference needed -->
        <div>Content</div>
      </template>`,
        options: [{ checkTodoFormat: false, checkBannedWords: false }],
      },
      // Disabled FIXME format check (so FIXME: without ref is valid)
      {
        code: `<template>
        <!-- FIXME: No reference needed -->
        <div>Content</div>
      </template>`,
        options: [{ checkFixmeFormat: false, checkBannedWords: false }],
      },
      // Disabled banned words check
      {
        code: `<template>
        <!-- This is a hack -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
      },
    ],

    invalid: [
      // Invalid TODO format - missing reference (also triggers bannedWord for "todo")
      {
        code: `<template>
        <!-- TODO: Fix this -->
        <div>Content</div>
      </template>
      <script>export default {}</script>`,
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "bannedWord" },
        ],
      },
      // Invalid TODO format only (bannedWords disabled)
      {
        code: `<template>
        <!-- TODO: Fix this -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid TODO format - empty parentheses
      {
        code: `<template>
        <!-- TODO (): Missing reference -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid TODO format - no colon
      {
        code: `<template>
        <!-- TODO (TICKET-123) missing colon -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid FIXME format - missing reference
      {
        code: `<template>
        <!-- FIXME: This needs fixing -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Invalid FIXME format - no parentheses
      {
        code: `<template>
        <!-- FIXME This needs fixing -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Banned word - hack
      {
        code: `<template>
        <!-- This is a hack for the layout -->
        <div>Content</div>
      </template>`,
        errors: [{ messageId: "bannedWord" }],
      },
      // Banned word - xxx
      {
        code: `<template>
        <!-- XXX temporary fix -->
        <div>Content</div>
      </template>`,
        errors: [{ messageId: "bannedWord" }],
      },
      // Multiple errors in same comment (invalidTodoFormat + hack bannedWord + todo bannedWord)
      {
        code: `<template>
        <!-- todo: this is a hack -->
        <div>Content</div>
      </template>`,
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "bannedWord" }, // hack
          { messageId: "bannedWord" }, // todo
        ],
      },
      // Multiple comments with errors (format only, bannedWords disabled)
      {
        code: `<template>
        <!-- TODO: First issue -->
        <div>Content</div>
        <!-- FIXME: Second issue -->
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "invalidFixmeFormat" },
        ],
      },
      // Comment exceeds maxLength
      {
        code: `<template>
        <!-- This is a very long comment that exceeds the maximum length limit set in the options -->
        <div>Content</div>
      </template>`,
        options: [{ maxLength: 30 }],
        errors: [{ messageId: "commentTooLong" }],
      },
      // Comment not capitalized
      {
        code: `<template>
        <!-- this should start with capital -->
        <div>Content</div>
      </template>`,
        options: [{ requireCapitalization: true }],
        errors: [{ messageId: "notCapitalized" }],
      },
      // Custom banned word (replaces default list)
      {
        code: `<template>
        <!-- This is a workaround for legacy code -->
        <div>Content</div>
      </template>`,
        options: [
          {
            bannedWords: [
              { word: "legacy", replacement: "existing" },
            ],
          },
        ],
        errors: [{ messageId: "bannedWord" }],
      },
      // Lowercase todo (format + bannedWord disabled to test format only)
      {
        code: `<template>
        <!-- todo: lowercase also caught -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Mixed case FIXME (format only)
      {
        code: `<template>
        <!-- FixMe: mixed case -->
        <div>Content</div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Nested invalid comment (format only)
      {
        code: `<template>
        <div>
          <ul>
            <li>
              <!-- TODO: Deeply nested invalid -->
            </li>
          </ul>
        </div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Comment in conditional rendering (format only)
      {
        code: `<template>
        <div v-if="condition">
          <!-- TODO: In conditional -->
        </div>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Comment in v-for loop (format only)
      {
        code: `<template>
        <ul>
          <li v-for="item in items" :key="item.id">
            <!-- TODO: In loop -->
            {{ item.name }}
          </li>
        </ul>
      </template>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
    ],
  });
} else {
  // Export a placeholder test so mocha doesn't fail
  describe("vue-template-comments", function() {
    it("skipped - vue-eslint-parser not installed", function() {
      this.skip();
    });
  });
}
