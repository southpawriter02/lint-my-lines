# Accessibility Comments Guide

This guide explains how to write effective comments that document accessibility decisions in your codebase. Good accessibility comments help teams maintain inclusive interfaces and prevent regressions.

## Why Document Accessibility?

Accessibility (a11y) decisions are often invisible in code. A sighted developer might not realize that:

- An icon is hidden from screen readers for a reason
- A focus trap is intentionally implemented
- Color choices were made for contrast compliance
- Tab order was customized for usability

**Comments preserve this knowledge** and prevent well-meaning refactors from breaking accessibility.

## Quick Start with lint-my-lines

Enable the accessibility preset:

```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
  lintMyLines.configs["flat/accessibility"],
];
```

This enables three rules:
- `accessibility-todo-format` - Standardize a11y TODO comments
- `require-alt-text-comments` - Document UI element accessibility
- `screen-reader-context` - Explain screen reader behavior

## WCAG Quick Reference for Developers

When documenting accessibility, reference these common WCAG 2.1 guidelines:

### Perceivable (1.x.x)

| Guideline | Level | Summary | Example Use |
|-----------|-------|---------|-------------|
| 1.1.1 | A | Non-text Content | Images need alt text |
| 1.3.1 | A | Info and Relationships | Semantic HTML, ARIA |
| 1.4.1 | A | Use of Color | Don't rely on color alone |
| 1.4.3 | AA | Contrast (Minimum) | 4.5:1 for normal text |
| 1.4.11 | AA | Non-text Contrast | 3:1 for UI components |

### Operable (2.x.x)

| Guideline | Level | Summary | Example Use |
|-----------|-------|---------|-------------|
| 2.1.1 | A | Keyboard | All functionality via keyboard |
| 2.1.2 | A | No Keyboard Trap | Can always navigate away |
| 2.4.3 | A | Focus Order | Logical tab sequence |
| 2.4.7 | AA | Focus Visible | Visible focus indicator |

### Understandable (3.x.x)

| Guideline | Level | Summary | Example Use |
|-----------|-------|---------|-------------|
| 3.2.1 | A | On Focus | No unexpected changes |
| 3.3.1 | A | Error Identification | Describe errors clearly |
| 3.3.2 | A | Labels or Instructions | Form fields have labels |

### Robust (4.x.x)

| Guideline | Level | Summary | Example Use |
|-----------|-------|---------|-------------|
| 4.1.2 | A | Name, Role, Value | ARIA attributes correct |
| 4.1.3 | AA | Status Messages | Live regions for updates |

## Comment Patterns by Scenario

### Pattern 1: Decorative Images

When an image is purely decorative and conveys no information:

```jsx
// Decorative background pattern - no information content
<img src="pattern.svg" alt="" aria-hidden="true" />

// Brand flourish - visual design only, not meaningful
<svg aria-hidden="true" className="flourish">...</svg>
```

### Pattern 2: Icon Buttons

When a button contains only an icon:

```jsx
// Close modal button - aria-label provides accessible name
// Icon is hidden since label describes the action
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>

// Alternative: visually hidden text
// Search button - visible icon with screen reader text
<button type="submit">
  <SearchIcon aria-hidden="true" />
  <span className="sr-only">Search</span>
</button>
```

### Pattern 3: External Links

When links open in new tabs:

```jsx
// External link - opens in new tab
// Screen reader text warns users about new tab behavior
<a href={url} target="_blank" rel="noopener noreferrer">
  {linkText}
  <ExternalLinkIcon aria-hidden="true" />
  <span className="sr-only">(opens in new tab)</span>
</a>
```

### Pattern 4: Form Validation

When showing validation errors:

```jsx
// Form error messages - live region announces errors to screen readers
// aria-atomic="true" ensures full message is read each time
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
  className="error-container"
>
  {errors.map(error => (
    <p key={error.field}>{error.message}</p>
  ))}
</div>
```

### Pattern 5: Loading States

When content is loading:

```jsx
// Loading indicator - announced to screen readers via aria-busy
// Spinner icon hidden, status conveyed via aria-label
<div aria-busy={isLoading} aria-label={isLoading ? "Loading content" : undefined}>
  {isLoading && (
    // Decorative spinner - aria-label on parent announces loading
    <Spinner aria-hidden="true" />
  )}
  {content}
</div>
```

### Pattern 6: Modal Dialogs

When implementing modal/dialog patterns:

```jsx
// Modal backdrop - visual overlay, click to close
// Hidden from screen readers - dialog handles keyboard dismissal
<div
  aria-hidden="true"
  className="modal-backdrop"
  onClick={onClose}
/>

// Modal dialog - focus trapped within, manages keyboard interaction
// tabIndex={-1} allows programmatic focus on open
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  tabIndex={-1}
  ref={dialogRef}
>
  <h2 id="dialog-title">{title}</h2>
  {children}
</div>
```

### Pattern 7: Skip Links

When implementing skip navigation:

```jsx
// Skip link - first focusable element, allows keyboard users to
// bypass repetitive navigation. Target has tabIndex for focus.
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// ... navigation ...

// Skip link target - receives focus when skip link activated
// tabIndex={-1} allows focus but doesn't add to tab order
<main id="main-content" tabIndex={-1}>
  {pageContent}
</main>
```

### Pattern 8: Tabs

When implementing tab interfaces:

```jsx
// Tab list - arrow keys navigate between tabs
// Only active tab is in tab order (roving tabindex)
<div role="tablist" aria-label="Product information">
  {tabs.map((tab, index) => (
    // Tab button - selected tab has tabIndex={0}, others have -1
    // Focus managed by arrow key handlers
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === index}
      aria-controls={`panel-${tab.id}`}
      tabIndex={activeTab === index ? 0 : -1}
    >
      {tab.label}
    </button>
  ))}
</div>
```

## Tracking Accessibility Work

Use the `A11Y-TODO` format to track accessibility improvements:

```jsx
// A11Y-TODO (WCAG-2.4.7): Add visible focus indicator to this button
// Current outline: none; needs 2px solid with sufficient contrast
<button className="custom-button">Submit</button>

// A11Y-TODO (WCAG-1.4.3): Increase contrast ratio
// Current: #777 on white (4.48:1), need 4.5:1 minimum
// Fix: Use #767676 or darker
<p className="secondary-text">Help text</p>

// A11Y-TODO (JIRA-1234): Add keyboard support for date picker
// Currently only works with mouse, blocks keyboard-only users
<DatePicker value={date} onChange={setDate} />
```

## Real-World Examples

### From Chakra UI Patterns

```jsx
// Chakra-style visually hidden component
// Provides accessible text without visual presence
// Used for screen reader announcements and form labels
<VisuallyHidden>
  {isRequired && "Required field: "}
  {label}
</VisuallyHidden>
```

### From Radix UI Patterns

```jsx
// Radix Dialog pattern - portal renders outside DOM tree
// but maintains accessibility tree relationships
<Dialog.Portal>
  {/* Overlay backdrop - animated, click dismisses
      aria-hidden because Dialog handles keyboard/focus */}
  <Dialog.Overlay aria-hidden="true" />

  {/* Dialog content - focus locked here, escape to close */}
  <Dialog.Content>
    <Dialog.Title>{title}</Dialog.Title>
    {children}
  </Dialog.Content>
</Dialog.Portal>
```

### From React Aria Patterns

```jsx
// React Aria useButton pattern
// Handles keyboard, touch, and mouse interactions accessibly
// aria-pressed for toggle buttons, aria-disabled for disabled state
<button
  {...buttonProps}
  // Button can be disabled but still focusable for screen readers
  // This provides context about why the action isn't available
  aria-disabled={isDisabled}
  tabIndex={isDisabled ? 0 : undefined}
>
  {children}
</button>
```

## Testing Your Comments

After adding accessibility comments:

1. **Test with a screen reader**: Verify your documented behavior
   - macOS: VoiceOver (Cmd + F5)
   - Windows: NVDA (free) or JAWS
   - Chrome: ChromeVox extension

2. **Keyboard-only testing**: Navigate without a mouse
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test all functionality via keyboard

3. **Automated testing**: Use axe-core or similar
   - `npm install @axe-core/react` for React
   - Catches common WCAG violations

## Further Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Patterns for widgets
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) - Filterable guidelines
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - Web a11y docs
- [A11y Project Checklist](https://www.a11yproject.com/checklist/) - Practical checklist
- [Inclusive Components](https://inclusive-components.design/) - Component patterns

## Related Documentation

- [accessibility-todo-format](rules/accessibility-todo-format.md) - A11Y-TODO rule
- [require-alt-text-comments](rules/require-alt-text-comments.md) - UI element comments
- [screen-reader-context](rules/screen-reader-context.md) - Screen reader behavior docs
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - General integration guide
