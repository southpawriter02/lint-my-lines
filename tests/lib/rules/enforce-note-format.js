/**
 * @fileoverview Tests for enforce-note-format rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/enforce-note-format");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("enforce-note-format", rule, {
    valid: [
        {
            code: "// A regular comment."
        },
        {
            code: "// NOTE (jules): This approach is intentional."
        },
        {
            code: "// NOTE (performance): Using bitwise operations for speed."
        },
        {
            code: "/*\n * NOTE (architecture): This pattern enables extensibility.\n */"
        },
        // Custom pattern option
        {
            code: "// NOTE [jules]: Custom format.",
            options: [{ pattern: "^NOTE\\s*\\[[^\\]]+\\]:" }]
        }
    ],
    invalid: [
        {
            code: "// NOTE: This is important.",
            errors: [{ messageId: "invalidNoteFormat" }],
            output: "// NOTE (author): This is important."
        },
        {
            code: "// NOTE (): Missing reference.",
            errors: [{ messageId: "invalidNoteFormat" }],
            output: "// NOTE (author): (): Missing reference."
        },
        {
            code: "// NOTE This is noteworthy.",
            errors: [{ messageId: "invalidNoteFormat" }],
            output: "// NOTE (author): This is noteworthy."
        },
        {
            code: "/* NOTE: Invalid format in block comment. */",
            errors: [{ messageId: "invalidNoteFormat" }],
            output: "/* NOTE (author): Invalid format in block comment. */"
        },
        {
            code: "// NOTE (missing-colon) This will fail.",
            errors: [{ messageId: "invalidNoteFormat" }],
            output: "// NOTE (author): (missing-colon) This will fail."
        }
    ]
});
