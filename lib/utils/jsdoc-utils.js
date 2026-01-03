/**
 * @fileoverview Shared utilities for JSDoc-related rules.
 * @author Jules
 */
"use strict";

const { parse } = require("comment-parser");

// TSDoc-specific tags that extend JSDoc
const TSDOC_TAGS = new Set([
  "typeParam",      // Generic type parameters
  "remarks",        // Extended description section
  "defaultValue",   // Default value documentation
  "privateRemarks", // Internal documentation
  "sealed",         // Class cannot be extended
  "virtual",        // Method can be overridden
  "override",       // Method overrides parent
  "eventProperty",  // Event property marker
  "beta",           // API stability markers
  "alpha",
  "public",
  "internal",
  "packageDocumentation", // Package-level documentation
  "decorator",      // Decorator documentation
  "inheritDoc",     // Inherit documentation from parent
  "label",          // Cross-reference label
  "link",           // Inline link
]);

// Standard JSDoc tags (for comparison)
const JSDOC_TAGS = new Set([
  "param", "parameter",
  "returns", "return",
  "type", "typedef",
  "property", "prop",
  "callback",
  "template",
  "class", "constructor",
  "extends", "augments",
  "implements",
  "private", "protected", "public",
  "static",
  "readonly",
  "abstract",
  "async",
  "generator",
  "global",
  "inner",
  "instance",
  "memberof",
  "module",
  "namespace",
  "requires",
  "see",
  "since",
  "throws", "exception",
  "todo",
  "deprecated",
  "example",
  "file", "fileoverview", "overview",
  "author",
  "version",
  "license",
  "copyright",
  "ignore",
  "enum",
  "event",
  "fires", "emits",
  "listens",
  "exports",
  "external", "host",
  "function", "func", "method",
  "var", "member",
  "constant", "const",
  "default", "defaultvalue",
  "description", "desc",
  "kind",
  "lends",
  "name",
  "summary",
  "this",
  "variation",
  "yields", "yield",
]);

/**
 * Check if a tag name is a TSDoc-specific tag
 * @param {string} tagName - Tag name without @ prefix
 * @returns {boolean} True if TSDoc-specific
 */
function isTSDocTag(tagName) {
  return TSDOC_TAGS.has(tagName);
}

/**
 * Check if a tag name is a standard JSDoc tag
 * @param {string} tagName - Tag name without @ prefix
 * @returns {boolean} True if standard JSDoc
 */
function isStandardJSDocTag(tagName) {
  return JSDOC_TAGS.has(tagName);
}

/**
 * Get all TSDoc-specific tags from a parsed JSDoc
 * @param {Object} parsedJSDoc - Parsed JSDoc object from parseJSDoc
 * @returns {Array<Object>} Array of TSDoc tags
 */
function getTSDocTags(parsedJSDoc) {
  if (!parsedJSDoc || !parsedJSDoc.tags) {
    return [];
  }
  return parsedJSDoc.tags.filter(tag => isTSDocTag(tag.tag));
}

/**
 * Get all tags from a comment, categorized
 * @param {Object} parsedJSDoc - Parsed JSDoc object
 * @returns {Object} Object with tsdoc, jsdoc, and unknown arrays
 */
function categorizeDocTags(parsedJSDoc) {
  const result = {
    tsdoc: [],
    jsdoc: [],
    unknown: []
  };

  if (!parsedJSDoc || !parsedJSDoc.tags) {
    return result;
  }

  for (const tag of parsedJSDoc.tags) {
    if (isTSDocTag(tag.tag)) {
      result.tsdoc.push(tag);
    } else if (isStandardJSDocTag(tag.tag)) {
      result.jsdoc.push(tag);
    } else {
      result.unknown.push(tag);
    }
  }

  return result;
}

/**
 * Check if a comment is a JSDoc comment (starts with /**)
 * @param {Object} comment - ESLint comment object
 * @returns {boolean} True if the comment is a JSDoc comment
 */
function isJSDocComment(comment) {
  return comment.type === "Block" && comment.value.startsWith("*");
}

/**
 * Parse a JSDoc comment using comment-parser
 * @param {Object} comment - ESLint comment object
 * @returns {Object|null} Parsed JSDoc object or null if not valid JSDoc
 */
function parseJSDoc(comment) {
  if (!isJSDocComment(comment)) {
    return null;
  }

  const parsed = parse(`/*${comment.value}*/`);
  if (parsed.length === 0) {
    return null;
  }

  const block = parsed[0];
  return {
    description: block.description,
    tags: block.tags.map(tag => ({
      tag: tag.tag,
      name: tag.name,
      type: tag.type,
      description: tag.description,
      optional: tag.optional,
      default: tag.default
    }))
  };
}

/**
 * Check if a node has a JSDoc comment immediately before it
 * @param {Object} node - AST node
 * @param {Object} sourceCode - ESLint source code object
 * @returns {Object|null} The JSDoc comment if found, null otherwise
 */
function getJSDocComment(node, sourceCode) {
  const comments = sourceCode.getCommentsBefore(node);

  // Find the closest block comment that is JSDoc
  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i];
    if (isJSDocComment(comment)) {
      // Check proximity - must be immediately before the node (within 1 line)
      if (node.loc.start.line - comment.loc.end.line <= 1) {
        return comment;
      }
    }
  }
  return null;
}

/**
 * Check if a node has a JSDoc comment
 * @param {Object} node - AST node
 * @param {Object} sourceCode - ESLint source code object
 * @returns {boolean} True if the node has a JSDoc comment
 */
function hasJSDocComment(node, sourceCode) {
  return getJSDocComment(node, sourceCode) !== null;
}

/**
 * Extract parameter names from a function node
 * @param {Object} node - Function AST node
 * @returns {Array<Object>} Array of parameter info objects
 */
function getFunctionParams(node) {
  const params = [];

  for (const param of node.params) {
    params.push(...extractParamNames(param));
  }

  return params;
}

/**
 * Recursively extract parameter names from a parameter pattern
 * @param {Object} param - Parameter AST node
 * @param {string} prefix - Prefix for nested params
 * @returns {Array<Object>} Array of parameter info
 */
function extractParamNames(param, prefix = "") {
  const results = [];

  switch (param.type) {
    case "Identifier":
      results.push({
        name: prefix + param.name,
        node: param,
        isRest: false,
        hasDefault: false
      });
      break;

    case "RestElement":
      results.push({
        name: prefix + (param.argument.name || "args"),
        node: param,
        isRest: true,
        hasDefault: false
      });
      break;

    case "AssignmentPattern":
      // Default parameter: x = 10
      const leftResults = extractParamNames(param.left, prefix);
      leftResults.forEach(r => {
        r.hasDefault = true;
      });
      results.push(...leftResults);
      break;

    case "ObjectPattern":
      // Destructured object: { a, b }
      results.push({
        name: prefix + "options",
        node: param,
        isRest: false,
        hasDefault: false,
        isDestructured: true
      });
      break;

    case "ArrayPattern":
      // Destructured array: [a, b]
      results.push({
        name: prefix + "array",
        node: param,
        isRest: false,
        hasDefault: false,
        isDestructured: true
      });
      break;

    default:
      // Unknown pattern, use placeholder
      results.push({
        name: prefix + "param",
        node: param,
        isRest: false,
        hasDefault: false
      });
  }

  return results;
}

/**
 * Check if a function returns a value (has return statements with arguments)
 * @param {Object} node - Function AST node
 * @returns {boolean} True if function returns a value
 */
function functionReturnsValue(node) {
  // Arrow function with expression body implicitly returns
  if (node.type === "ArrowFunctionExpression" && node.expression) {
    return true;
  }

  // Check function body for return statements with values
  if (node.body && node.body.type === "BlockStatement") {
    return hasReturnWithValue(node.body);
  }

  return false;
}

// Keys to skip when traversing AST (circular refs and metadata)
const SKIP_KEYS = new Set(["parent", "loc", "range", "tokens", "comments"]);

/**
 * Recursively check if a block has return statements with values
 * @param {Object} node - AST node to check
 * @returns {boolean} True if contains return with value
 */
function hasReturnWithValue(node) {
  if (!node || typeof node !== "object") return false;

  if (node.type === "ReturnStatement" && node.argument !== null) {
    return true;
  }

  // Don't recurse into nested functions
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    return false;
  }

  // Check all child nodes
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;

    const child = node[key];
    if (child && typeof child === "object") {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === "object" && hasReturnWithValue(item)) {
            return true;
          }
        }
      } else if (hasReturnWithValue(child)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the indentation string for a node
 * @param {Object} node - AST node
 * @param {Object} sourceCode - ESLint source code object
 * @returns {string} Indentation string (spaces/tabs)
 */
function getIndentation(node, sourceCode) {
  const line = sourceCode.lines[node.loc.start.line - 1];
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}

/**
 * Check if a node is an exported function
 * @param {Object} node - AST node
 * @returns {boolean} True if the node represents an exported function
 */
function isExportedNode(node) {
  if (!node.parent) return false;

  const parent = node.parent;

  // export function foo() {}
  // export default function() {}
  if (
    parent.type === "ExportNamedDeclaration" ||
    parent.type === "ExportDefaultDeclaration"
  ) {
    return true;
  }

  // export const foo = () => {}
  if (
    parent.type === "VariableDeclarator" &&
    parent.parent &&
    parent.parent.type === "VariableDeclaration" &&
    parent.parent.parent &&
    parent.parent.parent.type === "ExportNamedDeclaration"
  ) {
    return true;
  }

  return false;
}

/**
 * Check if a node is a module.exports or exports assignment
 * @param {Object} node - AssignmentExpression node
 * @returns {boolean} True if this is a module export assignment
 */
function isModuleExportsAssignment(node) {
  if (node.type !== "AssignmentExpression") return false;

  const left = node.left;
  if (left.type !== "MemberExpression") return false;

  // module.exports = ...
  if (
    left.object.type === "Identifier" &&
    left.object.name === "module" &&
    left.property.type === "Identifier" &&
    left.property.name === "exports"
  ) {
    return true;
  }

  // module.exports.foo = ...
  if (
    left.object.type === "MemberExpression" &&
    left.object.object.type === "Identifier" &&
    left.object.object.name === "module" &&
    left.object.property.type === "Identifier" &&
    left.object.property.name === "exports"
  ) {
    return true;
  }

  // exports.foo = ...
  if (
    left.object.type === "Identifier" &&
    left.object.name === "exports"
  ) {
    return true;
  }

  return false;
}

/**
 * Get the name of a function node
 * @param {Object} node - Function AST node
 * @returns {string|null} Function name or null if anonymous
 */
function getFunctionName(node) {
  if (node.id && node.id.name) {
    return node.id.name;
  }

  // Check parent for variable name
  if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
    return node.parent.id.name;
  }

  // Check parent for property name
  if (node.parent && node.parent.type === "Property" && node.parent.key) {
    return node.parent.key.name || node.parent.key.value;
  }

  // Check parent for method name
  if (node.parent && node.parent.type === "MethodDefinition" && node.parent.key) {
    return node.parent.key.name;
  }

  return null;
}

/**
 * Generate a JSDoc template for a function or class
 * @param {Object} node - Function or class AST node
 * @param {string} indent - Indentation string
 * @returns {string} JSDoc comment string
 */
function generateJSDocTemplate(node, indent) {
  // Handle class declarations (no params)
  if (node.type === "ClassDeclaration" || node.type === "ClassExpression") {
    return `${indent}/**\n${indent} * [Description]\n${indent} */\n`;
  }

  const params = getFunctionParams(node);
  const hasReturn = functionReturnsValue(node);

  let jsdoc = `${indent}/**\n`;
  jsdoc += `${indent} * [Description]\n`;

  for (const param of params) {
    if (param.isRest) {
      jsdoc += `${indent} * @param {...*} ${param.name} - [description]\n`;
    } else if (param.hasDefault) {
      jsdoc += `${indent} * @param {*} [${param.name}] - [description]\n`;
    } else {
      jsdoc += `${indent} * @param {*} ${param.name} - [description]\n`;
    }
  }

  if (hasReturn) {
    jsdoc += `${indent} * @returns {*} [description]\n`;
  }

  jsdoc += `${indent} */\n`;

  return jsdoc;
}

module.exports = {
  // JSDoc utilities
  isJSDocComment,
  parseJSDoc,
  getJSDocComment,
  hasJSDocComment,
  getFunctionParams,
  functionReturnsValue,
  getIndentation,
  isExportedNode,
  isModuleExportsAssignment,
  getFunctionName,
  generateJSDocTemplate,
  // TSDoc utilities
  isTSDocTag,
  isStandardJSDocTag,
  getTSDocTags,
  categorizeDocTags,
  TSDOC_TAGS,
  JSDOC_TAGS
};
