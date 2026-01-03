/**
 * @fileoverview Tests for jsdoc-type-syntax rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/jsdoc-type-syntax");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  }
});

ruleTester.run("jsdoc-type-syntax", rule, {
  valid: [
    // TypeScript-style types (default)
    {
      code: `
/**
 * @param {string} name - The name
 */
function greet(name) {}
`
    },
    {
      code: `
/**
 * @param {number} x - Value
 * @returns {boolean} Result
 */
function test(x) {
  return x > 0;
}
`
    },
    // Complex type with lowercase
    {
      code: `
/**
 * @param {Array<string>} names - Names list
 */
function greetAll(names) {}
`
    },
    // Union types with lowercase
    {
      code: `
/**
 * @param {string|number} value - Value
 */
function parse(value) {}
`
    },
    // Custom types unchanged
    {
      code: `
/**
 * @param {MyClass} instance - Instance
 */
function use(instance) {}
`
    },
    {
      code: `
/**
 * @param {CustomType} data - Data
 */
function process(data) {}
`
    },
    // JSDoc style when prefer is jsdoc
    {
      code: `
/**
 * @param {String} name - Name
 */
function greet(name) {}
`,
      options: [{ prefer: "jsdoc" }]
    },
    {
      code: `
/**
 * @param {Number} x - Value
 * @returns {Boolean} Result
 */
function test(x) {
  return x > 0;
}
`,
      options: [{ prefer: "jsdoc" }]
    },
    // Non-JSDoc comments (should not be checked)
    {
      code: `
/* This is not a JSDoc {String} comment */
function foo() {}
`
    },
    {
      code: `
// Line comment with {String} type
function foo() {}
`
    },
    // Promise types
    {
      code: `
/**
 * @returns {Promise<string>} Result
 */
async function fetch() {
  return "data";
}
`
    },
    // Nullable types
    {
      code: `
/**
 * @param {?string} name - Optional name
 */
function greet(name) {}
`
    },
    // Non-nullable types
    {
      code: `
/**
 * @param {!string} name - Required name
 */
function greet(name) {}
`
    }
  ],

  invalid: [
    // Capitalized String should be lowercase
    {
      code: `
/**
 * @param {String} name - The name
 */
function greet(name) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "String", preferred: "string" } }],
      output: `
/**
 * @param {string} name - The name
 */
function greet(name) {}
`
    },
    // Capitalized Number
    {
      code: `
/**
 * @param {Number} x - Value
 */
function test(x) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "Number", preferred: "number" } }],
      output: `
/**
 * @param {number} x - Value
 */
function test(x) {}
`
    },
    // Capitalized Boolean
    {
      code: `
/**
 * @param {Boolean} flag - Flag
 */
function check(flag) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "Boolean", preferred: "boolean" } }],
      output: `
/**
 * @param {boolean} flag - Flag
 */
function check(flag) {}
`
    },
    // Multiple wrong types in one comment
    {
      code: `
/**
 * @param {String} name - Name
 * @param {Number} age - Age
 * @returns {Boolean} Valid
 */
function validate(name, age) {
  return true;
}
`,
      errors: [{ messageId: "preferTypescriptType" }],
      output: `
/**
 * @param {string} name - Name
 * @param {number} age - Age
 * @returns {boolean} Valid
 */
function validate(name, age) {
  return true;
}
`
    },
    // Array generic with wrong type
    {
      code: `
/**
 * @param {Array<String>} names - Names
 */
function greetAll(names) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "String", preferred: "string" } }],
      output: `
/**
 * @param {Array<string>} names - Names
 */
function greetAll(names) {}
`
    },
    // Union type with wrong types
    {
      code: `
/**
 * @param {String|Number} value - Value
 */
function parse(value) {}
`,
      errors: [{ messageId: "preferTypescriptType" }],
      output: `
/**
 * @param {string|number} value - Value
 */
function parse(value) {}
`
    },
    // JSDoc mode: lowercase should be capitalized
    {
      code: `
/**
 * @param {string} name - Name
 */
function greet(name) {}
`,
      options: [{ prefer: "jsdoc" }],
      errors: [{ messageId: "preferJsdocType", data: { actual: "string", preferred: "String" } }],
      output: `
/**
 * @param {String} name - Name
 */
function greet(name) {}
`
    },
    // Custom type map
    {
      code: `
/**
 * @param {int} value - Value
 */
function process(value) {}
`,
      options: [{ prefer: "typescript", typeMap: { "int": "number" } }],
      errors: [{ messageId: "preferTypescriptType", data: { actual: "int", preferred: "number" } }],
      output: `
/**
 * @param {number} value - Value
 */
function process(value) {}
`
    },
    // Symbol type
    {
      code: `
/**
 * @param {Symbol} key - Key
 */
function setSymbol(key) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "Symbol", preferred: "symbol" } }],
      output: `
/**
 * @param {symbol} key - Key
 */
function setSymbol(key) {}
`
    },
    // @returns with wrong type
    {
      code: `
/**
 * @returns {String} The result
 */
function getResult() {
  return "result";
}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "String", preferred: "string" } }],
      output: `
/**
 * @returns {string} The result
 */
function getResult() {
  return "result";
}
`
    },
    // Nullable type with wrong case
    {
      code: `
/**
 * @param {?String} name - Optional
 */
function greet(name) {}
`,
      errors: [{ messageId: "preferTypescriptType", data: { actual: "String", preferred: "string" } }],
      output: `
/**
 * @param {?string} name - Optional
 */
function greet(name) {}
`
    }
  ]
});
