/**
 * @fileoverview Rule to validate JSDoc comments match function signatures.
 * @author Jules
 */
"use strict";

const {
  isJSDocComment,
  parseJSDoc,
  getJSDocComment,
  getFunctionParams
} = require("../utils/jsdoc-utils");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Validate JSDoc comments match function signatures",
      category: "JSDoc",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/valid-jsdoc.md"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          requireParamDescription: {
            type: "boolean",
            description: "Require description for @param"
          },
          requireReturnDescription: {
            type: "boolean",
            description: "Require description for @returns"
          },
          requireParamType: {
            type: "boolean",
            description: "Require type for @param"
          },
          requireReturnType: {
            type: "boolean",
            description: "Require type for @returns"
          },
          checkParamNames: {
            type: "boolean",
            description: "Verify @param names match function params"
          },
          checkParamOrder: {
            type: "boolean",
            description: "Verify @param order matches function signature"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingParam: "Missing JSDoc @param for '{{name}}'.",
      extraParam: "JSDoc @param '{{name}}' does not match any function parameter.",
      paramOrderMismatch: "JSDoc @param '{{name}}' should appear at position {{expected}}, not {{actual}}.",
      missingReturns: "Function returns a value but is missing JSDoc @returns.",
      unnecessaryReturns: "Function does not return a value but has JSDoc @returns.",
      missingParamDescription: "JSDoc @param '{{name}}' is missing a description.",
      missingReturnDescription: "JSDoc @returns is missing a description.",
      missingParamType: "JSDoc @param '{{name}}' is missing a type.",
      missingReturnType: "JSDoc @returns is missing a type.",
      duplicateParam: "Duplicate JSDoc @param for '{{name}}'."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const requireParamDescription = options.requireParamDescription === true;
    const requireReturnDescription = options.requireReturnDescription === true;
    const requireParamType = options.requireParamType !== false;
    const requireReturnType = options.requireReturnType !== false;
    const checkParamNames = options.checkParamNames !== false;
    const checkParamOrder = options.checkParamOrder !== false;

    /**
     * Check if a function returns a value
     * @param {Object} node - Function node
     * @returns {boolean} True if function returns a value
     */
    function functionReturnsValue(node) {
      // Arrow function with expression body
      if (node.type === "ArrowFunctionExpression" && node.expression) {
        return true;
      }

      // Check for return statements with values
      if (node.body && node.body.type === "BlockStatement") {
        return hasReturnWithValue(node.body);
      }

      return false;
    }

    // Keys to skip when traversing AST (circular refs and metadata)
    const SKIP_KEYS = new Set(["parent", "loc", "range", "tokens", "comments"]);

    /**
     * Recursively check for return statements with values
     * @param {Object} node - AST node
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
     * Validate JSDoc for a function node
     * @param {Object} node - Function AST node
     */
    function validateJSDoc(node) {
      const jsdocComment = getJSDocComment(node, sourceCode);
      if (!jsdocComment) return;

      const jsdoc = parseJSDoc(jsdocComment);
      if (!jsdoc) return;

      const funcParams = getFunctionParams(node);
      const paramTags = jsdoc.tags.filter(t => t.tag === "param");
      const returnTags = jsdoc.tags.filter(t => t.tag === "returns" || t.tag === "return");

      // Check for duplicate @param tags
      const seenParams = new Set();
      for (const tag of paramTags) {
        if (seenParams.has(tag.name)) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "duplicateParam",
            data: { name: tag.name }
          });
        }
        seenParams.add(tag.name);
      }

      // Build map of JSDoc param names to their positions
      const jsdocParamMap = new Map();
      paramTags.forEach((tag, index) => {
        jsdocParamMap.set(tag.name, { tag, index });
      });

      // Build map of function param names to their positions
      const funcParamMap = new Map();
      funcParams.forEach((param, index) => {
        funcParamMap.set(param.name, { param, index });
      });

      if (checkParamNames) {
        // Check for missing @param tags
        for (const funcParam of funcParams) {
          if (!jsdocParamMap.has(funcParam.name)) {
            context.report({
              loc: jsdocComment.loc,
              messageId: "missingParam",
              data: { name: funcParam.name },
              fix: function(fixer) {
                // Find insertion point (before @returns or at end of JSDoc)
                const jsdocText = jsdocComment.value;
                const lines = jsdocText.split("\n");

                // Find line before @returns or last line before closing
                let insertLineIndex = lines.length - 1;
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes("@returns") || lines[i].includes("@return")) {
                    insertLineIndex = i;
                    break;
                  }
                }

                // Build new line
                const indent = lines[1] ? lines[1].match(/^\s*\*/)?.[0] || " *" : " *";
                const newLine = `${indent} @param {*} ${funcParam.name} - [description]\n`;

                // Insert into comment
                lines.splice(insertLineIndex, 0, newLine.trimEnd());
                const newValue = lines.join("\n");

                return fixer.replaceText(jsdocComment, `/*${newValue}*/`);
              }
            });
          }
        }

        // Check for extra @param tags
        for (const [paramName] of jsdocParamMap) {
          if (!funcParamMap.has(paramName)) {
            context.report({
              loc: jsdocComment.loc,
              messageId: "extraParam",
              data: { name: paramName }
            });
          }
        }
      }

      if (checkParamOrder) {
        // Check param order matches function signature
        let jsdocIndex = 0;
        for (const funcParam of funcParams) {
          const jsdocEntry = jsdocParamMap.get(funcParam.name);
          if (jsdocEntry && jsdocEntry.index !== jsdocIndex) {
            // Only report if the param exists but is in wrong position
            const funcIndex = funcParamMap.get(funcParam.name).index;
            if (jsdocEntry.index !== funcIndex) {
              context.report({
                loc: jsdocComment.loc,
                messageId: "paramOrderMismatch",
                data: {
                  name: funcParam.name,
                  expected: funcIndex + 1,
                  actual: jsdocEntry.index + 1
                }
              });
            }
          }
          jsdocIndex++;
        }
      }

      // Check @param types and descriptions
      for (const tag of paramTags) {
        if (requireParamType && !tag.type) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingParamType",
            data: { name: tag.name }
          });
        }

        if (requireParamDescription && !tag.description) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingParamDescription",
            data: { name: tag.name }
          });
        }
      }

      // Check @returns
      const hasReturn = functionReturnsValue(node);
      const hasReturnsTag = returnTags.length > 0;

      if (hasReturn && !hasReturnsTag) {
        context.report({
          loc: jsdocComment.loc,
          messageId: "missingReturns",
          fix: function(fixer) {
            const jsdocText = jsdocComment.value;
            const lines = jsdocText.split("\n");

            // Find last line before closing
            let insertLineIndex = lines.length - 1;

            // Build new line
            const indent = lines[1] ? lines[1].match(/^\s*\*/)?.[0] || " *" : " *";
            const newLine = `${indent} @returns {*} [description]`;

            // Insert before closing
            lines.splice(insertLineIndex, 0, newLine);
            const newValue = lines.join("\n");

            return fixer.replaceText(jsdocComment, `/*${newValue}*/`);
          }
        });
      }

      // Check @returns type and description
      for (const tag of returnTags) {
        if (requireReturnType && !tag.type) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingReturnType"
          });
        }

        if (requireReturnDescription && !tag.description) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingReturnDescription"
          });
        }
      }
    }

    return {
      FunctionDeclaration(node) {
        validateJSDoc(node);
      },

      FunctionExpression(node) {
        validateJSDoc(node);
      },

      ArrowFunctionExpression(node) {
        validateJSDoc(node);
      },

      MethodDefinition(node) {
        if (node.value) {
          // Get JSDoc from the method definition, not the function
          const jsdocComment = getJSDocComment(node, sourceCode);
          if (jsdocComment) {
            // Temporarily attach the comment location for validation
            const funcNode = node.value;
            validateJSDocForMethod(node, funcNode, jsdocComment);
          }
        }
      }
    };

    /**
     * Validate JSDoc for a method definition
     * @param {Object} methodNode - MethodDefinition node
     * @param {Object} funcNode - Function node (the method's value)
     * @param {Object} jsdocComment - The JSDoc comment
     */
    function validateJSDocForMethod(methodNode, funcNode, jsdocComment) {
      const jsdoc = parseJSDoc(jsdocComment);
      if (!jsdoc) return;

      const funcParams = getFunctionParams(funcNode);
      const paramTags = jsdoc.tags.filter(t => t.tag === "param");
      const returnTags = jsdoc.tags.filter(t => t.tag === "returns" || t.tag === "return");

      // Check for duplicate @param tags
      const seenParams = new Set();
      for (const tag of paramTags) {
        if (seenParams.has(tag.name)) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "duplicateParam",
            data: { name: tag.name }
          });
        }
        seenParams.add(tag.name);
      }

      // Build maps
      const jsdocParamMap = new Map();
      paramTags.forEach((tag, index) => {
        jsdocParamMap.set(tag.name, { tag, index });
      });

      const funcParamMap = new Map();
      funcParams.forEach((param, index) => {
        funcParamMap.set(param.name, { param, index });
      });

      if (checkParamNames) {
        // Check for missing @param tags
        for (const funcParam of funcParams) {
          if (!jsdocParamMap.has(funcParam.name)) {
            context.report({
              loc: jsdocComment.loc,
              messageId: "missingParam",
              data: { name: funcParam.name }
            });
          }
        }

        // Check for extra @param tags
        for (const [paramName] of jsdocParamMap) {
          if (!funcParamMap.has(paramName)) {
            context.report({
              loc: jsdocComment.loc,
              messageId: "extraParam",
              data: { name: paramName }
            });
          }
        }
      }

      // Check @param types and descriptions
      for (const tag of paramTags) {
        if (requireParamType && !tag.type) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingParamType",
            data: { name: tag.name }
          });
        }

        if (requireParamDescription && !tag.description) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingParamDescription",
            data: { name: tag.name }
          });
        }
      }

      // Check @returns
      const hasReturn = functionReturnsValue(funcNode);
      const hasReturnsTag = returnTags.length > 0;

      if (hasReturn && !hasReturnsTag) {
        context.report({
          loc: jsdocComment.loc,
          messageId: "missingReturns"
        });
      }

      // Check @returns type and description
      for (const tag of returnTags) {
        if (requireReturnType && !tag.type) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingReturnType"
          });
        }

        if (requireReturnDescription && !tag.description) {
          context.report({
            loc: jsdocComment.loc,
            messageId: "missingReturnDescription"
          });
        }
      }
    }
  }
};
