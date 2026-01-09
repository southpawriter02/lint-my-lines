/**
 * @fileoverview Detects comments that restate the adjacent code without adding value.
 * @author Jules
 */
"use strict";

const { getAllCommentsCached, normalizeText } = require("../utils/comment-utils");
const { getCachedRegex } = require("../utils/performance-cache");
const {
  shouldSkipByContext,
  COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Patterns to skip (don't check for obviousness)
const SKIP_PATTERNS = [
    // JSDoc tags
    /^\s*\*?\s*@\w+/,
    // TODO/FIXME/NOTE comments
    /^\s*(TODO|FIXME|NOTE|HACK|XXX|BUG)\b/i,
    // URLs
    /https?:\/\//,
    // eslint directives
    /^\s*eslint/,
    // Code in backticks
    /`[^`]+`/,
    // License/copyright
    /^\s*\*?\s*(copyright|license|licensed)/i,
    // File paths
    /^[./\\]/,
];

// Words that indicate the comment explains "why" not "what"
const WHY_INDICATORS = [
    "because",
    "since",
    "due to",
    "workaround",
    "bug",
    "issue",
    "fix for",
    "needed for",
    "required for",
    "necessary",
    "important",
    "note:",
    "caveat",
    "warning",
    "caution",
    "intentional",
    "deliberately",
    "performance",
    "optimization",
    "compatibility",
    "legacy",
    "deprecated",
    "temporary",
    "business",
    "rule",
    "requirement",
];

/**
 * Get the first line of comment text (for block comments)
 * @param {Object} comment - The comment object
 * @returns {string} - The first line of comment text
 */
function getFirstCommentLine(comment) {
    let text = comment.value.trim();

    if (comment.type === "Block") {
        const lines = text.split("\n").map(line =>
            line.replace(/^\s*\*?\s?/, "").trim()
        ).filter(line => line.length > 0);

        text = lines[0] || "";
    }

    return text;
}

/**
 * Check if comment should be skipped
 * @param {string} text - The comment text
 * @returns {boolean} - True if should skip
 */
function shouldSkipComment(text) {
    // Skip empty or very short comments
    if (!text || text.length < 3) return true;

    // Check skip patterns
    for (const pattern of SKIP_PATTERNS) {
        if (pattern.test(text)) return true;
    }

    // Check for "why" indicators
    const lowerText = text.toLowerCase();
    for (const indicator of WHY_INDICATORS) {
        if (lowerText.includes(indicator)) return true;
    }

    return false;
}

/**
 * Get semantic descriptions for an AST node
 * @param {Object} node - The AST node
 * @returns {string[]} - Array of descriptions that would be "obvious"
 */
function getNodeDescriptions(node) {
    if (!node) return [];

    const descriptions = [];

    switch (node.type) {
        case "ExpressionStatement":
            // Recurse into the expression
            return getNodeDescriptions(node.expression);

        case "UpdateExpression": {
            const op = node.operator === "++" ? "increment" : "decrement";
            const name = node.argument && node.argument.name ? node.argument.name : "value";
            descriptions.push(
                `${op} ${name}`,
                op,
                `${name}++`,
                `${name}--`,
                `add 1 to ${name}`,
                `subtract 1 from ${name}`,
                `add one to ${name}`,
                `subtract one from ${name}`,
                `${op}ing ${name}`,
                `${op}s ${name}`
            );
            break;
        }

        case "ReturnStatement": {
            descriptions.push("return", "return value", "return result", "returns");
            if (node.argument) {
                if (node.argument.type === "Identifier") {
                    descriptions.push(
                        `return ${node.argument.name}`,
                        `return the ${node.argument.name}`,
                        `returns ${node.argument.name}`
                    );
                } else if (node.argument.type === "Literal") {
                    descriptions.push(`return ${node.argument.value}`);
                }
            }
            break;
        }

        case "CallExpression": {
            let name = "function";
            if (node.callee) {
                if (node.callee.type === "Identifier") {
                    name = node.callee.name;
                } else if (node.callee.type === "MemberExpression" && node.callee.property) {
                    name = node.callee.property.name || name;
                }
            }
            descriptions.push(
                `call ${name}`,
                `${name}`,
                `invoke ${name}`,
                `run ${name}`,
                `execute ${name}`,
                `calling ${name}`,
                `calls ${name}`
            );
            break;
        }

        case "VariableDeclaration": {
            const kind = node.kind;
            if (node.declarations && node.declarations.length > 0) {
                const decl = node.declarations[0];
                if (decl.id && decl.id.name) {
                    const name = decl.id.name;
                    descriptions.push(
                        `declare ${name}`,
                        `${kind} ${name}`,
                        `create ${name}`,
                        `define ${name}`,
                        `set ${name}`,
                        `initialize ${name}`,
                        `declaring ${name}`,
                        `creates ${name}`,
                        `variable ${name}`
                    );
                    if (decl.init && decl.init.type === "Literal") {
                        descriptions.push(
                            `set ${name} to ${decl.init.value}`,
                            `${name} equals ${decl.init.value}`,
                            `${name} is ${decl.init.value}`
                        );
                    }
                }
            }
            descriptions.push("declare variable", "create variable", "define variable");
            break;
        }

        case "AssignmentExpression": {
            let leftName = "variable";
            if (node.left && node.left.type === "Identifier") {
                leftName = node.left.name;
            }
            descriptions.push(
                `set ${leftName}`,
                `assign ${leftName}`,
                `${leftName} =`,
                `update ${leftName}`,
                `assign to ${leftName}`,
                `setting ${leftName}`,
                `assigns ${leftName}`
            );
            if (node.right && node.right.type === "Literal") {
                descriptions.push(
                    `set ${leftName} to ${node.right.value}`,
                    `${leftName} = ${node.right.value}`
                );
            }
            break;
        }

        case "IfStatement":
            descriptions.push(
                "if",
                "check if",
                "conditional",
                "check condition",
                "if statement",
                "condition check",
                "checking if",
                "checks if"
            );
            break;

        case "ForStatement":
        case "ForInStatement":
        case "ForOfStatement":
            descriptions.push(
                "loop",
                "for loop",
                "iterate",
                "iteration",
                "loop through",
                "iterate through",
                "iterate over",
                "looping",
                "loops"
            );
            break;

        case "WhileStatement":
        case "DoWhileStatement":
            descriptions.push(
                "while loop",
                "loop while",
                "loop",
                "while",
                "looping"
            );
            break;

        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression": {
            let funcName = "function";
            if (node.id && node.id.name) {
                funcName = node.id.name;
            }
            descriptions.push(
                `function ${funcName}`,
                `define ${funcName}`,
                `create function`,
                `declare function`,
                `${funcName} function`
            );
            break;
        }

        case "ClassDeclaration": {
            let className = "class";
            if (node.id && node.id.name) {
                className = node.id.name;
            }
            descriptions.push(
                `class ${className}`,
                `define ${className}`,
                `create class`,
                `declare class`,
                `${className} class`
            );
            break;
        }

        case "SwitchStatement":
            descriptions.push(
                "switch",
                "switch statement",
                "switch case",
                "check cases"
            );
            break;

        case "TryStatement":
            descriptions.push(
                "try",
                "try catch",
                "error handling",
                "handle errors"
            );
            break;

        case "ThrowStatement":
            descriptions.push(
                "throw",
                "throw error",
                "throw exception",
                "throws"
            );
            break;

        case "BreakStatement":
            descriptions.push("break", "break loop", "exit loop");
            break;

        case "ContinueStatement":
            descriptions.push("continue", "continue loop", "skip iteration");
            break;

        default:
            break;
    }

    return descriptions;
}

/**
 * Check if comment is obvious given the code descriptions
 * @param {string} commentText - The normalized comment text
 * @param {string[]} descriptions - Code descriptions
 * @param {string} sensitivity - Detection sensitivity
 * @returns {boolean} - True if comment is obvious
 */
function isObviousComment(commentText, descriptions, sensitivity) {
    const normalizedComment = normalizeText(commentText);

    // Skip if comment is too long (likely has more context)
    if (normalizedComment.split(" ").length > 8) return false;

    for (const desc of descriptions) {
        const normalizedDesc = normalizeText(desc);

        // Exact match
        if (normalizedComment === normalizedDesc) return true;

        // Comment starts with description
        if (normalizedComment.startsWith(normalizedDesc)) {
            // Check if there's meaningful content after
            const remainder = normalizedComment.substring(normalizedDesc.length).trim();
            if (!remainder || remainder.length < 5) return true;
        }

        if (sensitivity === "high") {
            // Comment contains the description as substantial portion
            if (normalizedComment.includes(normalizedDesc) &&
                normalizedDesc.length >= normalizedComment.length * 0.5) {
                return true;
            }
        }

        if (sensitivity !== "low") {
            // Word overlap check
            const commentWords = new Set(normalizedComment.split(" ").filter(w => w.length > 2));
            const descWords = normalizedDesc.split(" ").filter(w => w.length > 2);

            if (descWords.length > 0) {
                const matchCount = descWords.filter(w => commentWords.has(w)).length;
                const overlapRatio = matchCount / descWords.length;

                // High overlap means obvious
                if (overlapRatio >= 0.8 && descWords.length >= 2) return true;
                if (sensitivity === "high" && overlapRatio >= 0.6) return true;
            }
        }
    }

    return false;
}

/**
 * Find the AST node associated with a comment
 * @param {Object} comment - The comment object
 * @param {Object} sourceCode - The source code object
 * @returns {Object|null} - The adjacent AST node or null
 */
function findAdjacentNode(comment, sourceCode) {
    const ast = sourceCode.ast;
    const commentEndLine = comment.loc.end.line;
    const commentStartLine = comment.loc.start.line;

    let closestNode = null;
    let closestDistance = Infinity;

    function traverse(node) {
        if (!node || typeof node !== "object") return;

        if (node.loc) {
            const nodeStartLine = node.loc.start.line;

            // Node is on same line as comment or immediately after
            if (nodeStartLine >= commentStartLine && nodeStartLine <= commentEndLine + 1) {
                // Prefer nodes that start after the comment ends
                if (node.range && node.range[0] > comment.range[1]) {
                    const distance = node.range[0] - comment.range[1];
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestNode = node;
                    }
                }
            }

            // Node is on the line after the comment
            if (nodeStartLine === commentEndLine + 1) {
                const distance = nodeStartLine - commentEndLine;
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNode = node;
                }
            }
        }

        // Traverse children
        for (const key of Object.keys(node)) {
            if (key === "parent" || key === "loc" || key === "range") continue;

            const child = node[key];
            if (Array.isArray(child)) {
                for (const item of child) {
                    traverse(item);
                }
            } else if (child && typeof child === "object" && child.type) {
                traverse(child);
            }
        }
    }

    traverse(ast.body ? { body: ast.body, type: "Program" } : ast);

    return closestNode;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow comments that simply restate the code",
            category: "Best Practices",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    sensitivity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "Detection sensitivity (default: medium)"
                    },
                    ignorePatterns: {
                        type: "array",
                        items: { type: "string" },
                        description: "Regex patterns for comments to ignore"
                    },
                    checkLeadingComments: {
                        type: "boolean",
                        description: "Check comments above code (default: true)"
                    },
                    checkTrailingComments: {
                        type: "boolean",
                        description: "Check comments on same line as code (default: true)"
                    },
                    // v1.1.1: Comment context handling
                    commentContext: COMMENT_CONTEXT_SCHEMA
                },
                additionalProperties: false
            }
        ],
        messages: {
            obviousComment: "Comment '{{comment}}' appears to restate the code. Comments should explain 'why', not 'what'."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};

        const sensitivity = options.sensitivity || "medium";
        const checkLeading = options.checkLeadingComments !== false;
        const checkTrailing = options.checkTrailingComments !== false;

        // v1.1.1: Comment context options (default: skip doc comments, check inline)
        const commentContext = options.commentContext || {
            documentationComments: "skip",
            inlineComments: "normal",
        };

        // Compile ignore patterns with caching
        const ignorePatterns = (options.ignorePatterns || []).map(p => {
            const result = getCachedRegex(p);
            return result.regex;
        }).filter(Boolean);

        return {
            Program() {
                // Use cached comment collection
                const classifiedComments = getAllCommentsCached(sourceCode);

                for (const classified of classifiedComments) {
                    const comment = classified.comment;

                    // v1.1.1: Skip based on comment context options
                    if (shouldSkipByContext(classified, commentContext)) {
                        continue;
                    }

                    // Skip JSDoc comments (they have a different purpose)
                    // Note: This is redundant if commentContext.documentationComments === "skip"
                    // but kept for backward compatibility
                    if (classified.isJSDoc) {
                        continue;
                    }

                    // Get first line for obviousness check
                    const text = getFirstCommentLine(comment);

                    // Skip comments based on patterns
                    if (shouldSkipComment(text)) continue;

                    // Check custom ignore patterns
                    let shouldIgnore = false;
                    for (const pattern of ignorePatterns) {
                        if (pattern.test(text)) {
                            shouldIgnore = true;
                            break;
                        }
                    }
                    if (shouldIgnore) continue;

                    // Determine if this is a leading or trailing comment
                    const commentLine = comment.loc.start.line;
                    const tokenBefore = sourceCode.getTokenBefore(comment);
                    const isTrailing = tokenBefore &&
                        tokenBefore.loc.end.line === commentLine;

                    if (isTrailing && !checkTrailing) continue;
                    if (!isTrailing && !checkLeading) continue;

                    // Find the adjacent AST node
                    const adjacentNode = findAdjacentNode(comment, sourceCode);

                    if (!adjacentNode) continue;

                    // Get descriptions for the node
                    const descriptions = getNodeDescriptions(adjacentNode);

                    if (descriptions.length === 0) continue;

                    // Check if the comment is obvious
                    if (isObviousComment(text, descriptions, sensitivity)) {
                        context.report({
                            node: null,
                            loc: comment.loc,
                            messageId: "obviousComment",
                            data: {
                                comment: text.length > 50 ? text.substring(0, 47) + "..." : text
                            }
                        });
                    }
                }
            }
        };
    }
};
