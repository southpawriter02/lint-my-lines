/**
 * @fileoverview Tests for enforce-comment-length rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/enforce-comment-length");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("enforce-comment-length", rule, {
    valid: [
        // Default max (120) - under limit
        {
            code: "// This is a normal comment that is well within the limit."
        },

        // Custom max length - at limit
        {
            code: "// Short.",
            options: [{ maxLength: 10 }]
        },

        // Min length satisfied
        {
            code: "// This is long enough.",
            options: [{ minLength: 5 }]
        },

        // URL ignored in length
        {
            code: "// See https://example.com/very/long/url/that/would/normally/exceed/limits for details.",
            options: [{ maxLength: 30, ignoreUrls: true }]
        },

        // JSDoc skipped
        {
            code: "/** @param {string} name - The name parameter which is quite long. */"
        },

        // Block comment under limit
        {
            code: "/* A short block comment. */"
        }
    ],

    invalid: [
        // Exceeds max length
        {
            code: "// This comment is definitely way too long and exceeds the maximum allowed length for comments in this codebase.",
            options: [{ maxLength: 50 }],
            errors: [{ messageId: "tooLong" }]
        },

        // Below min length
        {
            code: "// Hi",
            options: [{ minLength: 10 }],
            errors: [{ messageId: "tooShort" }]
        },

        // URL not ignored
        {
            code: "// See https://example.com/long/url for more information and details.",
            options: [{ maxLength: 30, ignoreUrls: false }],
            errors: [{ messageId: "tooLong" }]
        },

        // Block comment too long
        {
            code: "/* This block comment is way too long. */",
            options: [{ maxLength: 20 }],
            errors: [{ messageId: "tooLong" }]
        }
    ]
});
