# require-alt-text-comments

Require comments for complex UI elements explaining their accessibility purpose.

## Rule Details

This rule ensures that UI elements which may need accessibility context (icons, images, SVGs, buttons without visible text) have explanatory comments. This helps developers understand and maintain accessible interfaces.

### Why This Matters

Screen reader users rely on proper text alternatives and ARIA attributes to understand UI elements. Comments documenting accessibility decisions help:

- **Preserve intent**: Future developers understand why specific accessibility patterns were chosen
- **Catch oversights**: Missing comments highlight elements that may need accessibility review
- **Document decorative elements**: Explicitly mark images/icons as decorative
- **Explain complex patterns**: Document why certain ARIA attributes are used

## WCAG References

| Guideline | Level | Description | Link |
|-----------|-------|-------------|------|
| 1.1.1 | A | Non-text Content | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content) |
| 1.4.5 | AA | Images of Text | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/images-of-text) |
| 4.1.2 | A | Name, Role, Value | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) |

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `elements` | `string[]` | `["img", "svg", "Icon", "button"]` | JSX elements to check |
| `requireForAriaLabels` | `boolean` | `true` | Require comment when aria-label present |
| `iconComponentPatterns` | `string[]` | `["Icon$", "Ico$", "^Icon", "^Svg"]` | Regex patterns for icon components |
| `minCommentLength` | `number` | `10` | Minimum characters for meaningful comment |
| `checkEmptyAlt` | `boolean` | `true` | Check elements with empty alt (decorative) |

## Examples

### Default Configuration

**Valid:**

```jsx
// Search icon - submits the search form
<Icon name="search" onClick={handleSearch} />

// User avatar showing profile picture
<img src={user.avatar} alt={user.name} />

{/* Decorative divider - hidden from screen readers */}
<img src="divider.svg" alt="" aria-hidden="true" />

// Close button for modal dialog
<button aria-label="Close dialog">
  <Icon name="close" />
</button>
```

**Invalid:**

```jsx
<Icon name="search" />  // No comment explaining purpose

<img src="logo.png" alt="" />  // Decorative but no explanation

<button aria-label="Submit">  // Has aria-label but no context
  <Icon name="arrow" />
</button>
```

### Real-World Patterns

**From Material-UI Style Components:**

```jsx
// Icon button for toggling password visibility
// aria-label describes the action, not the icon
<IconButton
  aria-label={showPassword ? "Hide password" : "Show password"}
  onClick={togglePasswordVisibility}
>
  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
</IconButton>
```

**From Accessible Form Patterns:**

```jsx
// Required field indicator - decorative, text is in label
<span className="required-asterisk" aria-hidden="true">*</span>

// Error icon paired with error message
// Icon is decorative since message provides context
<div className="error-wrapper">
  <ErrorIcon aria-hidden="true" />
  <span role="alert">{errorMessage}</span>
</div>
```

**From Navigation Components:**

```jsx
// External link indicator icon
// Screen reader text added via visually-hidden span
<a href={externalUrl}>
  {linkText}
  <ExternalLinkIcon aria-hidden="true" />
  <span className="sr-only">(opens in new tab)</span>
</a>

// Hamburger menu icon for mobile navigation
// Button text is visually hidden but accessible
<button className="mobile-menu-toggle">
  <MenuIcon aria-hidden="true" />
  <span className="visually-hidden">Open navigation menu</span>
</button>
```

**From Data Visualization:**

```jsx
// Decorative chart icon - data is in adjacent table
<ChartIcon aria-hidden="true" />

// Status indicator with color and icon
// Text label provides accessible alternative
<div className="status">
  <StatusIcon status={status} aria-hidden="true" />
  <span>{statusLabels[status]}</span>
</div>
```

### Disabling Empty Alt Check

If decorative images don't need explanation comments:

```json
{
  "rules": {
    "lint-my-lines/require-alt-text-comments": ["warn", {
      "checkEmptyAlt": false
    }]
  }
}
```

### Custom Icon Patterns

For projects with custom icon naming:

```json
{
  "rules": {
    "lint-my-lines/require-alt-text-comments": ["warn", {
      "iconComponentPatterns": ["Icon$", "Glyph$", "^Fa", "^Md"]
    }]
  }
}
```

## Accessibility Best Practices

- **Document decorative vs. meaningful**: Clearly state when an image/icon is decorative
- **Explain aria-label choices**: Document why specific labels were chosen
- **Reference WCAG guidelines**: Link to relevant guidelines in complex cases
- **Consider screen reader announcements**: Document what users will hear
- **Group related elements**: Explain how icon + text combinations work together

### Good Comment Examples

```jsx
// Decorative flourish - purely visual, no information conveyed
<img src="flourish.svg" alt="" aria-hidden="true" />

// User avatar - alt text is user's name for identification
// Falls back to "User avatar" if name unavailable
<img src={avatar} alt={name || "User avatar"} />

// Action icon with visible label - icon is supplementary
// Screen readers will announce "Edit profile" from button text
<button>
  <EditIcon aria-hidden="true" />
  Edit profile
</button>
```

## When Not To Use It

- When your codebase doesn't use JSX/React
- When you have separate accessibility documentation
- When all icons are in a centralized icon component with built-in accessibility

## Related Rules

- [accessibility-todo-format](accessibility-todo-format.md) - Track accessibility improvements
- [screen-reader-context](screen-reader-context.md) - Document screen reader behavior
- [require-explanation-comments](require-explanation-comments.md) - Explain complex code
