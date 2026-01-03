/**
 * @fileoverview Tests for no-obvious-comments rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/no-obvious-comments");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2020
    }
});

ruleTester.run("no-obvious-comments", rule, {
    valid: [
        // Comments that explain "why"
        {
            code: `
                // Business rule: users get 1 day grace period
                dueDate.add(1, 'day');
            `
        },
        {
            code: `
                // Workaround for Safari bug #1234
                element.style.transform = 'translateZ(0)';
            `
        },
        {
            code: `
                // Performance optimization: bitwise faster than Math.floor
                const intValue = value | 0;
            `
        },

        // TODO/FIXME/NOTE comments (should be ignored)
        {
            code: `
                // TODO (TICKET-123): Optimize this later
                i++;
            `
        },
        {
            code: `
                function test() {
                    // FIXME: This needs refactoring
                    return value;
                }
            `
        },
        {
            code: `
                // NOTE: Intentionally using var here
                var legacy = true;
            `
        },

        // JSDoc (should be ignored)
        {
            code: `
                /** @param {number} value - The value to process */
                function process(value) {}
            `
        },
        {
            code: `
                /**
                 * @returns {number} The calculated result
                 */
                function calculate() { return 42; }
            `
        },

        // URLs (should be ignored)
        {
            code: `
                // See https://example.com/docs for more info
                const x = 1;
            `
        },

        // Comments with backticks (should be ignored)
        {
            code: "// The `i++` syntax is preferred\ni++;"
        },

        // Longer, meaningful comments
        {
            code: `
                // This loop processes all pending items in the queue and marks them as complete
                for (const item of items) {
                    process(item);
                }
            `
        },

        // Comments with "because", "since", etc.
        {
            code: `
                // Using var because of hoisting requirements
                var count = 0;
            `
        },
        {
            code: `
                // Required for legacy browser compatibility
                if (condition) {}
            `
        },

        // eslint directives (should be ignored)
        {
            code: `
                // eslint-disable-next-line no-console
                console.log('debug');
            `
        },

        // Comments not matching adjacent code
        {
            code: `
                // Initialize the user session
                const config = loadConfig();
            `
        },

        // Option: checkLeadingComments false
        {
            code: `
                // increment i
                i++;
            `,
            options: [{ checkLeadingComments: false }]
        },

        // Option: checkTrailingComments false
        {
            code: "i++; // increment i",
            options: [{ checkTrailingComments: false }]
        },

        // Low sensitivity - partial matches should pass
        {
            code: `
                // increment the counter variable
                i++;
            `,
            options: [{ sensitivity: "low" }]
        },

        // Custom ignore pattern
        {
            code: `
                // DEBUG: increment i
                i++;
            `,
            options: [{ ignorePatterns: ["^DEBUG:"] }]
        }
    ],

    invalid: [
        // Increment comments
        {
            code: `
                // increment i
                i++;
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // increment counter
                counter++;
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Return comments
        {
            code: `
                function test() {
                    // return value
                    return value;
                }
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                function test() {
                    // return result
                    return result;
                }
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                function test() {
                    // returns the value
                    return value;
                }
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Function call comments
        {
            code: `
                // call doSomething
                doSomething();
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // invoke process
                process();
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Variable declaration comments
        {
            code: `
                // declare x
                const x = 5;
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // set count
                let count = 0;
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // create variable
                const data = {};
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Loop comments
        {
            code: `
                // loop through items
                for (const item of items) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // iterate
                for (let i = 0; i < 10; i++) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // for loop
                for (const x of arr) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Conditional comments
        {
            code: `
                // check if
                if (condition) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // if statement
                if (valid) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Assignment comments
        {
            code: `
                // set x
                x = 5;
            `,
            errors: [{ messageId: "obviousComment" }]
        },
        {
            code: `
                // assign value
                value = getData();
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Block comments
        {
            code: `
                /* increment i */
                i++;
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // High sensitivity catches more
        {
            code: `
                // incrementing the i variable
                i++;
            `,
            options: [{ sensitivity: "high" }],
            errors: [{ messageId: "obviousComment" }]
        },

        // Decrement
        {
            code: `
                // decrement count
                count--;
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Function declaration
        {
            code: `
                // function process
                function process() {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Class declaration
        {
            code: `
                // class User
                class User {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Switch statement
        {
            code: `
                // switch statement
                switch (value) { case 1: break; }
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Try/catch
        {
            code: `
                // try catch
                try {} catch (e) {}
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Break (inside a valid loop context)
        {
            code: `
                for (let i = 0; i < 10; i++) {
                    // break loop
                    break;
                }
            `,
            errors: [{ messageId: "obviousComment" }]
        },

        // Throw
        {
            code: `
                // throw error
                throw new Error('oops');
            `,
            errors: [{ messageId: "obviousComment" }]
        }
    ]
});
