/**
 * @fileoverview Tests for comment-spacing rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/comment-spacing");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("comment-spacing", rule, {
    valid: [
        // Proper spacing
        {
            code: "// This has a space after //"
        },

        // Empty comment (allowed)
        {
            code: "//"
        },

        // Triple slash (allowed - could be reference)
        {
            code: "/// <reference path='types.d.ts' />"
        },

        // Block comment with space
        {
            code: "/* This has proper spacing. */"
        },

        // Multi-line block with proper spacing
        {
            code: "/*\n * Line 1.\n * Line 2.\n */"
        },

        // Disabled check
        {
            code: "//NoSpace",
            options: [{ requireSpaceAfterLine: false }]
        }
    ],

    invalid: [
        // Missing space after //
        {
            code: "//Missing space",
            errors: [{ messageId: "missingSpaceAfterLine" }],
            output: "// Missing space"
        },

        // Missing space in block comment
        {
            code: "/*NoSpace*/",
            errors: [{ messageId: "missingSpaceAfterBlock" }],
            output: "/* NoSpace */"
        },

        // Missing space in multi-line block
        {
            code: "/*\n *Line 1\n */",
            errors: [{ messageId: "missingSpaceAfterBlock" }],
            output: "/*\n * Line 1\n */"
        }
    ]
});
