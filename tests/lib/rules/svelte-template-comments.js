/**
 * @fileoverview Tests for svelte-template-comments rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/svelte-template-comments");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("svelte-template-comments", rule, {
  valid: [
    // Valid TODO format in markup
    {
      code: `<!-- TODO (TICKET-123): Fix layout -->
<div>Content</div>
<script>
  let count = 0;
</script>`,
    },
    // Valid FIXME format in markup
    {
      code: `<!-- FIXME (BUG-456): Correct alignment -->
<main>Content</main>
<script>
  export let name;
</script>`,
    },
    // Regular comment (no TODO/FIXME)
    {
      code: `<!-- User information section -->
<div class="user-info">
  <p>User details</p>
</div>`,
    },
    // Comment with reference format
    {
      code: `<!-- TODO (jules, 2025-01-08): Refactor this component -->
<div>Component content</div>`,
    },
    // Multiple valid comments
    {
      code: `<!-- TODO (ISSUE-1): First task -->
<header>
  <!-- Header section -->
</header>
<!-- FIXME (BUG-2): Second issue -->
<main>Content</main>`,
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
    // Nested markup comments
    {
      code: `<div>
  <!-- TODO (TASK-100): Outer element note -->
  <ul>
    <li>
      <!-- TODO (TASK-101): Inner element note -->
      Item
    </li>
  </ul>
</div>`,
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
    // Svelte reactive statement with no comment issues
    {
      code: `<script>
  let count = 0;
  $: doubled = count * 2;
</script>
<!-- TODO (TASK-1): Display doubled value -->
<p>{doubled}</p>`,
    },
    // Svelte each block with valid comment
    {
      code: `<!-- TODO (LIST-1): Render items -->
{#each items as item}
  <li>{item.name}</li>
{/each}`,
    },
    // Svelte if block with valid comment
    {
      code: `<!-- TODO (COND-1): Show conditionally -->
{#if condition}
  <div>Shown</div>
{/if}`,
    },
    // Disabled TODO format check
    {
      code: `<!-- TODO: No reference needed -->
<div>Content</div>`,
      options: [{ checkTodoFormat: false }],
    },
    // Disabled FIXME format check
    {
      code: `<!-- FIXME: No reference needed -->
<div>Content</div>`,
      options: [{ checkFixmeFormat: false }],
    },
    // Disabled banned words check
    {
      code: `<!-- This is a hack -->
<div>Content</div>`,
      options: [{ checkBannedWords: false }],
    },
    // Slot with valid comment
    {
      code: `<!-- TODO (SLOT-1): Default slot content -->
<slot>Default content</slot>`,
    },
    // Component markup only (no script/style)
    {
      code: `<!-- TODO (PURE-1): Pure markup component -->
<div class="wrapper">
  <h1>Title</h1>
  <p>Description</p>
</div>`,
    },
  ],

  invalid: [
    // Invalid TODO format - missing reference
    {
      code: `<!-- TODO: Fix this -->
<div>Content</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid TODO format - empty parentheses
    {
      code: `<!-- TODO (): Missing reference -->
<div>Content</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid TODO format - no colon
    {
      code: `<!-- TODO (TICKET-123) missing colon -->
<div>Content</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid FIXME format - missing reference
    {
      code: `<!-- FIXME: This needs fixing -->
<div>Content</div>`,
      errors: [{ messageId: "invalidFixmeFormat" }],
    },
    // Invalid FIXME format - no parentheses
    {
      code: `<!-- FIXME This needs fixing -->
<div>Content</div>`,
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
    // Multiple errors in same comment
    {
      code: `<!-- todo: this is a hack -->
<div>Content</div>`,
      errors: [
        { messageId: "invalidTodoFormat" },
        { messageId: "bannedWord" },
      ],
    },
    // Multiple comments with errors
    {
      code: `<!-- TODO: First issue -->
<div>Content</div>
<!-- FIXME: Second issue -->`,
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
    // Custom banned word
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
    // Lowercase todo still caught
    {
      code: `<!-- todo: lowercase also caught -->
<div>Content</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Mixed case FIXME
    {
      code: `<!-- FixMe: mixed case -->
<div>Content</div>`,
      errors: [{ messageId: "invalidFixmeFormat" }],
    },
    // Invalid comment in each block
    {
      code: `{#each items as item}
  <!-- TODO: In loop -->
  <li>{item.name}</li>
{/each}`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid comment in if block
    {
      code: `{#if condition}
  <!-- TODO: In conditional -->
  <div>Shown</div>
{/if}`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid comment before slot
    {
      code: `<!-- TODO: slot content -->
<slot></slot>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid comment between script and markup
    {
      code: `<script>
  let count = 0;
</script>
<!-- TODO: between script and markup -->
<div>{count}</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Invalid comment after style
    {
      code: `<style>
  div { color: red; }
</style>
<!-- TODO: after style -->
<div>Content</div>`,
      errors: [{ messageId: "invalidTodoFormat" }],
    },
    // Deeply nested invalid comment
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
      errors: [{ messageId: "invalidTodoFormat" }],
    },
  ],
});
