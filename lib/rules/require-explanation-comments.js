/**
 * @fileoverview Require explanatory comments for complex code patterns.
 * @author Jules
 */
"use strict";

const { classifyComment, applyIgnoreRegex } = require("../utils/comment-utils");
const {
    isDocumentationComment,
    COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Bitwise operators that require explanation
const BITWISE_OPERATORS = ["&", "|", "^", "~", "<<", ">>", ">>>"];

// Trivial comment patterns that don't count as explanations
const TRIVIAL_PATTERNS = [
    /^(check|if|loop|return|set|get|call|do|run)\s/i,
    /^(increment|decrement)\s/i,
    /^(for|while|switch|try)\s/i,
    /^\s*$/,
];

/**
 * Count the depth of chained ternary expressions
 * @param {Object} node - The AST node
 * @returns {number} - Chain depth
 */
function countTernaryChain(node) {
    if (!node || node.type !== "ConditionalExpression") return 0;
    return 1 + Math.max(
        countTernaryChain(node.consequent),
        countTernaryChain(node.alternate)
    );
}

/**
 * Count logical operators in an expression
 * @param {Object} node - The AST node
 * @returns {number} - Number of logical operators
 */
function countLogicalOperators(node) {
    if (!node) return 0;
    if (node.type !== "LogicalExpression") return 0;
    return 1 + countLogicalOperators(node.left) + countLogicalOperators(node.right);
}

/**
 * Check if a comment is meaningful (not trivial)
 * @param {Object} comment - The comment object
 * @param {Object} commentContext - Context options for comment handling
 * @param {string|null} ignoreRegex - v1.1.2: Custom regex pattern to strip before checking
 * @returns {boolean} - True if meaningful
 */
function isMeaningfulComment(comment, commentContext = {}, ignoreRegex = null) {
    let text = comment.value.trim();

    // v1.1.2: Apply ignore regex if provided
    if (ignoreRegex) {
        text = applyIgnoreRegex(text, ignoreRegex).trim();
    }

    // Must have some content
    if (text.length < 5) return false;

    // Check for trivial patterns
    for (const pattern of TRIVIAL_PATTERNS) {
        if (pattern.test(text)) return false;
    }

    // v1.1.1: Check if documentation comments should be treated differently
    const classified = classifyComment(comment);
    if (isDocumentationComment(classified)) {
        // If set to "skip", documentation comments don't count as meaningful for this rule
        if (commentContext.documentationComments === "skip") {
            return false;
        }
        // In "strict" mode, documentation IS meaningful
        return true;
    }

    // JSDoc is always meaningful (fallback check)
    if (/^\s*\*?\s*@\w+/.test(text)) return true;

    return true;
}

/**
 * Check if node has a meaningful leading comment
 * @param {Object} node - The AST node
 * @param {Object} sourceCode - The source code object
 * @param {Object} commentContext - Context options for comment handling
 * @param {string|null} ignoreRegex - v1.1.2: Custom regex pattern to strip before checking
 * @returns {boolean} - True if has meaningful leading comment
 */
function hasMeaningfulLeadingComment(node, sourceCode, commentContext = {}, ignoreRegex = null) {
    const comments = sourceCode.getCommentsBefore(node);

    if (comments.length === 0) return false;

    // Check if any comment is meaningful and close to the node
    const nodeStartLine = node.loc.start.line;

    for (const comment of comments) {
        const commentEndLine = comment.loc.end.line;

        // Comment must be on previous line or same line
        if (nodeStartLine - commentEndLine <= 1) {
            if (isMeaningfulComment(comment, commentContext, ignoreRegex)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get the name of the containing function
 * @param {Object} node - The AST node
 * @returns {string|null} - Function name or null
 */
function getContainingFunctionName(node) {
    let current = node.parent;

    while (current) {
        if (current.type === "FunctionDeclaration" && current.id) {
            return current.id.name;
        }
        if (current.type === "FunctionExpression" && current.id) {
            return current.id.name;
        }
        if (current.type === "VariableDeclarator" &&
            current.init &&
            (current.init.type === "FunctionExpression" ||
             current.init.type === "ArrowFunctionExpression") &&
            current.id) {
            return current.id.name;
        }
        if (current.type === "MethodDefinition" && current.key) {
            return current.key.name;
        }
        current = current.parent;
    }

    return null;
}

/**
 * Check if a call expression is recursive
 * @param {Object} node - The CallExpression node
 * @returns {boolean} - True if recursive
 */
function isRecursiveCall(node) {
    const functionName = getContainingFunctionName(node);
    if (!functionName) return false;

    let calleeName = null;

    if (node.callee.type === "Identifier") {
        calleeName = node.callee.name;
    } else if (node.callee.type === "MemberExpression" && node.callee.property) {
        // this.methodName() or obj.methodName()
        calleeName = node.callee.property.name;
    }

    return calleeName === functionName;
}

/**
 * Get the outermost ternary in a chain
 * @param {Object} node - A ConditionalExpression node
 * @returns {Object} - The outermost ternary node
 */
function getOutermostTernary(node) {
    let current = node;
    while (current.parent && current.parent.type === "ConditionalExpression") {
        current = current.parent;
    }
    return current;
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Require explanatory comments for complex code patterns",
            category: "Best Practices",
            recommended: false,
            url: "https://github.com/southpawriter02/lint-my-lines/blob/main/STYLE_GUIDE.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    nestingDepth: {
                        type: "integer",
                        minimum: 1,
                        description: "Require comment when nesting exceeds this depth (default: 3)"
                    },
                    requireFor: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["regex", "bitwise", "ternary", "recursion", "complex-condition"]
                        },
                        description: "Code patterns that require comments"
                    },
                    ternaryChainLength: {
                        type: "integer",
                        minimum: 1,
                        description: "Number of chained ternaries requiring a comment (default: 2)"
                    },
                    conditionComplexity: {
                        type: "integer",
                        minimum: 1,
                        description: "Number of logical operators requiring comment (default: 3)"
                    },
                    ignorePatterns: {
                        type: "array",
                        items: { type: "string" },
                        description: "Patterns for code to ignore"
                    },
                    // v1.1.2: Ignore regex for comment content
                    ignoreRegex: {
                        type: "string",
                        description: "Custom regex pattern to strip from comment content before checking meaningfulness"
                    },
                    commentContext: COMMENT_CONTEXT_SCHEMA
                },
                additionalProperties: false
            }
        ],
        messages: {
            deepNesting: "Code at nesting depth {{depth}} (max: {{max}}) requires an explanatory comment.",
            regexNeedsComment: "Regular expressions should have a comment explaining the pattern.",
            bitwiseNeedsComment: "Bitwise operation '{{operator}}' should have a comment explaining its purpose.",
            ternaryChainNeedsComment: "Chained ternary expressions ({{length}} levels) should have a comment explaining the logic.",
            complexConditionNeedsComment: "Complex conditional ({{count}} operators) should have an explanatory comment.",
            recursionNeedsComment: "Recursive function calls should have a comment explaining the recursion."
        }
    },

    create: function (context) {
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};

        const maxNesting = options.nestingDepth || 3;
        const requireFor = options.requireFor || ["regex", "bitwise", "ternary"];
        const ternaryChainThreshold = options.ternaryChainLength || 2;
        const conditionThreshold = options.conditionComplexity || 3;
        const ignorePatterns = (options.ignorePatterns || []).map(p => new RegExp(p));
        const commentContext = options.commentContext || {};
        // v1.1.2: Ignore regex for comment content processing
        const ignoreRegexOpt = options.ignoreRegex || null;

        // Track nesting depth
        let nestingStack = [];

        // Track reported nodes to avoid duplicates
        const reportedNodes = new WeakSet();

        /**
         * Check if node should be ignored
         * @param {Object} node - The AST node
         * @returns {boolean} - True if should ignore
         */
        function shouldIgnore(node) {
            const code = sourceCode.getText(node);
            for (const pattern of ignorePatterns) {
                if (pattern.test(code)) return true;
            }
            return false;
        }

        /**
         * Enter a nesting level
         * @param {Object} node - The AST node
         */
        function enterNesting(node) {
            nestingStack.push(node);

            if (nestingStack.length > maxNesting && !reportedNodes.has(node)) {
                if (!hasMeaningfulLeadingComment(node, sourceCode, commentContext, ignoreRegexOpt)) {
                    reportedNodes.add(node);
                    context.report({
                        node,
                        messageId: "deepNesting",
                        data: {
                            depth: nestingStack.length,
                            max: maxNesting
                        }
                    });
                }
            }
        }

        /**
         * Exit a nesting level
         */
        function exitNesting() {
            nestingStack.pop();
        }

        const visitors = {
            // Track nesting for control flow structures
            IfStatement: enterNesting,
            "IfStatement:exit": exitNesting,
            ForStatement: enterNesting,
            "ForStatement:exit": exitNesting,
            ForInStatement: enterNesting,
            "ForInStatement:exit": exitNesting,
            ForOfStatement: enterNesting,
            "ForOfStatement:exit": exitNesting,
            WhileStatement: enterNesting,
            "WhileStatement:exit": exitNesting,
            DoWhileStatement: enterNesting,
            "DoWhileStatement:exit": exitNesting,
            SwitchStatement: enterNesting,
            "SwitchStatement:exit": exitNesting,
            TryStatement: enterNesting,
            "TryStatement:exit": exitNesting,
        };

        // Check regex literals
        if (requireFor.includes("regex")) {
            visitors.Literal = function (node) {
                if (node.regex && !shouldIgnore(node) && !reportedNodes.has(node)) {
                    // Find the statement containing this regex
                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        context.report({
                            node,
                            messageId: "regexNeedsComment"
                        });
                    }
                }
            };
        }

        // Check bitwise operations
        if (requireFor.includes("bitwise")) {
            visitors.BinaryExpression = function (node) {
                if (BITWISE_OPERATORS.includes(node.operator) &&
                    !shouldIgnore(node) &&
                    !reportedNodes.has(node)) {

                    // Skip if parent is also a bitwise operation (report only outermost)
                    if (node.parent && node.parent.type === "BinaryExpression" &&
                        BITWISE_OPERATORS.includes(node.parent.operator)) {
                        return;
                    }

                    // Find the statement containing this operation
                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        context.report({
                            node,
                            messageId: "bitwiseNeedsComment",
                            data: { operator: node.operator }
                        });
                    }
                }
            };

            visitors.UnaryExpression = function (node) {
                if (node.operator === "~" &&
                    !shouldIgnore(node) &&
                    !reportedNodes.has(node)) {

                    // Skip if parent is also a bitwise NOT (e.g., ~~value)
                    if (node.parent && node.parent.type === "UnaryExpression" &&
                        node.parent.operator === "~") {
                        return;
                    }

                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        context.report({
                            node,
                            messageId: "bitwiseNeedsComment",
                            data: { operator: "~" }
                        });
                    }
                }
            };
        }

        // Check ternary chains
        if (requireFor.includes("ternary")) {
            visitors.ConditionalExpression = function (node) {
                // Only check the outermost ternary in a chain
                const outermost = getOutermostTernary(node);
                if (node !== outermost) return;

                const chainLength = countTernaryChain(node);

                if (chainLength >= ternaryChainThreshold &&
                    !shouldIgnore(node) &&
                    !reportedNodes.has(node)) {

                    // Find the statement containing this ternary
                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        context.report({
                            node,
                            messageId: "ternaryChainNeedsComment",
                            data: { length: chainLength }
                        });
                    }
                }
            };
        }

        // Check complex conditions
        if (requireFor.includes("complex-condition")) {
            visitors.LogicalExpression = function (node) {
                // Only check the outermost logical expression
                if (node.parent && node.parent.type === "LogicalExpression") return;

                const operatorCount = countLogicalOperators(node);

                if (operatorCount >= conditionThreshold &&
                    !shouldIgnore(node) &&
                    !reportedNodes.has(node)) {

                    // Find the statement containing this condition
                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        context.report({
                            node,
                            messageId: "complexConditionNeedsComment",
                            data: { count: operatorCount }
                        });
                    }
                }
            };
        }

        // Check recursion
        if (requireFor.includes("recursion")) {
            // Track which statements we've already reported for recursion
            const reportedStatements = new WeakSet();

            visitors.CallExpression = function (node) {
                if (isRecursiveCall(node) &&
                    !shouldIgnore(node) &&
                    !reportedNodes.has(node)) {

                    // Find the statement containing this call
                    let target = node;
                    while (target.parent && target.parent.type !== "Program" &&
                           target.parent.type !== "BlockStatement") {
                        target = target.parent;
                    }

                    // Only report once per statement
                    if (reportedStatements.has(target)) {
                        return;
                    }

                    if (!hasMeaningfulLeadingComment(target, sourceCode, commentContext, ignoreRegexOpt)) {
                        reportedNodes.add(node);
                        reportedStatements.add(target);
                        context.report({
                            node,
                            messageId: "recursionNeedsComment"
                        });
                    }
                }
            };
        }

        return visitors;
    }
};
