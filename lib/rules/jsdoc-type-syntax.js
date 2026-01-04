/**
 * @fileoverview Rule to enforce consistent type syntax in JSDoc comments.
 * @author Jules
 */
"use strict";

const { isJSDocComment } = require("../utils/jsdoc-utils");

// Default type mappings (TypeScript-style lowercase)
// Note: Array, Object, Function are valid as constructor types, only check primitives
const TYPESCRIPT_TYPE_MAP = {
  "String": "string",
  "Number": "number",
  "Boolean": "boolean",
  "Symbol": "symbol",
  "BigInt": "bigint"
};

// Inverted mappings for JSDoc style (capitalized)
const JSDOC_TYPE_MAP = Object.fromEntries(
  Object.entries(TYPESCRIPT_TYPE_MAP).map(([k, v]) => [v, k])
);

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce consistent type syntax in JSDoc comments",
      category: "JSDoc",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/jsdoc-type-syntax.md"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          prefer: {
            type: "string",
            enum: ["typescript", "jsdoc"],
            description: "Preferred type style"
          },
          typeMap: {
            type: "object",
            description: "Custom type mappings",
            additionalProperties: { type: "string" }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      preferTypescriptType: "Use '{{preferred}}' instead of '{{actual}}' for type consistency.",
      preferJsdocType: "Use '{{preferred}}' instead of '{{actual}}' for type consistency."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const prefer = options.prefer || "typescript";
    const customTypeMap = options.typeMap || {};

    // Build the type map based on preference
    let typeMap;
    let messageId;

    if (prefer === "typescript") {
      typeMap = { ...TYPESCRIPT_TYPE_MAP, ...customTypeMap };
      messageId = "preferTypescriptType";
    } else {
      typeMap = { ...JSDOC_TYPE_MAP, ...customTypeMap };
      messageId = "preferJsdocType";
    }

    // Regex to find type annotations in JSDoc: {Type}, {Type|OtherType}, {Array<Type>}, etc.
    const TYPE_PATTERN = /\{([^}]+)\}/g;

    /**
     * Extract all type references from a type string
     * @param {string} typeStr - The type string (e.g., "Array<String>|Number")
     * @returns {Array<Object>} Array of {type, start, end} objects
     */
    function extractTypeReferences(typeStr) {
      const types = [];
      // Match word boundaries to find type names
      const typeNamePattern = /\b([A-Za-z][A-Za-z0-9]*)\b/g;
      let match;

      while ((match = typeNamePattern.exec(typeStr)) !== null) {
        types.push({
          type: match[1],
          start: match.index,
          end: match.index + match[1].length
        });
      }

      return types;
    }

    /**
     * Check and report type inconsistencies in a JSDoc comment
     * @param {Object} comment - ESLint comment object
     */
    function checkComment(comment) {
      const text = comment.value;
      let match;
      const fixes = [];

      // Reset regex state
      TYPE_PATTERN.lastIndex = 0;

      while ((match = TYPE_PATTERN.exec(text)) !== null) {
        const typeContent = match[1];     // e.g., "String"
        const matchStart = match.index;   // Position in comment.value

        // Extract individual type references from the type content
        const typeRefs = extractTypeReferences(typeContent);

        for (const typeRef of typeRefs) {
          const actual = typeRef.type;
          const preferred = typeMap[actual];

          if (preferred && preferred !== actual) {
            // Calculate the position within the comment
            const typeStart = matchStart + 1 + typeRef.start; // +1 for opening {

            fixes.push({
              actual,
              preferred,
              start: typeStart,
              end: typeStart + actual.length
            });
          }
        }
      }

      // Report each inconsistency
      for (const fix of fixes) {
        context.report({
          loc: comment.loc,
          messageId: messageId,
          data: {
            actual: fix.actual,
            preferred: fix.preferred
          },
          fix: function(fixer) {
            // Apply all fixes for this comment
            let newValue = text;
            // Sort fixes in reverse order to maintain positions
            const sortedFixes = [...fixes].sort((a, b) => b.start - a.start);

            for (const f of sortedFixes) {
              newValue = newValue.slice(0, f.start) + f.preferred + newValue.slice(f.end);
            }

            return fixer.replaceText(comment, `/*${newValue}*/`);
          }
        });

        // Only report once per comment to avoid duplicate fix attempts
        break;
      }
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          if (isJSDocComment(comment)) {
            checkComment(comment);
          }
        }
      }
    };
  }
};
