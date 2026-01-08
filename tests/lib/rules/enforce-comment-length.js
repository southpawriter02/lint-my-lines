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
        },

        // Edge case: Comment exactly at max boundary (120 chars = "// " + 117 chars)
        {
            code: "// " + "x".repeat(117),
            options: [{ maxLength: 120 }]
        },

        // Edge case: Comment with emoji (should count by characters, not code points)
        {
            code: "// Test with emoji 👍 inside comment.",
            options: [{ maxLength: 50 }]
        },

        // Edge case: Comment with Unicode characters
        {
            code: "// Überprüfen Sie diese Änderung.",
            options: [{ maxLength: 50 }]
        },

        // Edge case: Comment with multiple URLs
        {
            code: "// See https://example.com and https://docs.example.org for info.",
            options: [{ maxLength: 30, ignoreUrls: true }]
        },

        // Edge case: Comment with http:// URL
        {
            code: "// Check http://legacy.example.com for old docs.",
            options: [{ maxLength: 30, ignoreUrls: true }]
        },

        // Edge case: Comment at exactly min length
        {
            code: "// 12345",
            options: [{ minLength: 5 }]
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
        },

        // Edge case: Comment one character over max boundary
        {
            code: "// " + "x".repeat(118),
            options: [{ maxLength: 120 }],
            errors: [{ messageId: "tooLong" }]
        },

        // Edge case: Comment with ftp:// URL (not ignored - only http/https)
        {
            code: "// Check ftp://files.example.com for resources.",
            options: [{ maxLength: 20, ignoreUrls: true }],
            errors: [{ messageId: "tooLong" }]
        },

        // Edge case: Comment one character below min length
        {
            code: "// 1234",
            options: [{ minLength: 5 }],
            errors: [{ messageId: "tooShort" }]
        },

        // Edge case: Empty comment (below any min length)
        {
            code: "//",
            options: [{ minLength: 1 }],
            errors: [{ messageId: "tooShort" }]
        }
    ]
});
