/**
 * @fileoverview Tests for ban-specific-words rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/ban-specific-words");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run("ban-specific-words", rule, {
    valid: [
        // Regular comments without banned words
        {
            code: "// This is a regular comment."
        },
        {
            code: "// Using allowlist for approved domains."
        },
        {
            code: "// Using blocklist for blocked IPs."
        },
        {
            code: "/* A workaround for the browser bug. */"
        },

        // Banned word in URL (should be ignored)
        {
            code: "// See https://example.com/master/docs for more info."
        },

        // Banned word in backticks (should be ignored)
        {
            code: "// The `master` branch is protected."
        },

        // With includeDefaults: false and no custom words
        {
            code: "// This is a hack to fix it.",
            options: [{ includeDefaults: false }]
        },

        // Custom word not present
        {
            code: "// This is fine.",
            options: [{ bannedWords: ["forbidden"] }]
        },

        // Case sensitive matching - different case
        {
            code: "// This is a HACK.",
            options: [{ caseSensitive: true, includeDefaults: false, bannedWords: ["hack"] }]
        },

        // Whole word matching - partial match should pass
        {
            code: "// The whitespace is important.",
            options: [{ wholeWord: true }]
        },

        // TODO/FIXME format (should not match "fix" from "fix later")
        {
            code: "// TODO (TICKET-123): Resolve this bug properly."
        }
    ],

    invalid: [
        // Default banned word: hack
        {
            code: "// This is a hack to fix the bug.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// This is a workaround to fix the bug."
        },

        // Default banned word: whitelist
        {
            code: "// Add to the whitelist.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// Add to the allowlist."
        },

        // Default banned word: blacklist
        {
            code: "// Check the blacklist first.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// Check the blocklist first."
        },

        // Default banned word: master
        {
            code: "// Merge to master branch.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// Merge to main/primary branch."
        },

        // Default banned word: slave
        {
            code: "// The slave database.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// The secondary/replica database."
        },

        // Default banned word: fix later (no replacement, just reason)
        {
            code: "// Fix later when we have time.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// TODO (TICKET-XXX): when we have time."
        },

        // Default banned word: obvious (no replacement)
        {
            code: "// This is obvious.",
            errors: [{ messageId: "bannedWord" }]
        },

        // Default banned word: xxx
        {
            code: "// XXX need to address this.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// TODO need to address this."
        },

        // Custom banned word (string format)
        {
            code: "// This is forbidden.",
            options: [{ bannedWords: ["forbidden"], includeDefaults: false }],
            errors: [{ messageId: "bannedWord" }]
        },

        // Custom banned word (object format with replacement)
        {
            code: "// This is bad.",
            options: [{
                bannedWords: [{ word: "bad", replacement: "suboptimal", reason: "Be more specific" }],
                includeDefaults: false
            }],
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// This is suboptimal."
        },

        // Block comment
        {
            code: "/* This is a hack. */",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "/* This is a workaround. */"
        },

        // Case insensitive (default)
        {
            code: "// This is a HACK.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// This is a workaround."
        },

        // Case sensitive mode
        {
            code: "// This is a hack.",
            options: [{ caseSensitive: true, includeDefaults: false, bannedWords: ["hack"] }],
            errors: [{ messageId: "bannedWord" }]
        },

        // Non-whole word matching
        {
            code: "// Check the whitelisted items.",
            options: [{ wholeWord: false }],
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// Check the allowlisted items."
        },

        // Multiple occurrences - all get fixed
        {
            code: "// Use whitelist and blacklist.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// Use allowlist and blacklist."
        },

        // Magic number phrase
        {
            code: "// This magic number should be a constant.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// This named constant should be a constant."
        },

        // Kludge
        {
            code: "// This is a kludge.",
            errors: [{ messageId: "bannedWordWithReplacement" }],
            output: "// This is a workaround."
        },

        // Self-explanatory
        {
            code: "// This is self-explanatory.",
            errors: [{ messageId: "bannedWord" }]
        },

        // Clearly
        {
            code: "// Clearly this works.",
            errors: [{ messageId: "bannedWord" }]
        }
    ]
});
