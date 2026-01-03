/**
 * @fileoverview Tests for valid-jsdoc rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/valid-jsdoc");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  }
});

ruleTester.run("valid-jsdoc", rule, {
  valid: [
    // Function with matching JSDoc
    {
      code: `
/**
 * Add two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  return a + b;
}
`
    },
    // Function without return
    {
      code: `
/**
 * Log a message
 * @param {string} msg - The message
 */
function log(msg) {
  console.log(msg);
}
`
    },
    // Function without JSDoc (no validation needed)
    {
      code: `
function noDoc(a, b) {
  return a + b;
}
`
    },
    // Function with rest parameter
    {
      code: `
/**
 * Sum numbers
 * @param {...number} nums - Numbers to sum
 * @returns {number} The sum
 */
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
`
    },
    // Function with optional parameter
    {
      code: `
/**
 * Greet someone
 * @param {string} [name] - The name
 * @returns {string} Greeting
 */
function greet(name = "World") {
  return "Hello, " + name;
}
`
    },
    // Using @return instead of @returns
    {
      code: `
/**
 * Get value
 * @return {number} The value
 */
function getValue() {
  return 42;
}
`
    },
    // Method with JSDoc
    {
      code: `
class Calculator {
  /**
   * Add numbers
   * @param {number} a - First
   * @param {number} b - Second
   * @returns {number} Sum
   */
  add(a, b) {
    return a + b;
  }
}
`
    },
    // No param type required when option is false
    {
      code: `
/**
 * Test
 * @param x - The value
 */
function test(x) {}
`,
      options: [{ requireParamType: false }]
    },
    // No return type required when option is false
    {
      code: `
/**
 * Test
 * @param {number} x - Value
 * @returns Result
 */
function test(x) {
  return x;
}
`,
      options: [{ requireReturnType: false }]
    },
    // Param order check disabled
    {
      code: `
/**
 * Test
 * @param {number} b - Second
 * @param {number} a - First
 */
function test(a, b) {}
`,
      options: [{ checkParamOrder: false }]
    },
    // Param name check disabled
    {
      code: `
/**
 * Test
 * @param {number} x - Value
 */
function test(y) {}
`,
      options: [{ checkParamNames: false }]
    }
  ],

  invalid: [
    // Missing @param (with autofix output)
    {
      code: `
/**
 * Add numbers
 * @param {number} a - First
 * @returns {number} Sum
 */
function add(a, b) {
  return a + b;
}
`,
      errors: [{ messageId: "missingParam", data: { name: "b" } }],
      output: `
/**
 * Add numbers
 * @param {number} a - First
 * @param {*} b - [description]
 * @returns {number} Sum
 */
function add(a, b) {
  return a + b;
}
`
    },
    // Extra @param
    {
      code: `
/**
 * Test function
 * @param {number} a - First
 * @param {number} b - Second
 * @param {number} c - Third
 */
function test(a, b) {}
`,
      errors: [{ messageId: "extraParam", data: { name: "c" } }]
    },
    // Wrong param order (both params out of order, expect 2 errors)
    {
      code: `
/**
 * Test
 * @param {number} b - Second
 * @param {number} a - First
 */
function test(a, b) {}
`,
      errors: [
        { messageId: "paramOrderMismatch" },
        { messageId: "paramOrderMismatch" }
      ]
    },
    // Missing @returns for function that returns value (with autofix)
    {
      code: `
/**
 * Get value
 * @param {number} x - Input
 */
function getValue(x) {
  return x * 2;
}
`,
      errors: [{ messageId: "missingReturns" }],
      output: `
/**
 * Get value
 * @param {number} x - Input
 * @returns {*} [description]
 */
function getValue(x) {
  return x * 2;
}
`
    },
    // Missing param type
    {
      code: `
/**
 * Test
 * @param x - Value
 */
function test(x) {}
`,
      errors: [{ messageId: "missingParamType", data: { name: "x" } }]
    },
    // Missing return type
    {
      code: `
/**
 * Test
 * @param {number} x - Value
 * @returns Result
 */
function test(x) {
  return x;
}
`,
      errors: [{ messageId: "missingReturnType" }]
    },
    // Missing param description (when required)
    {
      code: `
/**
 * Test
 * @param {number} x
 */
function test(x) {}
`,
      options: [{ requireParamDescription: true }],
      errors: [{ messageId: "missingParamDescription", data: { name: "x" } }]
    },
    // Missing return description (when required)
    {
      code: `
/**
 * Test
 * @param {number} x - Value
 * @returns {number}
 */
function test(x) {
  return x;
}
`,
      options: [{ requireReturnDescription: true }],
      errors: [{ messageId: "missingReturnDescription" }]
    },
    // Duplicate @param (also triggers order mismatch for duplicate name)
    {
      code: `
/**
 * Test
 * @param {number} x - First
 * @param {number} x - Second
 */
function test(x) {}
`,
      errors: [
        { messageId: "duplicateParam", data: { name: "x" } },
        { messageId: "paramOrderMismatch" }
      ]
    },
    // Multiple missing params (with autofix for first one)
    {
      code: `
/**
 * Test function
 */
function test(a, b, c) {}
`,
      errors: [
        { messageId: "missingParam", data: { name: "a" } },
        { messageId: "missingParam", data: { name: "b" } },
        { messageId: "missingParam", data: { name: "c" } }
      ],
      output: `
/**
 * Test function
 * @param {*} a - [description]
 */
function test(a, b, c) {}
`
    },
    // Method missing @param
    {
      code: `
class Calc {
  /**
   * Add
   * @returns {number} Sum
   */
  add(a, b) {
    return a + b;
  }
}
`,
      errors: [
        { messageId: "missingParam", data: { name: "a" } },
        { messageId: "missingParam", data: { name: "b" } }
      ]
    },
    // Method missing @returns
    {
      code: `
class Calc {
  /**
   * Get value
   * @param {number} x - Input
   */
  getValue(x) {
    return x * 2;
  }
}
`,
      errors: [{ messageId: "missingReturns" }]
    }
  ]
});
