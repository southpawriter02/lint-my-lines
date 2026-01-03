/**
 * @fileoverview Tests for require-file-header rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/require-file-header");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  }
});

ruleTester.run("require-file-header", rule, {
  valid: [
    // JSDoc style header with @file (default)
    {
      code: `/**
 * @file Description of the file
 */
function foo() {}`,
      filename: "test.js"
    },
    // JSDoc header with multiple tags
    {
      code: `/**
 * @file Test file
 * @author John Doe
 */
const x = 1;`,
      filename: "test.js"
    },
    // Block style when configured
    {
      code: `/*
 * @file Test file
 */
function foo() {}`,
      options: [{ style: "block" }],
      filename: "test.js"
    },
    // Line style when configured
    {
      code: `// @file Test file
function foo() {}`,
      options: [{ style: "line" }],
      filename: "test.js"
    },
    // Line style with multiple lines
    {
      code: `// @file Test file
// @author John
function foo() {}`,
      options: [{ style: "line", requiredTags: ["@file", "@author"] }],
      filename: "test.js"
    },
    // Shebang followed by header
    {
      code: `#!/usr/bin/env node
/**
 * @file CLI tool
 */
console.log("hello");`,
      filename: "cli.js"
    },
    // Header with extra tags (not required)
    {
      code: `/**
 * @file Test
 * @author Someone
 * @license MIT
 */
const x = 1;`,
      filename: "test.js"
    },
    // Custom required tags all present
    {
      code: `/**
 * @file Test
 * @author John
 * @license MIT
 */
const x = 1;`,
      options: [{ requiredTags: ["@file", "@author", "@license"] }],
      filename: "test.js"
    },
    // Header with maxLinesBeforeHeader = 1 (header on line 2)
    {
      code: `
/**
 * @file Test
 */
const x = 1;`,
      options: [{ maxLinesBeforeHeader: 1 }],
      filename: "test.js"
    },
    // @fileoverview also counts as @file
    {
      code: `/**
 * @fileoverview Description
 */
function foo() {}`,
      options: [{ requiredTags: ["@fileoverview"] }],
      filename: "test.js"
    },
    // Block comment without * prefix (plain block)
    {
      code: `/*
 @file Description
*/
function foo() {}`,
      options: [{ style: "block" }],
      filename: "test.js"
    }
  ],

  invalid: [
    // Missing header entirely
    {
      code: `function foo() {}`,
      filename: "test.js",
      errors: [{ messageId: "missingHeader" }],
      output: `/**
 * @file test.js
 */

function foo() {}`
    },
    // Missing @file tag
    {
      code: `/**
 * Just a description
 */
function foo() {}`,
      filename: "test.js",
      errors: [{ messageId: "missingTag", data: { tag: "@file" } }]
    },
    // Missing @author tag when required
    {
      code: `/**
 * @file Test
 */
function foo() {}`,
      options: [{ requiredTags: ["@file", "@author"] }],
      filename: "test.js",
      errors: [{ messageId: "missingTag", data: { tag: "@author" } }]
    },
    // Wrong style (JSDoc when block expected)
    {
      code: `/**
 * @file Test
 */
function foo() {}`,
      options: [{ style: "block" }],
      filename: "test.js",
      errors: [{ messageId: "invalidHeaderStyle", data: { expected: "block", actual: "jsdoc" } }]
    },
    // Wrong style (block when JSDoc expected)
    {
      code: `/*
 @file Test
*/
function foo() {}`,
      filename: "test.js",
      errors: [{ messageId: "invalidHeaderStyle", data: { expected: "jsdoc", actual: "block" } }]
    },
    // Header too far from start
    {
      code: `

/**
 * @file Test
 */
function foo() {}`,
      filename: "test.js",
      errors: [{ messageId: "headerTooFarFromStart", data: { max: 1 } }]
    },
    // Header too far with maxLinesBeforeHeader = 1
    {
      code: `

/**
 * @file Test
 */
function foo() {}`,
      options: [{ maxLinesBeforeHeader: 0 }],
      filename: "test.js",
      errors: [{ messageId: "headerTooFarFromStart", data: { max: 1 } }]
    },
    // Missing header with shebang
    {
      code: `#!/usr/bin/env node
console.log("hello");`,
      filename: "cli.js",
      errors: [{ messageId: "missingHeader" }],
      output: `#!/usr/bin/env node
/**
 * @file cli.js
 */

console.log("hello");`
    },
    // Multiple missing required tags
    {
      code: `/**
 * Just a comment
 */
const x = 1;`,
      options: [{ requiredTags: ["@file", "@author", "@license"] }],
      filename: "test.js",
      errors: [
        { messageId: "missingTag", data: { tag: "@file" } },
        { messageId: "missingTag", data: { tag: "@author" } },
        { messageId: "missingTag", data: { tag: "@license" } }
      ]
    },
    // Line style missing header
    {
      code: `function foo() {}`,
      options: [{ style: "line" }],
      filename: "test.js",
      errors: [{ messageId: "missingHeader" }],
      output: `// @file test.js

function foo() {}`
    },
    // Block style missing header
    {
      code: `const x = 1;`,
      options: [{ style: "block" }],
      filename: "test.js",
      errors: [{ messageId: "missingHeader" }],
      output: `/*
 * @file test.js
 */

const x = 1;`
    },
    // Regular comment doesn't count as header (no tags, wrong style)
    {
      code: `/* just a comment */
function foo() {}`,
      filename: "test.js",
      errors: [
        { messageId: "invalidHeaderStyle", data: { expected: "jsdoc", actual: "block" } },
        { messageId: "missingTag", data: { tag: "@file" } }
      ]
    },
    // Empty file needs header
    {
      code: ``,
      filename: "empty.js",
      errors: [{ messageId: "missingHeader" }],
      output: `/**
 * @file empty.js
 */

`
    }
  ]
});
