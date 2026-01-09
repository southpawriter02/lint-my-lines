/**
 * @fileoverview Requires comments for complex UI elements that need accessibility context.
 * @author Jules
 */
"use strict";

const {
  COMMENT_CONTEXT_SCHEMA,
} = require("../utils/comment-context-utils");

// Default elements that should have accessibility comments
const DEFAULT_ELEMENTS = ["img", "svg", "Icon", "button"];

// Default icon component patterns
const DEFAULT_ICON_PATTERNS = ["Icon$", "Ico$", "^Icon", "^Svg"];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require comments for complex UI elements explaining their accessibility purpose",
      category: "Accessibility",
      recommended: false,
      url: "https://github.com/southpawriter02/lint-my-lines/blob/main/docs/rules/require-alt-text-comments.md"
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          elements: {
            type: "array",
            items: { type: "string" },
            description: "JSX elements to check for accessibility comments"
          },
          requireForAriaLabels: {
            type: "boolean",
            description: "Require comment when aria-label is present"
          },
          iconComponentPatterns: {
            type: "array",
            items: { type: "string" },
            description: "Regex patterns to match icon component names"
          },
          minCommentLength: {
            type: "integer",
            minimum: 1,
            description: "Minimum length for a meaningful comment"
          },
          checkEmptyAlt: {
            type: "boolean",
            description: "Check elements with empty alt text (decorative images)"
          },
          commentContext: COMMENT_CONTEXT_SCHEMA
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingAccessibilityComment: "UI element '{{element}}' should have a comment explaining its accessibility purpose.",
      missingAriaLabelComment: "Element with aria-label should have a comment explaining its accessibility purpose.",
      missingDecorativeComment: "Decorative element (empty alt) should have a comment confirming it's decorative."
    }
  },

  create: function(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};

    const elementsToCheck = options.elements || DEFAULT_ELEMENTS;
    const requireForAriaLabels = options.requireForAriaLabels !== false;
    const iconPatterns = (options.iconComponentPatterns || DEFAULT_ICON_PATTERNS)
      .map(p => new RegExp(p, "i"));
    const minCommentLength = options.minCommentLength || 10;
    const checkEmptyAlt = options.checkEmptyAlt !== false;

    /**
     * Check if a component name matches icon patterns
     * @param {string} name - Component name
     * @returns {boolean} True if matches icon pattern
     */
    function isIconComponent(name) {
      return iconPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Get element name from JSX element
     * @param {Object} node - JSX element node
     * @returns {string} Element name
     */
    function getElementName(node) {
      if (node.openingElement && node.openingElement.name) {
        const nameNode = node.openingElement.name;
        if (nameNode.type === "JSXIdentifier") {
          return nameNode.name;
        } else if (nameNode.type === "JSXMemberExpression") {
          // Handle Member.Icon type names
          return nameNode.property.name;
        }
      }
      return "";
    }

    /**
     * Check if element has a specific attribute
     * @param {Object} node - JSX element node
     * @param {string} attrName - Attribute name to find
     * @returns {Object|null} Attribute node or null
     */
    function getAttribute(node, attrName) {
      if (!node.openingElement || !node.openingElement.attributes) {
        return null;
      }
      return node.openingElement.attributes.find(attr =>
        attr.type === "JSXAttribute" &&
        attr.name &&
        attr.name.name === attrName
      );
    }

    /**
     * Check if element has an empty alt attribute
     * @param {Object} node - JSX element node
     * @returns {boolean} True if alt=""
     */
    function hasEmptyAlt(node) {
      const alt = getAttribute(node, "alt");
      if (!alt) return false;
      // Check for alt="" or alt={""}
      if (alt.value === null) return false;
      if (alt.value.type === "Literal" && alt.value.value === "") return true;
      if (alt.value.type === "JSXExpressionContainer" &&
          alt.value.expression.type === "Literal" &&
          alt.value.expression.value === "") return true;
      return false;
    }

    /**
     * Check if there's a meaningful comment near the element
     * @param {Object} node - JSX element node
     * @returns {boolean} True if meaningful comment exists
     */
    function hasAccessibilityComment(node) {
      const comments = sourceCode.getCommentsBefore(node);

      // Also check for JSX comments in the parent
      if (node.parent && node.parent.type === "JSXExpressionContainer") {
        const parentComments = sourceCode.getCommentsBefore(node.parent);
        comments.push(...parentComments);
      }

      // Check leading comments
      for (const comment of comments) {
        const text = comment.value.trim();
        if (text.length >= minCommentLength) {
          // Check if it's a meaningful accessibility comment (not just code)
          if (!isCodeLikeComment(text)) {
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
            // This is a {/* comment */} in JSX
            const siblingComments = sourceCode.getCommentsInside(sibling);
            for (const comment of siblingComments) {
              const text = comment.value.trim();
              if (text.length >= minCommentLength && !isCodeLikeComment(text)) {
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    /**
     * Check if comment looks like code rather than explanation
     * @param {string} text - Comment text
     * @returns {boolean} True if looks like code
     */
    function isCodeLikeComment(text) {
      // Detect code patterns
      const codePatterns = [
        /^import\s/,
        /^export\s/,
        /^const\s/,
        /^let\s/,
        /^var\s/,
        /^function\s/,
        /^class\s/,
        /^\{.*\}$/,
        /^<.*>$/,
        /eslint-disable/,
        /prettier-ignore/,
      ];
      return codePatterns.some(pattern => pattern.test(text));
    }

    /**
     * Check if element should be validated
     * @param {Object} node - JSX element node
     * @returns {boolean} True if should check
     */
    function shouldCheckElement(node) {
      const elementName = getElementName(node);
      if (!elementName) return false;

      // Check if it's in our list of elements to check
      if (elementsToCheck.includes(elementName)) return true;

      // Check if it's an icon component
      if (isIconComponent(elementName)) return true;

      return false;
    }

    return {
      JSXElement(node) {
        if (!shouldCheckElement(node)) return;

        const elementName = getElementName(node);
        const hasAriaLabel = getAttribute(node, "aria-label");
        const hasAriaLabelledBy = getAttribute(node, "aria-labelledby");
        const hasAriaDescribedBy = getAttribute(node, "aria-describedby");
        const isEmptyAlt = hasEmptyAlt(node);

        // Skip if has meaningful comment
        if (hasAccessibilityComment(node)) return;

        // Check for aria-label without comment
        if (requireForAriaLabels && (hasAriaLabel || hasAriaLabelledBy || hasAriaDescribedBy)) {
          context.report({
            node,
            messageId: "missingAriaLabelComment",
          });
          return;
        }

        // Check for decorative images without comment
        if (checkEmptyAlt && isEmptyAlt) {
          context.report({
            node,
            messageId: "missingDecorativeComment",
          });
          return;
        }

        // General check for elements that should have comments
        if (isIconComponent(elementName) ||
            elementName === "svg" ||
            (elementName === "button" && !hasVisibleText(node))) {
          context.report({
            node,
            messageId: "missingAccessibilityComment",
            data: { element: elementName }
          });
        }
      }
    };

    /**
     * Check if button has visible text content
     * @param {Object} node - JSX element node
     * @returns {boolean} True if has visible text
     */
    function hasVisibleText(node) {
      if (!node.children) return false;

      for (const child of node.children) {
        if (child.type === "JSXText" && child.value.trim().length > 0) {
          return true;
        }
        if (child.type === "Literal" && typeof child.value === "string" && child.value.trim().length > 0) {
          return true;
        }
        if (child.type === "JSXElement") {
          // Could be text inside nested elements
          if (hasVisibleText(child)) return true;
        }
      }
      return false;
    }
  }
};
