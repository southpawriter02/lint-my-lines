/**
 * @fileoverview Tests for enforce-capitalization rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/enforce-capitalization");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("enforce-capitalization", rule, {
    valid: [
        // Properly capitalized
        {
            code: "// This comment starts with a capital letter."
        },
        {
            code: "// A good comment."
        },

        // JSDoc tags (skip)
        {
            code: "// @param name - the name"
        },

        // URL (skip)
        {
            code: "// https://example.com"
        },

        // eslint directive (skip)
        {
            code: "// eslint-disable-next-line"
        },

        // Inline code (skip)
        {
            code: "// `functionName` is called here"
        },

        // File path (skip)
        {
            code: "// ./path/to/file.js"
        },

        // Numbers and symbols at start
        {
            code: "// 123 items in the list."
        },

        // Block comment capitalized
        {
            code: "/* This is properly capitalized. */"
        },

        // Custom ignore pattern
        {
            code: "// myFunction is used here",
            options: [{ ignorePatterns: ["^myFunction"] }]
        }
    ],

    invalid: [
        // Lowercase start
        {
            code: "// this should be capitalized.",
            errors: [{ messageId: "notCapitalized" }],
            output: "// This should be capitalized."
        },

        // Block comment lowercase
        {
            code: "/* lowercase block comment. */",
            errors: [{ messageId: "notCapitalized" }],
            output: "/* Lowercase block comment. */"
        },

        // After whitespace
        {
            code: "//  lowercase after spaces",
            errors: [{ messageId: "notCapitalized" }],
            output: "//  Lowercase after spaces"
        }
    ]
});
