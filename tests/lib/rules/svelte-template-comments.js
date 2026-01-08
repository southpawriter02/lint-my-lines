/**
 * @fileoverview Tests for svelte-template-comments rule.
 * @author Jules
 *
 * NOTE: These tests require svelte-eslint-parser to be installed.
 * Run with: npm run test:parsers (after installing svelte-eslint-parser)
 */
"use strict";

const rule = require("../../../lib/rules/svelte-template-comments");
const { RuleTester } = require("eslint");

// Check if svelte-eslint-parser is available
let svelteParser;
try {
  svelteParser = require("svelte-eslint-parser");
} catch {
  // Parser not installed, skip tests
}

// Only run tests if parser is available
if (svelteParser) {
  const ruleTester = new RuleTester({
    parser: require.resolve("svelte-eslint-parser"),
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  });

  ruleTester.run("svelte-template-comments", rule, {
    valid: [
      // Valid TODO format in markup (disable bannedWords to test format only)
      {
        code: `<!-- TODO (TICKET-123): Fix layout -->
<div>Content</div>
<script>
  let count = 0;
</script>`,
        options: [{ checkBannedWords: false }],
      },
      // Valid FIXME format in markup (disable bannedWords to test format only)
      {
        code: `<!-- FIXME (BUG-456): Correct alignment -->
<main>Content</main>
<script>
  export let name;
</script>`,
        options: [{ checkBannedWords: false }],
      },
      // Regular comment (no TODO/FIXME)
      {
        code: `<!-- User information section -->
<div class="user-info">
  <p>User details</p>
</div>`,
      },
      // Script section comments should be ignored
      {
        code: `<div>Content</div>
<script>
  // TODO: This is in script, not markup
  let value = 0;
</script>`,
      },
      // Style section comments should be ignored
      {
        code: `<div>Content</div>
<style>
  /* TODO: This is in style, not markup */
  .class { color: red; }
</style>`,
      },
      // Comment with maxLength option - within limit
      {
        code: `<!-- Short comment -->
<div>Content</div>`,
        options: [{ maxLength: 50 }],
      },
      // Comment with requireCapitalization - properly capitalized
      {
        code: `<!-- This starts with capital -->
<div>Content</div>`,
        options: [{ requireCapitalization: true }],
      },
      // Comment starting with special characters (skip capitalization check)
      {
        code: `<!-- @deprecated use NewComponent instead -->
<div>Content</div>`,
        options: [{ requireCapitalization: true }],
      },
      // Svelte each block with valid comment (bannedWords disabled)
      {
        code: `<!-- TODO (LIST-1): Render items -->
{#each items as item}
  <li>{item.name}</li>
{/each}`,
        options: [{ checkBannedWords: false }],
      },
      // Svelte if block with valid comment (bannedWords disabled)
      {
        code: `<!-- TODO (COND-1): Show conditionally -->
{#if condition}
  <div>Shown</div>
{/if}`,
        options: [{ checkBannedWords: false }],
      },
      // Disabled TODO format check
      {
        code: `<!-- TODO: No reference needed -->
<div>Content</div>`,
        options: [{ checkTodoFormat: false, checkBannedWords: false }],
      },
      // Disabled FIXME format check
      {
        code: `<!-- FIXME: No reference needed -->
<div>Content</div>`,
        options: [{ checkFixmeFormat: false, checkBannedWords: false }],
      },
      // Disabled banned words check
      {
        code: `<!-- This is a hack -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
      },
      // Slot with valid comment (bannedWords disabled)
      {
        code: `<!-- TODO (SLOT-1): Default slot content -->
<slot>Default content</slot>`,
        options: [{ checkBannedWords: false }],
      },
    ],

    invalid: [
      // Invalid TODO format - missing reference (also triggers bannedWord)
      {
        code: `<!-- TODO: Fix this -->
<div>Content</div>`,
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "bannedWord" },
        ],
      },
      // Invalid TODO format only (bannedWords disabled)
      {
        code: `<!-- TODO: Fix this -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid TODO format - empty parentheses
      {
        code: `<!-- TODO (): Missing reference -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid TODO format - no colon
      {
        code: `<!-- TODO (TICKET-123) missing colon -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid FIXME format - missing reference
      {
        code: `<!-- FIXME: This needs fixing -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Invalid FIXME format - no parentheses
      {
        code: `<!-- FIXME This needs fixing -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Banned word - hack
      {
        code: `<!-- This is a hack for the layout -->
<div>Content</div>`,
        errors: [{ messageId: "bannedWord" }],
      },
      // Banned word - xxx
      {
        code: `<!-- XXX temporary fix -->
<div>Content</div>`,
        errors: [{ messageId: "bannedWord" }],
      },
      // Multiple errors in same comment (invalidTodoFormat + hack + todo)
      {
        code: `<!-- todo: this is a hack -->
<div>Content</div>`,
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "bannedWord" }, // hack
          { messageId: "bannedWord" }, // todo
        ],
      },
      // Multiple comments with errors (format only)
      {
        code: `<!-- TODO: First issue -->
<div>Content</div>
<!-- FIXME: Second issue -->`,
        options: [{ checkBannedWords: false }],
        errors: [
          { messageId: "invalidTodoFormat" },
          { messageId: "invalidFixmeFormat" },
        ],
      },
      // Comment exceeds maxLength
      {
        code: `<!-- This is a very long comment that exceeds the maximum length limit set in the options -->
<div>Content</div>`,
        options: [{ maxLength: 30 }],
        errors: [{ messageId: "commentTooLong" }],
      },
      // Comment not capitalized
      {
        code: `<!-- this should start with capital -->
<div>Content</div>`,
        options: [{ requireCapitalization: true }],
        errors: [{ messageId: "notCapitalized" }],
      },
      // Custom banned word (replaces default list)
      {
        code: `<!-- This is a workaround for legacy code -->
<div>Content</div>`,
        options: [
          {
            bannedWords: [
              { word: "legacy", replacement: "existing" },
            ],
          },
        ],
        errors: [{ messageId: "bannedWord" }],
      },
      // Lowercase todo (format only)
      {
        code: `<!-- todo: lowercase also caught -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Mixed case FIXME (format only)
      {
        code: `<!-- FixMe: mixed case -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidFixmeFormat" }],
      },
      // Invalid comment in each block (format only)
      {
        code: `{#each items as item}
  <!-- TODO: In loop -->
  <li>{item.name}</li>
{/each}`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid comment in if block (format only)
      {
        code: `{#if condition}
  <!-- TODO: In conditional -->
  <div>Shown</div>
{/if}`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid comment before slot (format only)
      {
        code: `<!-- TODO: slot content -->
<slot></slot>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid comment between script and markup (format only)
      {
        code: `<script>
  let count = 0;
</script>
<!-- TODO: between script and markup -->
<div>{count}</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Invalid comment after style (format only)
      {
        code: `<style>
  div { color: red; }
</style>
<!-- TODO: after style -->
<div>Content</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
      // Deeply nested invalid comment (format only)
      {
        code: `<div>
  <section>
    <article>
      <div>
        <!-- TODO: Deeply nested invalid -->
      </div>
    </article>
  </section>
</div>`,
        options: [{ checkBannedWords: false }],
        errors: [{ messageId: "invalidTodoFormat" }],
      },
    ],
  });
} else {
  // Export a placeholder test so mocha doesn't fail
  describe("svelte-template-comments", function() {
    it("skipped - svelte-eslint-parser not installed", function() {
      this.skip();
    });
  });
}
