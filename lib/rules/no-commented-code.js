/**
 * @fileoverview Detects and flags commented-out code.
 * @author Jules
 */
"use strict";

// Patterns that indicate code-like constructs
const CODE_PATTERNS = [
    // Declarations
    /^\s*(const|let|var)\s+\w+\s*=/,
    /^\s*function\s+\w+\s*\(/,
    /^\s*class\s+\w+/,
    /^\s*(import|export)\s+/,
    /^\s*async\s+(function|const|let)/,

    // Statements with semicolons
    /;\s*$/,

    // Arrow functions
    /=>\s*[{(]/,
    /\w+\s*=\s*\([^)]*\)\s*=>/,

    // Function calls
    /^\s*\w+\s*\([^)]*\)\s*;?\s*$/,

    // Object/array literals with assignment
    /^\s*\w+\s*=\s*[{\[]/,

    // Method chaining
    /^\s*\.\w+\(/,

    // Return statements
    /^\s*return\s+/,

    // Control flow
    /^\s*(if|else|for|while|switch|try|catch)\s*[\({]/,

    // Common patterns
    /^\s*console\.(log|warn|error|info)\(/,
    /^\s*throw\s+new\s+\w+/,
];

// Patterns to skip (documentation, action comments, etc.)
const SKIP_PATTERNS = [
    // Action comments
    /^\s*(TODO|FIXME|NOTE|HACK|XXX|BUG)\b/i,

    // JSDoc patterns
    /^\s*\*?\s*@(param|returns?|type|typedef|example|see|link|description|file|author)/i,

    // URLs
    /https?:\/\//,

    // File paths (but not imports)
    /^\s*[A-Za-z]:\\|^\s*\/[A-Za-z]/,

    // License headers
    /^\s*\*?\s*(copyright|license|licensed|MIT|Apache|GPL)/i,

    // eslint directives
    /^\s*eslint-/,

    // Simple word comments (descriptions)
    /^[A-Z][a-z]+(\s+[a-z]+){0,10}\.?$/,
];

/**
 * Check if a line looks like commented-out code
 * @param {string} line - The comment line to check
 * @returns {boolean} - True if it looks like code
 */
function looksLikeCode(line) {
    // Check if we should skip this line
    for (const pattern of SKIP_PATTERNS) {
        if (pattern.test(line)) {
            return false;
        }
    }

    // Check if it matches code patterns
    for (const pattern of CODE_PATTERNS) {
        if (pattern.test(line)) {
            return true;
        }
    }

    return false;
}

/**
 * Count code-like lines in a comment
 * @param {string} value - The comment value
 * @returns {number} - Number of lines that look like code
 */
function countCodeLines(value) {
    const lines = value.split("\n").map(line => {
        // Remove comment prefixes (* for block comments)
        return line.replace(/^\s*\*\s?/, "").trim();
    });

    return lines.filter(line => line && looksLikeCode(line)).length;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow commented-out code",
            category: "Best Practices",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md#avoid-commented-out-code"
        },
        schema: [
            {
                type: "object",
                properties: {
                    threshold: {
                        type: "integer",
                        minimum: 1,
                        description: "Minimum number of code-like lines before flagging"
                    },
                    allowPatterns: {
                        type: "array",
                        items: { type: "string" },
                        description: "Regex patterns to allow (not flag)"
                    }
                },
                additionalProperties: false
            }
        ],
        messages: {
            noCommentedCode: "Commented-out code detected. Use version control (git stash, branches) to save code for later instead of commenting it out."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};
        const threshold = options.threshold || 1;
        const allowPatterns = (options.allowPatterns || []).map(p => new RegExp(p));

        return {
            Program() {
                const comments = sourceCode.getAllComments();

                comments.forEach(comment => {
                    const value = comment.value.trim();

                    // Check allow patterns
                    for (const pattern of allowPatterns) {
                        if (pattern.test(value)) {
                            return;
                        }
                    }

                    // Count code-like lines
                    const codeLineCount = countCodeLines(value);

                    if (codeLineCount >= threshold) {
                        context.report({
                            node: null,
                            loc: comment.loc,
                            messageId: "noCommentedCode"
                        });
                    }
                });
            }
        };
    }
};
