/**
 * @fileoverview Tests for comment-code-ratio rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/comment-code-ratio");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
  },
});

// Generate code with specific comment/code ratio
function generateCode(codeLines, commentLines) {
  let code = "";

  // Add code lines
  for (let i = 0; i < codeLines; i++) {
    code += `const var${i} = ${i};\n`;
  }

  // Add comment lines
  for (let i = 0; i < commentLines; i++) {
    code += `// Comment line ${i}\n`;
  }

  return code;
}

ruleTester.run("comment-code-ratio", rule, {
  valid: [
    // File with good ratio (10 comments, 40 code = 25%)
    {
      code: generateCode(40, 10),
    },

    // File just above minimum (5% = 1 comment per 20 code lines)
    {
      code: generateCode(20, 2),
    },

    // Small file (below minFileLines threshold)
    {
      code: `
const x = 1;
const y = 2;
const z = 3;
`,
    },

    // File at 5% exactly
    {
      code: generateCode(100, 5),
    },

    // File at 40% exactly
    {
      code: generateCode(30, 12),
    },

    // With custom thresholds
    {
      code: generateCode(50, 1), // 2% but threshold is 0%
      options: [{ minRatio: 0 }],
    },

    // JSDoc excluded from ratio
    {
      code: `
/**
 * @file Description
 * @author Test
 */
const x = 1;
const y = 2;
const z = 3;
const a = 4;
const b = 5;
const c = 6;
const d = 7;
const e = 8;
const f = 9;
const g = 10;
const h = 11;
const i = 12;
const j = 13;
const k = 14;
const l = 15;
const m = 16;
const n = 17;
const o = 18;
const p = 19;
const q = 20;
`,
      options: [{ excludeJSDoc: true, minRatio: 0 }],
    },

    // File with reasonable mix
    {
      code: `
// Module for handling user authentication
const crypto = require('crypto');

// Hash a password securely
function hashPassword(password) {
  return crypto.hash(password);
}

// Verify a password against hash
function verifyPassword(password, hash) {
  return crypto.verify(password, hash);
}

// Export public API
module.exports = {
  hashPassword,
  verifyPassword
};
`,
    },
  ],

  invalid: [
    // No comments in file over 20 lines
    {
      code: generateCode(25, 0),
      errors: [{ messageId: "noComments" }],
    },

    // Too few comments (1% when 5% required)
    {
      code: generateCode(100, 1),
      errors: [{ messageId: "tooFewComments" }],
    },

    // Too many comments (60% when 40% max)
    {
      code: generateCode(20, 30),
      errors: [{ messageId: "tooManyComments" }],
    },

    // Custom minimum threshold not met
    {
      code: generateCode(50, 4), // 8% but 10% required
      options: [{ minRatio: 0.1 }],
      errors: [{ messageId: "tooFewComments" }],
    },

    // Custom maximum threshold exceeded
    {
      code: generateCode(50, 15), // 30% but 20% max
      options: [{ maxRatio: 0.2 }],
      errors: [{ messageId: "tooManyComments" }],
    },

    // File just over threshold (21 lines, no comments)
    {
      code: generateCode(21, 0),
      errors: [{ messageId: "noComments" }],
    },

    // Heavily over-commented
    {
      code: `
// Line 1
// Line 2
// Line 3
// Line 4
// Line 5
// Line 6
// Line 7
// Line 8
// Line 9
// Line 10
// Line 11
// Line 12
// Line 13
// Line 14
// Line 15
// Line 16
// Line 17
// Line 18
// Line 19
// Line 20
const x = 1;
const y = 2;
const z = 3;
const a = 4;
const b = 5;
`,
      errors: [{ messageId: "tooManyComments" }],
    },

    // Under-documented code (no comments at all)
    {
      code: `
function processData(input) {
  const result = [];
  for (const item of input) {
    if (item.valid) {
      result.push(transform(item));
    }
  }
  return result;
}

function transform(item) {
  return {
    id: item.id,
    name: item.name,
    value: item.value * 2
  };
}

function validate(data) {
  return data.every(item => item.valid);
}

module.exports = { processData, transform, validate };
`,
      errors: [{ messageId: "noComments" }],
    },
  ],
});
