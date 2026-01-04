/**
 * @fileoverview Rule to validate TSDoc-specific tags in TypeScript documentation.
 * @author Jules
 */
"use strict";

const {
  parseJSDoc,
  getJSDocComment,
  isTSDocTag,
  isStandardJSDocTag,
} = require("../utils/jsdoc-utils");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Validate TSDoc-specific tags in TypeScript documentation",
      category: "Documentation",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          requireTypeParam: {
            type: "boolean",
            description: "Require @typeParam for generic type parameters",
          },
          allowedTags: {
            type: "array",
            items: { type: "string" },
            description: "Additional allowed tags beyond TSDoc and JSDoc standard tags",
          },
          bannedTags: {
            type: "array",
            items: {
              oneOf: [
                { type: "string" },
                {
                  type: "object",
                  properties: {
                    tag: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["tag"],
                  additionalProperties: false,
                },
              ],
            },
            description: "Tags to disallow (e.g., deprecated JSDoc tags)",
          },
          requireRemarks: {
            type: "boolean",
            description: "Require @remarks for public API documentation",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingTypeParam: "Generic type parameter '{{name}}' should be documented with @typeParam.",
      unknownTag: "Unknown documentation tag '@{{tag}}'. Use a standard JSDoc or TSDoc tag.",
      bannedTag: "Tag '@{{tag}}' is not allowed. {{reason}}",
      duplicateTypeParam: "Duplicate @typeParam for '{{name}}'.",
      missingRemarks: "Public API should include @remarks section for detailed documentation.",
      invalidTypeParamName: "@typeParam '{{docName}}' does not match any type parameter. Available: {{available}}.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const requireTypeParam = options.requireTypeParam || false;
    const allowedTags = new Set(options.allowedTags || []);
    const bannedTags = new Map();

    // Process banned tags with optional reasons
    if (options.bannedTags) {
      for (const tag of options.bannedTags) {
        if (typeof tag === "string") {
          bannedTags.set(tag, "");
        } else if (tag.tag) {
          bannedTags.set(tag.tag, tag.reason || "");
        }
      }
    }

    const requireRemarks = options.requireRemarks || false;
    const sourceCode = context.getSourceCode();

    /**
     * Extract type parameter names from a generic declaration
     * @param {Object} node - AST node that might have type parameters
     * @returns {Array<string>} Array of type parameter names
     */
    function getTypeParameterNames(node) {
      const names = [];

      // TypeScript AST nodes with typeParameters
      if (node.typeParameters && node.typeParameters.params) {
        for (const param of node.typeParameters.params) {
          if (param.name && param.name.name) {
            names.push(param.name.name);
          } else if (param.name) {
            names.push(param.name);
          }
        }
      }

      return names;
    }

    /**
     * Check if a node represents a public API
     * @param {Object} node - AST node
     * @returns {boolean} True if public API
     */
    function isPublicAPI(node) {
      if (!node.parent) return false;

      const parent = node.parent;

      // Exported declarations
      if (
        parent.type === "ExportNamedDeclaration" ||
        parent.type === "ExportDefaultDeclaration"
      ) {
        return true;
      }

      // Variable declaration in export
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
     * Validate TSDoc for a node
     * @param {Object} node - AST node with JSDoc
     */
    function validateTSDoc(node) {
      // Try to get JSDoc from the node itself
      let jsdocComment = getJSDocComment(node, sourceCode);

      // For exported functions, JSDoc might be before the export statement
      if (!jsdocComment && node.parent) {
        if (
          node.parent.type === "ExportNamedDeclaration" ||
          node.parent.type === "ExportDefaultDeclaration"
        ) {
          jsdocComment = getJSDocComment(node.parent, sourceCode);
        }
      }

      if (!jsdocComment) return;

      const parsed = parseJSDoc(jsdocComment);
      if (!parsed) return;

      const typeParamNames = getTypeParameterNames(node);
      const documentedTypeParams = new Set();
      let hasRemarks = false;

      // Check each tag
      for (const tag of parsed.tags) {
        const tagName = tag.tag;

        // Check for banned tags
        if (bannedTags.has(tagName)) {
          const reason = bannedTags.get(tagName);
          context.report({
            node: jsdocComment,
            messageId: "bannedTag",
            data: {
              tag: tagName,
              reason: reason ? reason : "This tag is not allowed.",
            },
          });
          continue;
        }

        // Check for unknown tags
        if (
          !isTSDocTag(tagName) &&
          !isStandardJSDocTag(tagName) &&
          !allowedTags.has(tagName)
        ) {
          context.report({
            node: jsdocComment,
            messageId: "unknownTag",
            data: { tag: tagName },
          });
        }

        // Track @typeParam usage
        if (tagName === "typeParam") {
          hasRemarks = false; // Reset for @remarks tracking
          const paramName = tag.name;

          if (paramName) {
            if (documentedTypeParams.has(paramName)) {
              context.report({
                node: jsdocComment,
                messageId: "duplicateTypeParam",
                data: { name: paramName },
              });
            } else {
              documentedTypeParams.add(paramName);
            }

            // Check if this type param actually exists
            if (typeParamNames.length > 0 && !typeParamNames.includes(paramName)) {
              context.report({
                node: jsdocComment,
                messageId: "invalidTypeParamName",
                data: {
                  docName: paramName,
                  available: typeParamNames.join(", "),
                },
              });
            }
          }
        }

        // Track @remarks
        if (tagName === "remarks") {
          hasRemarks = true;
        }
      }

      // Check for missing @typeParam
      if (requireTypeParam && typeParamNames.length > 0) {
        for (const name of typeParamNames) {
          if (!documentedTypeParams.has(name)) {
            context.report({
              node: jsdocComment,
              messageId: "missingTypeParam",
              data: { name },
            });
          }
        }
      }

      // Check for missing @remarks on public API
      if (requireRemarks && isPublicAPI(node) && !hasRemarks) {
        context.report({
          node: jsdocComment,
          messageId: "missingRemarks",
        });
      }
    }

    return {
      FunctionDeclaration: validateTSDoc,
      FunctionExpression: validateTSDoc,
      ArrowFunctionExpression: validateTSDoc,
      ClassDeclaration: validateTSDoc,
      ClassExpression: validateTSDoc,
      MethodDefinition(node) {
        if (node.value) {
          validateTSDoc(node);
        }
      },
      // TypeScript-specific nodes (when using @typescript-eslint/parser)
      TSInterfaceDeclaration: validateTSDoc,
      TSTypeAliasDeclaration: validateTSDoc,
      TSEnumDeclaration: validateTSDoc,
    };
  },
};
