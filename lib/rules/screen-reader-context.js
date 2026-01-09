/**
 * @fileoverview Requires comments explaining screen reader behavior for non-obvious UI patterns.
 * @author Jules
 */
"use strict";

const {
  COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Default visually hidden class names
const DEFAULT_VISUALLY_HIDDEN_CLASSES = [
  "sr-only",
  "visually-hidden",
  "visuallyhidden",
  "screen-reader-only",
  "clip-hide"
];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require explanatory comments for UI patterns that behave differently for screen readers",
      category: "Accessibility",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/screen-reader-context.md"
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          checkAriaHidden: {
            type: "boolean",
            description: "Check aria-hidden elements"
          },
          checkRolePresentation: {
            type: "boolean",
            description: "Check role=presentation elements"
          },
          checkTabindex: {
            type: "boolean",
            description: "Check negative tabindex elements"
          },
          checkAriaLive: {
            type: "boolean",
            description: "Check aria-live regions"
          },
          checkAriaExpanded: {
            type: "boolean",
            description: "Check aria-expanded elements"
          },
          visuallyHiddenClasses: {
            type: "array",
            items: { type: "string" },
            description: "Class names for visually hidden elements"
          },
          minExplanationLength: {
            type: "integer",
            minimum: 1,
            description: "Minimum length for meaningful explanation"
          },
          commentContext: COMMENT_CONTEXT_SCHEMA
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingAriaHiddenContext: "Element with aria-hidden=\"true\" needs a comment explaining why it's hidden from screen readers.",
      missingRolePresentationContext: "Element with role=\"{{role}}\" needs a comment explaining its presentational purpose.",
      missingTabindexContext: "Element with negative tabindex needs a comment explaining why it's removed from tab order.",
      missingAriaLiveContext: "Live region (aria-live) needs a comment explaining what updates will be announced.",
      missingAriaExpandedContext: "Element with aria-expanded needs a comment explaining the expand/collapse behavior.",
      missingVisuallyHiddenContext: "Visually hidden element needs a comment explaining its screen reader purpose."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const checkAriaHidden = options.checkAriaHidden !== false;
    const checkRolePresentation = options.checkRolePresentation !== false;
    const checkTabindex = options.checkTabindex !== false;
    const checkAriaLive = options.checkAriaLive !== false;
    const checkAriaExpanded = options.checkAriaExpanded || false;
    const visuallyHiddenClasses = options.visuallyHiddenClasses || DEFAULT_VISUALLY_HIDDEN_CLASSES;
    const minExplanationLength = options.minExplanationLength || 15;

    /**
     * Get attribute value from JSX element
     * @param {Object} node - JSX element node
     * @param {string} attrName - Attribute name
     * @returns {*} Attribute value or null
     */
    function getAttributeValue(node, attrName) {
      if (!node.openingElement || !node.openingElement.attributes) {
        return null;
      }
      const attr = node.openingElement.attributes.find(a =>
        a.type === "JSXAttribute" &&
        a.name &&
        a.name.name === attrName
      );
      if (!attr) return null;

      // Handle different value types
      if (attr.value === null) {
        // Attribute without value (e.g., aria-hidden means aria-hidden="true")
        return true;
      }
      if (attr.value.type === "Literal") {
        return attr.value.value;
      }
      if (attr.value.type === "JSXExpressionContainer") {
        if (attr.value.expression.type === "Literal") {
          return attr.value.expression.value;
        }
        // Handle UnaryExpression for negative numbers (e.g., -1)
        if (attr.value.expression.type === "UnaryExpression" &&
            attr.value.expression.operator === "-" &&
            attr.value.expression.argument.type === "Literal") {
          return -attr.value.expression.argument.value;
        }
        // Return something to indicate dynamic value
        return "{{dynamic}}";
      }
      return null;
    }

    /**
     * Check if element has one of the visually hidden classes
     * @param {Object} node - JSX element node
     * @returns {boolean} True if visually hidden
     */
    function hasVisuallyHiddenClass(node) {
      const classValue = getAttributeValue(node, "className") || getAttributeValue(node, "class");
      if (!classValue || typeof classValue !== "string") return false;

      const classes = classValue.split(/\s+/);
      return visuallyHiddenClasses.some(hiddenClass =>
        classes.includes(hiddenClass)
      );
    }

    /**
     * Check if there's a meaningful comment near the element
     * @param {Object} node - JSX element node
     * @returns {boolean} True if meaningful comment exists
     */
    function hasExplanatoryComment(node) {
      const comments = sourceCode.getCommentsBefore(node);

      // Also check for JSX comments in the parent
      if (node.parent && node.parent.type === "JSXExpressionContainer") {
        const parentComments = sourceCode.getCommentsBefore(node.parent);
        comments.push(...parentComments);
      }

      // Check leading comments
      for (const comment of comments) {
        const text = comment.value.trim();
        if (text.length >= minExplanationLength) {
          // Check if it's a meaningful explanation (not just directive)
          if (!isDirectiveComment(text)) {
            return true;
          }
        }
      }

      // Check for inline JSX comment before this element in siblings
      if (node.parent && node.parent.children) {
        const siblings = node.parent.children;
        const nodeIndex = siblings.indexOf(node);

        for (let i = nodeIndex - 1; i >= 0 && i >= nodeIndex - 2; i--) {
          const sibling = siblings[i];
          if (sibling.type === "JSXExpressionContainer" &&
              sibling.expression.type === "JSXEmptyExpression") {
            const siblingComments = sourceCode.getCommentsInside(sibling);
            for (const comment of siblingComments) {
              const text = comment.value.trim();
              if (text.length >= minExplanationLength && !isDirectiveComment(text)) {
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    /**
     * Check if comment is just a directive (not an explanation)
     * @param {string} text - Comment text
     * @returns {boolean} True if directive comment
     */
    function isDirectiveComment(text) {
      const directivePatterns = [
        /^eslint/i,
        /^prettier/i,
        /^@ts-/i,
        /^TODO/i,
        /^FIXME/i,
        /^NOTE/i,
        /^A11Y-TODO/i,
      ];
      return directivePatterns.some(pattern => pattern.test(text));
    }

    return {
      JSXElement(node) {
        // Skip if has explanatory comment
        if (hasExplanatoryComment(node)) return;

        // Check aria-hidden="true"
        if (checkAriaHidden) {
          const ariaHidden = getAttributeValue(node, "aria-hidden");
          if (ariaHidden === "true" || ariaHidden === true) {
            context.report({
              node,
              messageId: "missingAriaHiddenContext"
            });
            return;
          }
        }

        // Check role="presentation" or role="none"
        if (checkRolePresentation) {
          const role = getAttributeValue(node, "role");
          if (role === "presentation" || role === "none") {
            context.report({
              node,
              messageId: "missingRolePresentationContext",
              data: { role }
            });
            return;
          }
        }

        // Check negative tabindex
        if (checkTabindex) {
          const tabindex = getAttributeValue(node, "tabIndex") || getAttributeValue(node, "tabindex");
          if (tabindex !== null) {
            const tabindexNum = parseInt(tabindex, 10);
            if (!isNaN(tabindexNum) && tabindexNum < 0) {
              context.report({
                node,
                messageId: "missingTabindexContext"
              });
              return;
            }
          }
        }

        // Check aria-live regions
        if (checkAriaLive) {
          const ariaLive = getAttributeValue(node, "aria-live");
          if (ariaLive && ariaLive !== "off") {
            context.report({
              node,
              messageId: "missingAriaLiveContext"
            });
            return;
          }
        }

        // Check aria-expanded
        if (checkAriaExpanded) {
          const ariaExpanded = getAttributeValue(node, "aria-expanded");
          if (ariaExpanded !== null) {
            context.report({
              node,
              messageId: "missingAriaExpandedContext"
            });
            return;
          }
        }

        // Check visually hidden classes
        if (hasVisuallyHiddenClass(node)) {
          context.report({
            node,
            messageId: "missingVisuallyHiddenContext"
          });
        }
      }
    };
  }
};
