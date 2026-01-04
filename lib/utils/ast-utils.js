/**
 * @fileoverview Optimized AST traversal utilities with caching.
 * @author Jules
 */
"use strict";

const { identifierCache, nodeIndexCache } = require("./performance-cache");

/**
 * Collect all identifiers in a file with caching.
 * Uses token-based iteration when available for better performance.
 *
 * @param {Object} sourceCode - ESLint sourceCode object
 * @returns {Set<string>} Set of identifier names
 */
function collectIdentifiersCached(sourceCode) {
  if (identifierCache.has(sourceCode)) {
    return identifierCache.get(sourceCode);
  }

  const identifiers = new Set();

  // Try token-based iteration first (faster)
  try {
    const tokens = sourceCode.getTokens(sourceCode.ast);
    for (const token of tokens) {
      if (token.type === "Identifier") {
        identifiers.add(token.value);
      }
    }
  } catch {
    // Fallback: traverse AST
    visitNode(sourceCode.ast, (node) => {
      if (node.type === "Identifier" && node.name) {
        identifiers.add(node.name);
      }
    });
  }

  identifierCache.set(sourceCode, identifiers);
  return identifiers;
}

/**
 * Visit all nodes in an AST.
 *
 * @param {Object} node - AST node
 * @param {Function} callback - Callback for each node
 */
function visitNode(node, callback) {
  if (!node || typeof node !== "object") {
    return;
  }

  callback(node);

  for (const key of Object.keys(node)) {
    // Skip parent references and location data
    if (key === "parent" || key === "loc" || key === "range") {
      continue;
    }

    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object" && item.type) {
          visitNode(item, callback);
        }
      }
    } else if (child && typeof child === "object" && child.type) {
      visitNode(child, callback);
    }
  }
}

/**
 * Build an index of nodes by line number with caching.
 * Useful for quickly finding nodes adjacent to comments.
 *
 * @param {Object} sourceCode - ESLint sourceCode object
 * @returns {Map<number, Array<Object>>} Map of line number to nodes
 */
function buildNodeIndex(sourceCode) {
  if (nodeIndexCache.has(sourceCode)) {
    return nodeIndexCache.get(sourceCode);
  }

  const nodesByLine = new Map();

  visitNode(sourceCode.ast, (node) => {
    if (node.loc) {
      const line = node.loc.start.line;
      if (!nodesByLine.has(line)) {
        nodesByLine.set(line, []);
      }
      nodesByLine.get(line).push(node);
    }
  });

  nodeIndexCache.set(sourceCode, nodesByLine);
  return nodesByLine;
}

/**
 * Find a node adjacent to a comment using the line index.
 * Much faster than recursive AST traversal for each comment.
 *
 * @param {Object} comment - ESLint comment object
 * @param {Object} sourceCode - ESLint sourceCode object
 * @returns {Object|null} Adjacent node or null
 */
function findAdjacentNodeFast(comment, sourceCode) {
  const index = buildNodeIndex(sourceCode);
  const nextLine = comment.loc.end.line + 1;

  // Check line after comment (most common case)
  if (index.has(nextLine)) {
    const nodes = index.get(nextLine);
    // Return the first non-trivial node
    return nodes.find((n) => n.type !== "EmptyStatement") || nodes[0];
  }

  // Check same line (trailing comment)
  const sameLine = comment.loc.start.line;
  if (index.has(sameLine)) {
    const nodes = index.get(sameLine);
    // Find node after comment position
    const nodeAfter = nodes.find(
      (n) => n.range && n.range[0] > comment.range[1]
    );
    if (nodeAfter) {
      return nodeAfter;
    }
    // Return first node on line if comment is before it
    return nodes[0];
  }

  // Check a few lines ahead (for blank lines between comment and code)
  for (let line = nextLine + 1; line <= nextLine + 3; line++) {
    if (index.has(line)) {
      return index.get(line)[0];
    }
  }

  return null;
}

/**
 * Get the parent function of a node.
 *
 * @param {Object} node - AST node
 * @returns {Object|null} Parent function node or null
 */
function getParentFunction(node) {
  let current = node.parent;
  while (current) {
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression" ||
      current.type === "ArrowFunctionExpression" ||
      current.type === "MethodDefinition"
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/**
 * Check if a node is inside a JSX expression.
 *
 * @param {Object} node - AST node
 * @returns {boolean} True if inside JSX
 */
function isInsideJSX(node) {
  let current = node.parent;
  while (current) {
    if (
      current.type === "JSXElement" ||
      current.type === "JSXFragment" ||
      current.type === "JSXExpressionContainer"
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Get the nesting depth of a node.
 *
 * @param {Object} node - AST node
 * @returns {number} Nesting depth
 */
function getNestingDepth(node) {
  const nestingNodes = new Set([
    "IfStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "SwitchStatement",
    "TryStatement",
  ]);

  let depth = 0;
  let current = node.parent;
  while (current) {
    if (nestingNodes.has(current.type)) {
      depth++;
    }
    current = current.parent;
  }
  return depth;
}

module.exports = {
  collectIdentifiersCached,
  visitNode,
  buildNodeIndex,
  findAdjacentNodeFast,
  getParentFunction,
  isInsideJSX,
  getNestingDepth,
};
