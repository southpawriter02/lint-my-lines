/**
 * @fileoverview Tests for require-alt-text-comments rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/require-alt-text-comments");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: "module"
  }
});

ruleTester.run("require-alt-text-comments", rule, {
  valid: [
    // Regular elements without icons
    {
      code: "<div>Hello</div>"
    },
    // Icon with comment above
    {
      code: `
        // Search icon for submitting the form
        <Icon name="search" />
      `
    },
    // Icon with JSX comment
    {
      code: `
        <div>
          {/* User profile avatar icon */}
          <Icon name="user" />
        </div>
      `
    },
    // SVG with comment
    {
      code: `
        // Decorative wave pattern
        <svg viewBox="0 0 100 100" />
      `
    },
    // Button with visible text (doesn't need comment)
    {
      code: `<button>Click me</button>`
    },
    // Image with alt text and comment
    {
      code: `
        // Product thumbnail image
        <img src="product.jpg" alt="Blue sneaker" />
      `
    },
    // Decorative image with comment explaining it's decorative
    {
      code: `
        // Decorative spacer image
        <img src="spacer.gif" alt="" />
      `
    },
    // Disabled checkEmptyAlt - no comment needed for empty alt
    {
      code: `<img src="spacer.gif" alt="" />`,
      options: [{ checkEmptyAlt: false }]
    },
    // Non-icon component
    {
      code: `<CustomComponent name="test" />`
    },
    // Comment meets minCommentLength
    {
      code: `
        // This is a sufficiently long comment
        <Icon name="test" />
      `,
      options: [{ minCommentLength: 10 }]
    }
  ],
  invalid: [
    // Icon without comment
    {
      code: `<Icon name="search" />`,
      errors: [{ messageId: "missingAccessibilityComment" }]
    },
    // SVG without comment
    {
      code: `<svg viewBox="0 0 100 100" />`,
      errors: [{ messageId: "missingAccessibilityComment" }]
    },
    // Icon with aria-label but no comment explaining it
    {
      code: `<Icon name="close" aria-label="Close dialog" />`,
      errors: [{ messageId: "missingAriaLabelComment" }]
    },
    // Decorative image without explanation
    {
      code: `<img src="spacer.gif" alt="" />`,
      errors: [{ messageId: "missingDecorativeComment" }]
    },
    // Button without visible text (both button and nested Icon trigger)
    {
      code: `<button><Icon name="close" /></button>`,
      errors: [
        { messageId: "missingAccessibilityComment" },
        { messageId: "missingAccessibilityComment" }
      ]
    },
    // Comment too short
    {
      code: `
        // Short
        <Icon name="test" />
      `,
      options: [{ minCommentLength: 10 }],
      errors: [{ messageId: "missingAccessibilityComment" }]
    },
    // Custom icon pattern matched
    {
      code: `<CloseIco />`,
      options: [{ iconComponentPatterns: ["Ico$"] }],
      errors: [{ messageId: "missingAccessibilityComment" }]
    },
    // Element with aria-labelledby
    {
      code: `<div aria-labelledby="title" />`,
      options: [{ elements: ["div"] }],
      errors: [{ messageId: "missingAriaLabelComment" }]
    }
  ]
});
