/**
 * @fileoverview Tests for enforce-fixme-format rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/enforce-fixme-format");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("enforce-fixme-format", rule, {
    valid: [
        {
            code: "// A regular comment."
        },
        {
            code: "// FIXME (BUG-123): Fix this bug."
        },
        {
            code: "// FIXME (jules, 2025-08-18): Memory leak under load."
        },
        {
            code: "/*\n * FIXME (BUG-456): Address performance issue.\n */"
        },
        // Custom pattern option
        {
            code: "// FIXME #123: Custom format.",
            options: [{ pattern: "^FIXME\\s*#\\d+:" }]
        }
    ],
    invalid: [
        {
            code: "// FIXME: Fix this.",
            errors: [{ messageId: "invalidFixmeFormat" }],
            output: "// FIXME (BUG-XXX): Fix this."
        },
        {
            code: "// FIXME (): Missing reference.",
            errors: [{ messageId: "invalidFixmeFormat" }],
            output: "// FIXME (BUG-XXX): (): Missing reference."
        },
        {
            code: "// FIXME This is broken.",
            errors: [{ messageId: "invalidFixmeFormat" }],
            output: "// FIXME (BUG-XXX): This is broken."
        },
        {
            code: "/* FIXME: Invalid format in block comment. */",
            errors: [{ messageId: "invalidFixmeFormat" }],
            output: "/* FIXME (BUG-XXX): Invalid format in block comment. */"
        },
        {
            code: "// FIXME (missing-colon) This will fail.",
            errors: [{ messageId: "invalidFixmeFormat" }],
            output: "// FIXME (BUG-XXX): (missing-colon) This will fail."
        }
    ]
});
