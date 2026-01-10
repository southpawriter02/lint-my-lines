# accessibility-todo-format

Enforce a standard format for accessibility TODO comments.

## Rule Details

This rule ensures that accessibility-related TODO comments follow a consistent format with a reference (WCAG guideline, ticket number, or author) to track accessibility improvements systematically.

The format enforced is: `A11Y-TODO (reference): description`

### Why This Matters

Accessibility work is often deprioritized because it's hard to track. By standardizing how accessibility TODOs are written, teams can:

- **Track WCAG compliance**: Reference specific guidelines being addressed
- **Integrate with issue trackers**: Link to tickets for accountability
- **Audit accessibility debt**: Easily search for all `A11Y-TODO` comments
- **Prioritize fixes**: Reference severity levels via WCAG conformance levels

## WCAG References

Common WCAG guidelines you might reference in A11Y-TODOs:

| Guideline | Level | Description | Link |
|-----------|-------|-------------|------|
| 1.1.1 | A | Non-text Content | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content) |
| 1.4.3 | AA | Contrast (Minimum) | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) |
| 2.1.1 | A | Keyboard | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) |
| 2.4.7 | AA | Focus Visible | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible) |
| 4.1.2 | A | Name, Role, Value | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) |

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | `string` | `"^(?:A11Y-TODO\|ALLY-TODO)\\s*\\(([^)]+)\\):"` | Custom regex for format validation |
| `requireWcagReference` | `boolean` | `false` | Require WCAG guideline in reference |
| `allowedPrefixes` | `string[]` | `["A11Y-TODO", "ALLY-TODO"]` | Accepted prefixes |
| `wcagPattern` | `string` | `"WCAG-\\d+\\.\\d+\\.\\d+"` | Pattern for WCAG references |

## Examples

### Default Configuration

**Valid:**

```js
// A11Y-TODO (WCAG-2.1.1): Add keyboard navigation for dropdown
// A11Y-TODO (JIRA-123): Fix color contrast on error messages
// A11Y-TODO (sarah, 2025-01-09): Add focus indicators to buttons
// ALLY-TODO (WCAG-1.1.1): Add alt text to product images
```

**Invalid:**

```js
// A11Y-TODO: Add keyboard support
// A11Y-TODO fix the contrast
// a11y todo needs focus states
// A11Y-TODO (missing-colon) Description here
```

### Requiring WCAG References

```json
{
  "rules": {
    "lint-my-lines/accessibility-todo-format": ["error", {
      "requireWcagReference": true
    }]
  }
}
```

With this configuration:

**Valid:**

```js
// A11Y-TODO (WCAG-2.4.7): Add visible focus ring
// A11Y-TODO (WCAG-1.4.3): Increase text contrast to 4.5:1
```

**Invalid:**

```js
// A11Y-TODO (JIRA-456): Fix accessibility issue
// (No WCAG reference - will warn)
```

### Real-World Patterns

**From React Component Libraries:**

```jsx
// A11Y-TODO (WCAG-4.1.2): Add aria-expanded to toggle button
const Accordion = ({ expanded, onToggle, children }) => (
  <div>
    <button onClick={onToggle}>{children}</button>
  </div>
);

// A11Y-TODO (WCAG-2.1.1): Implement arrow key navigation
const TabList = ({ tabs, activeTab, onChange }) => (
  <div role="tablist">
    {tabs.map(tab => (
      <button role="tab" key={tab.id}>{tab.label}</button>
    ))}
  </div>
);
```

**Tracking Contrast Issues:**

```jsx
// A11Y-TODO (WCAG-1.4.3): Error red (#ff0000) fails contrast on white
// Current ratio: 3.99:1, required: 4.5:1
// Suggested fix: Use #c00000 (ratio: 5.25:1)
const ErrorMessage = ({ message }) => (
  <p className="error-text">{message}</p>
);
```

## Autofix

This rule provides automatic fixes by converting invalid A11Y-TODO comments to the expected format:

```js
// Before
// A11Y-TODO: Add focus indicators

// After (autofix)
// A11Y-TODO (WCAG-X.X.X): Add focus indicators
```

The autofix adds a placeholder reference that you should replace with the appropriate WCAG guideline or ticket number.

## Accessibility Best Practices

- **Reference specific WCAG guidelines** when possible (e.g., `WCAG-2.4.7` for focus visible)
- **Include the conformance level** in comments for prioritization (Level A issues are most critical)
- **Link to issue tracker tickets** for complex fixes that need discussion
- **Add context about the impact** (e.g., "Screen reader users cannot navigate this menu")
- **Group related TODOs** by component or feature area

## When Not To Use It

- When your team uses a different format for accessibility TODOs
- When you prefer to use the standard `enforce-todo-format` rule for all TODOs
- When accessibility work is tracked exclusively in external tools

## Related Rules

- [enforce-todo-format](enforce-todo-format.md) - Standard TODO format (for non-accessibility TODOs)
- [enforce-fixme-format](enforce-fixme-format.md) - FIXME format
- [require-alt-text-comments](require-alt-text-comments.md) - Require comments for UI elements
- [screen-reader-context](screen-reader-context.md) - Require screen reader behavior docs
