/**
 * @fileoverview Rule to require JSDoc comments for exported functions.
 * @author Jules
 */
"use strict";

const {
  hasJSDocComment,
  getIndentation,
  generateJSDocTemplate,
  getFunctionName
} = require("../utils/jsdoc-utils");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require JSDoc comments for exported functions",
      category: "JSDoc",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/require-jsdoc.md"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          require: {
            type: "object",
            properties: {
              FunctionDeclaration: { type: "boolean" },
              ArrowFunctionExpression: { type: "boolean" },
              FunctionExpression: { type: "boolean" },
              ClassDeclaration: { type: "boolean" },
              MethodDefinition: { type: "boolean" }
            },
            additionalProperties: false
          },
          exemptEmptyFunctions: {
            type: "boolean",
            description: "Skip functions with empty bodies"
          },
          minLineCount: {
            type: "integer",
            minimum: 0,
            description: "Only require JSDoc for functions with at least this many lines"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingJSDoc: "Exported function '{{name}}' requires a JSDoc comment.",
      missingJSDocDefault: "Default exported function requires a JSDoc comment.",
      missingJSDocAnonymous: "Exported anonymous function requires a JSDoc comment.",
      missingJSDocMethod: "Exported method '{{name}}' requires a JSDoc comment.",
      missingJSDocClass: "Exported class '{{name}}' requires a JSDoc comment."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const requireOptions = options.require || {};
    const checkFunctionDeclaration = requireOptions.FunctionDeclaration !== false;
    const checkArrowFunction = requireOptions.ArrowFunctionExpression !== false;
    const checkFunctionExpression = requireOptions.FunctionExpression !== false;
    const checkClassDeclaration = requireOptions.ClassDeclaration !== false;
    const checkMethodDefinition = requireOptions.MethodDefinition !== false;

    const exemptEmptyFunctions = options.exemptEmptyFunctions === true;
    const minLineCount = options.minLineCount || 0;

    /**
     * Check if a function body is empty
     * @param {Object} node - Function node
     * @returns {boolean} True if function body is empty
     */
    function isEmptyFunction(node) {
      if (node.body && node.body.type === "BlockStatement") {
        return node.body.body.length === 0;
      }
      return false;
    }

    /**
     * Get the line count of a function
     * @param {Object} node - Function node
     * @returns {number} Number of lines
     */
    function getFunctionLineCount(node) {
      return node.loc.end.line - node.loc.start.line + 1;
    }

    /**
     * Check if a function should be skipped based on options
     * @param {Object} node - Function node
     * @returns {boolean} True if should skip
     */
    function shouldSkipFunction(node) {
      if (exemptEmptyFunctions && isEmptyFunction(node)) {
        return true;
      }
      if (minLineCount > 0 && getFunctionLineCount(node) < minLineCount) {
        return true;
      }
      return false;
    }

    /**
     * Report a missing JSDoc error
     * @param {Object} node - The node to report on
     * @param {Object} funcNode - The function node (for autofix)
     * @param {string} messageId - The message ID
     * @param {Object} data - Data for the message
     */
    function reportMissingJSDoc(node, funcNode, messageId, data = {}) {
      context.report({
        node: node,
        messageId: messageId,
        data: data,
        fix: function(fixer) {
          const indent = getIndentation(node, sourceCode);
          const jsdoc = generateJSDocTemplate(funcNode, indent);
          return fixer.insertTextBefore(node, jsdoc);
        }
      });
    }

    /**
     * Check an exported function declaration
     * @param {Object} exportNode - Export declaration node
     * @param {Object} funcNode - Function declaration node
     */
    function checkExportedFunction(exportNode, funcNode) {
      if (!checkFunctionDeclaration) return;
      if (shouldSkipFunction(funcNode)) return;

      if (!hasJSDocComment(exportNode, sourceCode)) {
        const name = getFunctionName(funcNode);
        if (name) {
          reportMissingJSDoc(exportNode, funcNode, "missingJSDoc", { name });
        } else {
          reportMissingJSDoc(exportNode, funcNode, "missingJSDocAnonymous");
        }
      }
    }

    /**
     * Check an exported class declaration
     * @param {Object} exportNode - Export declaration node
     * @param {Object} classNode - Class declaration node
     */
    function checkExportedClass(exportNode, classNode) {
      if (!checkClassDeclaration) return;

      if (!hasJSDocComment(exportNode, sourceCode)) {
        const name = classNode.id ? classNode.id.name : "anonymous";
        reportMissingJSDoc(exportNode, classNode, "missingJSDocClass", { name });
      }

      // Check methods within the class
      if (checkMethodDefinition && classNode.body && classNode.body.body) {
        for (const method of classNode.body.body) {
          if (method.type === "MethodDefinition") {
            checkMethodInExportedClass(method);
          }
        }
      }
    }

    /**
     * Check a method in an exported class
     * @param {Object} methodNode - MethodDefinition node
     */
    function checkMethodInExportedClass(methodNode) {
      if (shouldSkipFunction(methodNode.value)) return;

      if (!hasJSDocComment(methodNode, sourceCode)) {
        const name = methodNode.key.name || methodNode.key.value || "anonymous";
        context.report({
          node: methodNode,
          messageId: "missingJSDocMethod",
          data: { name },
          fix: function(fixer) {
            const indent = getIndentation(methodNode, sourceCode);
            const jsdoc = generateJSDocTemplate(methodNode.value, indent);
            // Insert at the start of the line, not before the identifier
            const lineStart = sourceCode.getIndexFromLoc({
              line: methodNode.loc.start.line,
              column: 0
            });
            return fixer.insertTextBeforeRange([lineStart, lineStart], jsdoc);
          }
        });
      }
    }

    /**
     * Check variable declaration for exported arrow/function expressions
     * @param {Object} exportNode - Export declaration node
     * @param {Object} varDecl - VariableDeclaration node
     */
    function checkExportedVariableDeclaration(exportNode, varDecl) {
      for (const declarator of varDecl.declarations) {
        if (!declarator.init) continue;

        const init = declarator.init;
        if (
          (init.type === "ArrowFunctionExpression" && checkArrowFunction) ||
          (init.type === "FunctionExpression" && checkFunctionExpression)
        ) {
          if (shouldSkipFunction(init)) continue;

          if (!hasJSDocComment(exportNode, sourceCode)) {
            const name = declarator.id.name || "anonymous";
            reportMissingJSDoc(exportNode, init, "missingJSDoc", { name });
          }
        }
      }
    }

    /**
     * Get the function node from a module.exports assignment
     * @param {Object} node - AssignmentExpression node
     * @returns {Object|null} Function node or null
     */
    function getFunctionFromModuleExports(node) {
      const right = node.right;

      if (
        right.type === "FunctionExpression" ||
        right.type === "ArrowFunctionExpression"
      ) {
        return right;
      }

      return null;
    }

    /**
     * Get the export name from a module.exports assignment
     * @param {Object} node - AssignmentExpression node
     * @returns {string|null} Export name or null
     */
    function getModuleExportName(node) {
      const left = node.left;

      // module.exports.foo = ...
      if (
        left.type === "MemberExpression" &&
        left.object.type === "MemberExpression"
      ) {
        return left.property.name || left.property.value;
      }

      // exports.foo = ...
      if (
        left.type === "MemberExpression" &&
        left.object.type === "Identifier" &&
        left.object.name === "exports"
      ) {
        return left.property.name || left.property.value;
      }

      return null;
    }

    return {
      // export function foo() {}
      // export default function() {}
      ExportNamedDeclaration(node) {
        if (!node.declaration) return;

        const decl = node.declaration;

        if (decl.type === "FunctionDeclaration") {
          checkExportedFunction(node, decl);
        } else if (decl.type === "ClassDeclaration") {
          checkExportedClass(node, decl);
        } else if (decl.type === "VariableDeclaration") {
          checkExportedVariableDeclaration(node, decl);
        }
      },

      ExportDefaultDeclaration(node) {
        const decl = node.declaration;

        if (decl.type === "FunctionDeclaration" && checkFunctionDeclaration) {
          if (shouldSkipFunction(decl)) return;

          if (!hasJSDocComment(node, sourceCode)) {
            const name = getFunctionName(decl);
            if (name) {
              reportMissingJSDoc(node, decl, "missingJSDoc", { name });
            } else {
              reportMissingJSDoc(node, decl, "missingJSDocDefault");
            }
          }
        } else if (decl.type === "FunctionExpression" && checkFunctionExpression) {
          if (shouldSkipFunction(decl)) return;

          if (!hasJSDocComment(node, sourceCode)) {
            reportMissingJSDoc(node, decl, "missingJSDocDefault");
          }
        } else if (decl.type === "ArrowFunctionExpression" && checkArrowFunction) {
          if (shouldSkipFunction(decl)) return;

          if (!hasJSDocComment(node, sourceCode)) {
            reportMissingJSDoc(node, decl, "missingJSDocDefault");
          }
        } else if (decl.type === "ClassDeclaration" && checkClassDeclaration) {
          if (!hasJSDocComment(node, sourceCode)) {
            const name = decl.id ? decl.id.name : "anonymous";
            reportMissingJSDoc(node, decl, "missingJSDocClass", { name });
          }
        }
      },

      // module.exports = function() {}
      // module.exports.foo = function() {}
      // exports.foo = function() {}
      AssignmentExpression(node) {
        const left = node.left;

        // Check if this is a module.exports or exports assignment
        if (left.type !== "MemberExpression") return;

        const isModuleExports =
          (left.object.type === "Identifier" && left.object.name === "module" &&
           left.property.type === "Identifier" && left.property.name === "exports") ||
          (left.object.type === "MemberExpression" &&
           left.object.object.type === "Identifier" && left.object.object.name === "module" &&
           left.object.property.type === "Identifier" && left.object.property.name === "exports") ||
          (left.object.type === "Identifier" && left.object.name === "exports");

        if (!isModuleExports) return;

        const funcNode = getFunctionFromModuleExports(node);
        if (!funcNode) return;

        const shouldCheck =
          (funcNode.type === "FunctionExpression" && checkFunctionExpression) ||
          (funcNode.type === "ArrowFunctionExpression" && checkArrowFunction);

        if (!shouldCheck) return;
        if (shouldSkipFunction(funcNode)) return;

        // Get the statement node for checking JSDoc
        const statementNode = node.parent && node.parent.type === "ExpressionStatement"
          ? node.parent
          : node;

        if (!hasJSDocComment(statementNode, sourceCode)) {
          const name = getModuleExportName(node);
          if (name) {
            context.report({
              node: statementNode,
              messageId: "missingJSDoc",
              data: { name },
              fix: function(fixer) {
                const indent = getIndentation(statementNode, sourceCode);
                const jsdoc = generateJSDocTemplate(funcNode, indent);
                return fixer.insertTextBefore(statementNode, jsdoc);
              }
            });
          } else {
            context.report({
              node: statementNode,
              messageId: "missingJSDocDefault",
              fix: function(fixer) {
                const indent = getIndentation(statementNode, sourceCode);
                const jsdoc = generateJSDocTemplate(funcNode, indent);
                return fixer.insertTextBefore(statementNode, jsdoc);
              }
            });
          }
        }
      }
    };
  }
};
