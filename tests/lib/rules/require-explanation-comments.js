/**
 * @fileoverview Tests for require-explanation-comments rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/require-explanation-comments");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020
    }
});

ruleTester.run("require-explanation-comments", rule, {
    valid: [
        // Regex with comment
        {
            code: `
                // Match email addresses with format: user@domain.tld
                const emailRegex = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;
            `
        },

        // Bitwise with comment
        {
            code: `
                // Using bitwise OR to convert float to int (faster than Math.floor)
                const intValue = value | 0;
            `
        },

        // Ternary chain with comment
        {
            code: `
                // Determine status based on priority and approval
                const status = priority > 5
                    ? (approved ? "urgent" : "pending")
                    : "normal";
            `
        },

        // Deep nesting with comment
        {
            code: `
                if (a) {
                    for (const x of items) {
                        if (b) {
                            // Handle the specific edge case where all conditions are met
                            while (running) {
                                process();
                            }
                        }
                    }
                }
            `
        },

        // Recursion with comment
        {
            code: `
                function findNode(tree, id) {
                    if (tree.id === id) return tree;
                    // Recursively search children to find matching node
                    return findNode(tree.children, id);
                }
            `
        },

        // Complex condition with comment
        {
            code: `
                // User must be admin, verified, and either premium or have special access
                if ((isAdmin && isVerified) && (isPremium || hasSpecialAccess)) {
                    grantAccess();
                }
            `,
            options: [{ requireFor: ["complex-condition"] }]
        },

        // JSDoc counts as meaningful comment
        {
            code: `
                /** @type {RegExp} Matches valid URLs */
                const urlPattern = /https?:\\/\\/[^\\s]+/;
            `
        },

        // Simple regex without requireFor: regex
        {
            code: `
                const pattern = /^[a-z]+$/;
            `,
            options: [{ requireFor: ["bitwise"] }]
        },

        // Single ternary (below threshold)
        {
            code: `
                const x = condition ? 1 : 2;
            `
        },

        // Simple condition (below threshold)
        {
            code: `
                if (a && b) {}
            `,
            options: [{ requireFor: ["complex-condition"] }]
        },

        // Nesting below threshold
        {
            code: `
                if (a) {
                    if (b) {
                        doSomething();
                    }
                }
            `
        },

        // Custom nesting threshold
        {
            code: `
                if (a) {
                    for (const x of items) {
                        if (b) {
                            while (c) {}
                        }
                    }
                }
            `,
            options: [{ nestingDepth: 5 }]
        },

        // Ignore pattern
        {
            code: `
                const simplePattern = /\\s+/;
            `,
            options: [{ ignorePatterns: ["\\\\s\\+"] }]
        },

        // Non-recursive call with same name in different scope
        {
            code: `
                function process() {
                    const data = fetch();
                    return data;
                }
            `,
            options: [{ requireFor: ["recursion"] }]
        }
    ],

    invalid: [
        // Regex without comment
        {
            code: `
                const emailRegex = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;
            `,
            errors: [{ messageId: "regexNeedsComment" }]
        },

        // Bitwise without comment
        {
            code: `
                const flags = (read << 2) | (write << 1) | execute;
            `,
            errors: [{ messageId: "bitwiseNeedsComment" }]
        },

        // Bitwise NOT without comment
        {
            code: `
                const floored = ~~value;
            `,
            options: [{ requireFor: ["bitwise"] }],
            errors: [{ messageId: "bitwiseNeedsComment" }]
        },

        // Ternary chain without comment
        {
            code: `
                const result = a ? b ? c : d : e;
            `,
            errors: [{ messageId: "ternaryChainNeedsComment" }]
        },

        // Longer ternary chain
        {
            code: `
                const x = a ? b ? c ? 1 : 2 : 3 : 4;
            `,
            errors: [{ messageId: "ternaryChainNeedsComment" }]
        },

        // Deep nesting without comment
        {
            code: `
                if (a) {
                    for (const x of items) {
                        if (b) {
                            while (c) {
                                process();
                            }
                        }
                    }
                }
            `,
            errors: [{ messageId: "deepNesting" }]
        },

        // Recursion without comment
        {
            code: `
                function factorial(n) {
                    if (n <= 1) return 1;
                    return n * factorial(n - 1);
                }
            `,
            options: [{ requireFor: ["recursion"] }],
            errors: [{ messageId: "recursionNeedsComment" }]
        },

        // Complex condition without comment
        {
            code: `
                if (a && b && c && d) {
                    doSomething();
                }
            `,
            options: [{ requireFor: ["complex-condition"] }],
            errors: [{ messageId: "complexConditionNeedsComment" }]
        },

        // Complex condition with OR
        {
            code: `
                if ((a || b) && (c || d) && e) {
                    doSomething();
                }
            `,
            options: [{ requireFor: ["complex-condition"], conditionComplexity: 3 }],
            errors: [{ messageId: "complexConditionNeedsComment" }]
        },

        // Trivial comment doesn't count
        {
            code: `
                // loop
                if (a) {
                    for (const x of items) {
                        if (b) {
                            while (c) {}
                        }
                    }
                }
            `,
            errors: [{ messageId: "deepNesting" }]
        },

        // Custom ternary threshold
        {
            code: `
                const x = a ? b : c;
            `,
            options: [{ ternaryChainLength: 1 }],
            errors: [{ messageId: "ternaryChainNeedsComment" }]
        },

        // Named function recursion in expression
        {
            code: `
                const factorial = function fact(n) {
                    if (n <= 1) return 1;
                    return n * fact(n - 1);
                };
            `,
            options: [{ requireFor: ["recursion"] }],
            errors: [{ messageId: "recursionNeedsComment" }]
        },

        // Multiple issues in one file
        {
            code: `
                const pattern = /complex/;
                const bits = a | b;
            `,
            options: [{ requireFor: ["regex", "bitwise"] }],
            errors: [
                { messageId: "regexNeedsComment" },
                { messageId: "bitwiseNeedsComment" }
            ]
        },

        // Lower nesting threshold
        {
            code: `
                if (a) {
                    if (b) {
                        doSomething();
                    }
                }
            `,
            options: [{ nestingDepth: 1 }],
            errors: [{ messageId: "deepNesting" }]
        },

        // Arrow function recursion
        {
            code: `
                const fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2);
            `,
            options: [{ requireFor: ["recursion", "ternary"] }],
            errors: [{ messageId: "recursionNeedsComment" }]
        }
    ]
});
