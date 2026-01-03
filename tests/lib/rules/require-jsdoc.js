/**
 * @fileoverview Tests for require-jsdoc rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/require-jsdoc");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  }
});

ruleTester.run("require-jsdoc", rule, {
  valid: [
    // Exported function with JSDoc
    {
      code: `
/** This is a function */
export function foo() {}
`
    },
    // Exported arrow function with JSDoc
    {
      code: `
/** This is a function */
export const foo = () => {};
`
    },
    // Default export with JSDoc
    {
      code: `
/** This is a function */
export default function foo() {}
`
    },
    // Non-exported function (should not require JSDoc)
    {
      code: `
function internalFunc() {
  return 42;
}
`
    },
    // Non-exported arrow function
    {
      code: `
const internalFunc = () => {
  return 42;
};
`
    },
    // Empty function with exemptEmptyFunctions option
    {
      code: `
export function noop() {}
`,
      options: [{ exemptEmptyFunctions: true }]
    },
    // Function below minLineCount
    {
      code: `
export const short = () => 1;
`,
      options: [{ minLineCount: 3 }]
    },
    // Class with JSDoc
    {
      code: `
/** MyClass description */
export class MyClass {
  /** Method description */
  myMethod() {}
}
`
    },
    // module.exports with JSDoc
    {
      code: `
/** This is a function */
module.exports = function() {};
`
    },
    // exports.foo with JSDoc
    {
      code: `
/** This is a function */
exports.foo = function() {};
`
    },
    // Disabled function declaration checking
    {
      code: `
export function foo() {}
`,
      options: [{ require: { FunctionDeclaration: false } }]
    },
    // Disabled arrow function checking
    {
      code: `
export const foo = () => {};
`,
      options: [{ require: { ArrowFunctionExpression: false } }]
    },
    // Disabled class checking
    {
      code: `
export class MyClass {}
`,
      options: [{ require: { ClassDeclaration: false } }]
    },
    // Re-export (no declaration to document)
    {
      code: `
export { foo } from './other';
`
    },
    // Variable export without function
    {
      code: `
export const value = 42;
`
    }
  ],

  invalid: [
    // Missing JSDoc on exported function
    {
      code: `
export function foo() {
  return 1;
}
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "foo" } }],
      output: `
/**
 * [Description]
 * @returns {*} [description]
 */
export function foo() {
  return 1;
}
`
    },
    // Missing JSDoc on exported arrow function
    {
      code: `
export const bar = (x, y) => {
  return x + y;
};
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "bar" } }],
      output: `
/**
 * [Description]
 * @param {*} x - [description]
 * @param {*} y - [description]
 * @returns {*} [description]
 */
export const bar = (x, y) => {
  return x + y;
};
`
    },
    // Missing JSDoc on default export
    {
      code: `
export default function() {
  return 1;
}
`,
      errors: [{ messageId: "missingJSDocDefault" }],
      output: `
/**
 * [Description]
 * @returns {*} [description]
 */
export default function() {
  return 1;
}
`
    },
    // Missing JSDoc on default export with name
    {
      code: `
export default function myFunc() {
  return 1;
}
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "myFunc" } }],
      output: `
/**
 * [Description]
 * @returns {*} [description]
 */
export default function myFunc() {
  return 1;
}
`
    },
    // Missing JSDoc on class
    {
      code: `
export class MyClass {}
`,
      errors: [{ messageId: "missingJSDocClass", data: { name: "MyClass" } }],
      output: `
/**
 * [Description]
 */
export class MyClass {}
`
    },
    // Missing JSDoc on class method
    {
      code: "/** MyClass */\nexport class MyClass {\n  myMethod(a) {\n    return a;\n  }\n}",
      errors: [{ messageId: "missingJSDocMethod", data: { name: "myMethod" } }],
      output: "/** MyClass */\nexport class MyClass {\n  /**\n   * [Description]\n   * @param {*} a - [description]\n   * @returns {*} [description]\n   */\n  myMethod(a) {\n    return a;\n  }\n}"
    },
    // Missing JSDoc on module.exports function
    {
      code: `
module.exports = function(a, b) {
  return a + b;
};
`,
      errors: [{ messageId: "missingJSDocDefault" }],
      output: `
/**
 * [Description]
 * @param {*} a - [description]
 * @param {*} b - [description]
 * @returns {*} [description]
 */
module.exports = function(a, b) {
  return a + b;
};
`
    },
    // Missing JSDoc on exports.foo
    {
      code: `
exports.myFunc = function(x) {
  return x * 2;
};
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "myFunc" } }],
      output: `
/**
 * [Description]
 * @param {*} x - [description]
 * @returns {*} [description]
 */
exports.myFunc = function(x) {
  return x * 2;
};
`
    },
    // Function with rest parameter
    {
      code: `
export function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "sum" } }],
      output: `
/**
 * [Description]
 * @param {...*} numbers - [description]
 * @returns {*} [description]
 */
export function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
`
    },
    // Function with default parameter
    {
      code: `
export function greet(name = "World") {
  return "Hello, " + name;
}
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "greet" } }],
      output: `
/**
 * [Description]
 * @param {*} [name] - [description]
 * @returns {*} [description]
 */
export function greet(name = "World") {
  return "Hello, " + name;
}
`
    },
    // Arrow function expression body (implicit return)
    {
      code: `
export const double = x => x * 2;
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "double" } }],
      output: `
/**
 * [Description]
 * @param {*} x - [description]
 * @returns {*} [description]
 */
export const double = x => x * 2;
`
    },
    // Function with no return value
    {
      code: `
export function logMessage(msg) {
  console.log(msg);
}
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "logMessage" } }],
      output: `
/**
 * [Description]
 * @param {*} msg - [description]
 */
export function logMessage(msg) {
  console.log(msg);
}
`
    },
    // Default exported arrow function
    {
      code: `
export default (x) => x + 1;
`,
      errors: [{ messageId: "missingJSDocDefault" }],
      output: `
/**
 * [Description]
 * @param {*} x - [description]
 * @returns {*} [description]
 */
export default (x) => x + 1;
`
    },
    // module.exports.foo
    {
      code: `
module.exports.helper = (a) => a * 2;
`,
      errors: [{ messageId: "missingJSDoc", data: { name: "helper" } }],
      output: `
/**
 * [Description]
 * @param {*} a - [description]
 * @returns {*} [description]
 */
module.exports.helper = (a) => a * 2;
`
    }
  ]
});
