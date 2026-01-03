/**
 * @fileoverview Tests for no-commented-code rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/no-commented-code");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("no-commented-code", rule, {
    valid: [
        // Regular comments
        {
            code: "// This is a regular comment."
        },
        {
            code: "// Explaining why this function exists."
        },
        {
            code: "/* A block comment explaining the algorithm. */"
        },

        // Action comments (should be ignored)
        {
            code: "// TODO (TICKET-123): Add validation here."
        },
        {
            code: "// FIXME (BUG-456): Handle edge case."
        },
        {
            code: "// NOTE (jules): This is intentional."
        },

        // JSDoc (should be ignored)
        {
            code: "/** @param {string} name - The user's name. */"
        },
        {
            code: "/** @returns {number} The calculated value. */"
        },
        {
            code: "/**\n * @file This module handles authentication.\n * @author Jules\n */"
        },

        // URLs (should be ignored)
        {
            code: "// See https://example.com/docs for more info."
        },

        // ESLint directives
        {
            code: "// eslint-disable-next-line no-console"
        },

        // Threshold option - below threshold
        {
            code: "// const x = 1;",
            options: [{ threshold: 2 }]
        },

        // Allow patterns
        {
            code: "// const debugMode = true;",
            options: [{ allowPatterns: ["debugMode"] }]
        }
    ],

    invalid: [
        // Commented function
        {
            code: "// function oldHandler() {",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented variable declaration
        {
            code: "// const oldValue = calculateSomething();",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented import
        {
            code: "// import { something } from 'module';",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented console.log
        {
            code: "// console.log('debug');",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented return statement
        {
            code: "// return oldValue;",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented arrow function
        {
            code: "// const handler = () => {",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Block comment with code
        {
            code: "/* const x = 1; */",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Multi-line block comment with code
        {
            code: "/*\n * function oldFunction() {\n *   return true;\n * }\n */",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Commented class
        {
            code: "// class OldComponent {",
            errors: [{ messageId: "noCommentedCode" }]
        },

        // Threshold met
        {
            code: "/*\n * const a = 1;\n * const b = 2;\n */",
            options: [{ threshold: 2 }],
            errors: [{ messageId: "noCommentedCode" }]
        }
    ]
});
