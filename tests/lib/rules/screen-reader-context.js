/**
 * @fileoverview Tests for screen-reader-context rule.
 * @author Jules
 */
"use strict";

const rule = require("../../../lib/rules/screen-reader-context");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: "module"
  }
});

ruleTester.run("screen-reader-context", rule, {
  valid: [
    // Regular element without special attributes
    {
      code: "<div>Hello</div>"
    },
    // aria-hidden with comment
    {
      code: `
        // Hidden from screen readers - decorative star
        <span aria-hidden="true">★</span>
      `
    },
    // aria-hidden with JSX comment
    {
      code: `
        <div>
          {/* Decorative icon, hidden from assistive tech */}
          <span aria-hidden="true">✓</span>
        </div>
      `
    },
    // role="presentation" with comment
    {
      code: `
        // Presentational wrapper for layout
        <div role="presentation">
          <p>Content</p>
        </div>
      `
    },
    // Negative tabindex with comment
    {
      code: `
        // Removed from tab order - focus managed by parent
        <button tabIndex={-1}>X</button>
      `
    },
    // aria-live with comment
    {
      code: `
        // Announces loading status updates
        <div aria-live="polite">Loading...</div>
      `
    },
    // Visually hidden with comment
    {
      code: `
        // Screen reader only text for context
        <span className="sr-only">Opens in new tab</span>
      `
    },
    // aria-hidden="false" - no comment needed
    {
      code: `<span aria-hidden="false">Visible</span>`
    },
    // aria-live="off" - no comment needed
    {
      code: `<div aria-live="off">Static content</div>`
    },
    // Positive tabindex - no comment needed
    {
      code: `<button tabIndex={0}>Click</button>`
    },
    // Disabled checks
    {
      code: `<span aria-hidden="true">No check</span>`,
      options: [{ checkAriaHidden: false }]
    },
    {
      code: `<div role="presentation">No check</div>`,
      options: [{ checkRolePresentation: false }]
    },
    {
      code: `<button tabIndex={-1}>No check</button>`,
      options: [{ checkTabindex: false }]
    },
    {
      code: `<div aria-live="polite">No check</div>`,
      options: [{ checkAriaLive: false }]
    },
    // Comment meets minExplanationLength
    {
      code: `
        // This explains the purpose sufficiently
        <span aria-hidden="true">★</span>
      `,
      options: [{ minExplanationLength: 20 }]
    }
  ],
  invalid: [
    // aria-hidden without comment
    {
      code: `<span aria-hidden="true">★</span>`,
      errors: [{ messageId: "missingAriaHiddenContext" }]
    },
    // aria-hidden as boolean
    {
      code: `<span aria-hidden>★</span>`,
      errors: [{ messageId: "missingAriaHiddenContext" }]
    },
    // role="presentation" without comment
    {
      code: `<div role="presentation"><p>Content</p></div>`,
      errors: [{ messageId: "missingRolePresentationContext" }]
    },
    // role="none" without comment
    {
      code: `<div role="none"><p>Content</p></div>`,
      errors: [{ messageId: "missingRolePresentationContext" }]
    },
    // Negative tabindex without comment
    {
      code: `<button tabIndex={-1}>X</button>`,
      errors: [{ messageId: "missingTabindexContext" }]
    },
    // tabindex="-1" as string
    {
      code: `<button tabIndex="-1">X</button>`,
      errors: [{ messageId: "missingTabindexContext" }]
    },
    // aria-live without comment
    {
      code: `<div aria-live="polite">Loading...</div>`,
      errors: [{ messageId: "missingAriaLiveContext" }]
    },
    // aria-live="assertive" without comment
    {
      code: `<div aria-live="assertive">Error!</div>`,
      errors: [{ messageId: "missingAriaLiveContext" }]
    },
    // Visually hidden without comment
    {
      code: `<span className="sr-only">Opens in new tab</span>`,
      errors: [{ messageId: "missingVisuallyHiddenContext" }]
    },
    // Different visually hidden class
    {
      code: `<span className="visually-hidden">Text</span>`,
      errors: [{ messageId: "missingVisuallyHiddenContext" }]
    },
    // Custom visually hidden class
    {
      code: `<span className="custom-hidden">Text</span>`,
      options: [{ visuallyHiddenClasses: ["custom-hidden"] }],
      errors: [{ messageId: "missingVisuallyHiddenContext" }]
    },
    // aria-expanded check (when enabled)
    {
      code: `<button aria-expanded="false">Menu</button>`,
      options: [{ checkAriaExpanded: true }],
      errors: [{ messageId: "missingAriaExpandedContext" }]
    },
    // Comment too short
    {
      code: `
        // Short
        <span aria-hidden="true">★</span>
      `,
      options: [{ minExplanationLength: 20 }],
      errors: [{ messageId: "missingAriaHiddenContext" }]
    },
    // Note: ESLint directive comments (eslint-disable-next-line) are handled
    // specially by ESLint and may not appear in getCommentsBefore() results.
    // Testing directive exclusion with non-ESLint directive patterns:
    {
      code: `
        // TODO fix this later
        <span aria-hidden="true">★</span>
      `,
      errors: [{ messageId: "missingAriaHiddenContext" }]
    }
  ]
});
