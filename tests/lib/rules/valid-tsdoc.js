/**
 * @fileoverview Tests for valid-tsdoc rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/valid-tsdoc");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("valid-tsdoc", rule, {
  valid: [
    // Standard JSDoc tags are allowed
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
`,
    },

    // TSDoc tags are allowed
    {
      code: `
/**
 * A generic container
 * @typeParam T - The type of items in the container
 * @remarks This class provides type-safe storage
 */
function Container() {}
`,
    },

    // Mixed JSDoc and TSDoc tags
    {
      code: `
/**
 * Process data with a transformer
 * @param {*} data - Input data
 * @typeParam T - Output type
 * @remarks Transforms data according to the provided rules
 * @beta
 */
function process(data) {}
`,
    },

    // Stability markers
    {
      code: `
/**
 * Experimental feature
 * @alpha
 */
function experimental() {}
`,
    },

    // @override tag
    {
      code: `
/**
 * Override parent method
 * @override
 */
function method() {}
`,
    },

    // @internal tag
    {
      code: `
/**
 * Internal implementation detail
 * @internal
 */
function _internal() {}
`,
    },

    // @defaultValue tag
    {
      code: `
/**
 * Configuration options
 * @defaultValue { timeout: 1000 }
 */
const config = {};
`,
    },

    // @sealed and @virtual
    {
      code: `
/**
 * Base class
 * @sealed
 */
function BaseClass() {}

/**
 * Method that can be overridden
 * @virtual
 */
function overridable() {}
`,
    },

    // Custom allowed tags
    {
      code: `
/**
 * Custom documented function
 * @customTag This is allowed
 */
function custom() {}
`,
      options: [{ allowedTags: ["customTag"] }],
    },

    // No JSDoc comment (rule doesn't require one)
    {
      code: `
function noDoc() {
  return 42;
}
`,
    },

    // @remarks on public API when required
    {
      code: `
/**
 * Public function
 * @remarks This function does important things
 */
export function publicFunc() {}
`,
      options: [{ requireRemarks: true }],
    },

    // Non-exported function doesn't need @remarks
    {
      code: `
/**
 * Private function
 */
function privateFunc() {}
`,
      options: [{ requireRemarks: true }],
    },

    // @inheritDoc tag
    {
      code: `
/**
 * @inheritDoc
 */
function inheriting() {}
`,
    },
  ],

  invalid: [
    // Unknown tag
    {
      code: `
/**
 * Function with unknown tag
 * @foobar This is not a valid tag
 */
function test() {}
`,
      errors: [
        {
          messageId: "unknownTag",
          data: { tag: "foobar" },
        },
      ],
    },

    // Banned tag
    {
      code: `
/**
 * Function with banned tag
 * @deprecated Use newFunction instead
 */
function oldFunction() {}
`,
      options: [{ bannedTags: ["deprecated"] }],
      errors: [
        {
          messageId: "bannedTag",
          data: { tag: "deprecated", reason: "This tag is not allowed." },
        },
      ],
    },

    // Banned tag with custom reason
    {
      code: `
/**
 * Function with banned tag
 * @constructor Not needed in modern JS
 */
function MyClass() {}
`,
      options: [
        {
          bannedTags: [
            { tag: "constructor", reason: "Use ES6 class syntax instead." },
          ],
        },
      ],
      errors: [
        {
          messageId: "bannedTag",
          data: { tag: "constructor", reason: "Use ES6 class syntax instead." },
        },
      ],
    },

    // Multiple unknown tags
    {
      code: `
/**
 * Function with multiple unknown tags
 * @unknown1 First unknown
 * @unknown2 Second unknown
 */
function test() {}
`,
      errors: [
        { messageId: "unknownTag", data: { tag: "unknown1" } },
        { messageId: "unknownTag", data: { tag: "unknown2" } },
      ],
    },

    // Missing @remarks on public API
    {
      code: `
/**
 * Public function without remarks
 * @param {string} name - The name
 */
export function publicFunc(name) {}
`,
      options: [{ requireRemarks: true }],
      errors: [{ messageId: "missingRemarks" }],
    },

    // Duplicate @typeParam
    {
      code: `
/**
 * Generic function
 * @typeParam T - First definition
 * @typeParam T - Duplicate definition
 */
function generic() {}
`,
      errors: [
        {
          messageId: "duplicateTypeParam",
          data: { name: "T" },
        },
      ],
    },
  ],
});
