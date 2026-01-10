# screen-reader-context

Require explanatory comments for UI patterns that behave differently for screen readers.

## Rule Details

This rule ensures that elements with special screen reader behavior have comments explaining why that behavior was chosen. This includes elements hidden from assistive technology, elements removed from tab order, and live regions that announce changes.

### Why This Matters

Screen readers interact with the DOM differently than visual browsers. When developers use attributes like `aria-hidden`, `role="presentation"`, or negative `tabindex`, they're making decisions that affect how (or if) screen reader users can perceive and interact with content.

Without documentation, future developers may:
- Remove "unnecessary" ARIA attributes, breaking accessibility
- Not understand why an element is hidden from screen readers
- Fail to maintain the intended screen reader experience

## WCAG References

| Guideline | Level | Description | Applies To | Link |
|-----------|-------|-------------|------------|------|
| 1.3.1 | A | Info and Relationships | aria-hidden, role | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships) |
| 2.1.1 | A | Keyboard | tabindex | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard) |
| 4.1.2 | A | Name, Role, Value | ARIA roles | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value) |
| 4.1.3 | AA | Status Messages | aria-live | [WCAG](https://www.w3.org/WAI/WCAG21/Understanding/status-messages) |

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `checkAriaHidden` | `boolean` | `true` | Check `aria-hidden="true"` elements |
| `checkRolePresentation` | `boolean` | `true` | Check `role="presentation"` elements |
| `checkTabindex` | `boolean` | `true` | Check negative tabindex elements |
| `checkAriaLive` | `boolean` | `true` | Check aria-live regions |
| `checkAriaExpanded` | `boolean` | `false` | Check aria-expanded elements |
| `visuallyHiddenClasses` | `string[]` | `["sr-only", "visually-hidden", ...]` | Classes for visually hidden text |
| `minExplanationLength` | `number` | `15` | Minimum comment length |

## Examples

### aria-hidden Elements

Elements with `aria-hidden="true"` are completely invisible to screen readers.

**Valid:**

```jsx
{/* Decorative star rating display - actual rating in sr-only text */}
<span aria-hidden="true">★★★☆☆</span>
<span className="sr-only">3 out of 5 stars</span>

{/* Duplicate navigation hidden from screen readers to avoid repetition */}
<nav aria-hidden="true" className="desktop-only">
  {/* Same links as mobile nav */}
</nav>
```

**Invalid:**

```jsx
<span aria-hidden="true">Important information</span>  // No explanation

<div aria-hidden="true">  // Hidden but contains meaningful content
  <button>Click me</button>
</div>
```

### role="presentation" Elements

Elements with `role="presentation"` or `role="none"` have their semantic meaning removed.

**Valid:**

```jsx
{/* Layout table - no data relationships, used for positioning only */}
<table role="presentation">
  <tr>
    <td><Logo /></td>
    <td><Navigation /></td>
  </tr>
</table>

{/* Decorative list wrapper - items have their own semantics */}
<ul role="presentation" className="card-grid">
  <li><Card /></li>
</ul>
```

**Invalid:**

```jsx
<table role="presentation">  // No explanation for removing semantics
  <tr><td>Data</td></tr>
</table>
```

### Negative tabindex Elements

Elements with `tabindex="-1"` are removed from the tab order but can still receive programmatic focus.

**Valid:**

```jsx
{/* Removed from tab order - focus managed by parent Listbox component */}
<div role="option" tabIndex={-1}>
  Option 1
</div>

{/* Skip link target - receives focus when skip link activated */}
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>

{/* Modal close button - focus trapped within modal, managed by FocusTrap */}
<button tabIndex={-1} onClick={closeModal}>
  <CloseIcon />
</button>
```

**Invalid:**

```jsx
<button tabIndex={-1}>Click me</button>  // Why removed from tab order?

<input tabIndex={-1} />  // Form field not keyboard accessible
```

### aria-live Regions

Live regions announce content changes to screen reader users.

**Valid:**

```jsx
{/* Announces form validation errors as they occur */}
<div aria-live="polite" aria-atomic="true">
  {errors.map(error => <p key={error.id}>{error.message}</p>)}
</div>

{/* Immediately announces critical alerts - use sparingly */}
<div aria-live="assertive" role="alert">
  {criticalError}
</div>

{/* Announces item count changes in search results */}
<p aria-live="polite">
  {resultCount} results found
</p>
```

**Invalid:**

```jsx
<div aria-live="polite">  // What changes? When announced?
  {dynamicContent}
</div>
```

### Visually Hidden Text

Elements with classes like `sr-only` or `visually-hidden` are visible only to screen readers.

**Valid:**

```jsx
{/* Provides context for icon-only button */}
<button>
  <SearchIcon aria-hidden="true" />
  <span className="sr-only">Search products</span>
</button>

{/* Announces that link opens in new tab */}
<a href={url} target="_blank" rel="noopener">
  External resource
  <span className="visually-hidden">(opens in new tab)</span>
</a>

{/* Provides accessible label for complex data visualization */}
<div className="chart-container">
  <span className="sr-only">
    Sales increased 25% from January to June 2025
  </span>
  <Chart data={salesData} aria-hidden="true" />
</div>
```

**Invalid:**

```jsx
<span className="sr-only">Click here</span>  // Not helpful - what for?

<span className="visually-hidden">{data}</span>  // What is this data?
```

### Real-World Patterns

**From Modal/Dialog Components (Headless UI style):**

```jsx
{/* Background overlay - click closes modal, hidden from screen readers
    because the dialog itself handles escape key and focus trap */}
<div
  aria-hidden="true"
  className="modal-backdrop"
  onClick={closeModal}
/>

{/* Modal container - focus is trapped here, tabindex allows programmatic
    focus when modal opens */}
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabIndex={-1}
>
  <h2 id="modal-title">Confirm Action</h2>
  {/* Modal content */}
</div>
```

**From Accordion Components (Chakra UI style):**

```jsx
{/* Accordion panel - aria-hidden managed by AccordionItem based on
    expanded state. Screen readers rely on aria-expanded on trigger. */}
<div
  aria-hidden={!isExpanded}
  className="accordion-panel"
>
  {children}
</div>
```

**From Toast/Notification Systems:**

```jsx
{/* Toast container - announces new toasts politely to avoid interrupting
    user flow. atomic="false" so only new toasts are announced. */}
<div
  aria-live="polite"
  aria-atomic="false"
  className="toast-container"
>
  {toasts.map(toast => (
    <Toast key={toast.id} {...toast} />
  ))}
</div>
```

## Accessibility Best Practices

- **Explain the "why"**: Don't just note that something is hidden; explain why it should be
- **Document focus management**: When using negative tabindex, explain how focus is managed
- **Reference the pattern**: Link to WAI-ARIA Authoring Practices for complex patterns
- **Consider the user journey**: Describe what screen reader users will experience
- **Test with screen readers**: Verify your documented behavior matches reality

### Common Patterns Requiring Documentation

| Pattern | Needs Comment | Reason |
|---------|--------------|--------|
| `aria-hidden="true"` | Always | Why hidden from assistive tech? |
| `role="presentation"` | Always | Why remove semantic meaning? |
| `tabindex="-1"` | Always | How is focus managed? |
| `aria-live="polite"` | Always | What changes are announced? |
| `aria-live="assertive"` | Always | Why interrupt the user? |
| `.sr-only` / `.visually-hidden` | Always | What context does this provide? |

## When Not To Use It

- When accessibility documentation is maintained separately
- When your component library has built-in accessibility documentation
- When you want to audit accessibility patterns before requiring documentation

## Related Rules

- [accessibility-todo-format](accessibility-todo-format.md) - Track accessibility improvements
- [require-alt-text-comments](require-alt-text-comments.md) - Document UI element accessibility
- [require-explanation-comments](require-explanation-comments.md) - Explain complex code
