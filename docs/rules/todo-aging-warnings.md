# todo-aging-warnings

Warn when TODO/FIXME comments exceed a configurable age threshold.

## Rule Details

This rule detects old TODO and FIXME comments that may have been forgotten. It parses dates from the comment format `TODO (author, YYYY-MM-DD): description` and warns when comments exceed the configured age.

### Supported Date Formats

- **ISO**: `2025-01-03`
- **US**: `01/03/2025`
- **European**: `03.01.2025`
- **Written**: `Jan 3, 2025` or `January 3, 2025`

### Examples

❌ **Warning** - TODO older than 30 days (default):

```javascript
// TODO (john, 2024-01-15): Fix this bug
function buggyCode() {}
```

❌ **Critical** - TODO older than 90 days (default):

```javascript
// TODO (jane, 2023-06-01): Refactor this
function legacyCode() {}
```

✅ **Correct** - Recent TODO:

```javascript
// TODO (john, 2025-01-02): Add error handling
function newCode() {}
```

✅ **Correct** - No date (when `warnOnNoDate` is false):

```javascript
// TODO: Fix this later
function code() {}
```

## Options

```json
{
  "lint-my-lines/todo-aging-warnings": ["warn", {
    "maxAgeDays": 30,
    "criticalAgeDays": 90,
    "includeFixme": true,
    "includeNote": false,
    "warnOnNoDate": false
  }]
}
```

### `maxAgeDays` (default: `30`)

Number of days after which a TODO generates a warning.

### `criticalAgeDays` (default: `90`)

Number of days after which a TODO generates a critical warning. Set to `0` to disable.

### `includeFixme` (default: `true`)

Also check FIXME comments.

### `includeNote` (default: `false`)

Also check NOTE comments.

### `warnOnNoDate` (default: `false`)

Warn when TODO/FIXME comments don't include a date:

```json
{
  "warnOnNoDate": true
}
```

With this enabled, comments without dates will trigger the `todoNoDate` or `fixmeNoDate` message.

## Expected Format

For the rule to parse dates, use this format:

```javascript
// TODO (author, YYYY-MM-DD): description
// FIXME (team, 01/15/2025): description
```

The date can appear anywhere in the parenthetical reference section.

## Use Cases

1. **Sprint hygiene**: Set `maxAgeDays: 14` to ensure TODOs are addressed within a sprint
2. **Technical debt tracking**: Set `criticalAgeDays: 180` for long-term tracking
3. **Enforce dating**: Set `warnOnNoDate: true` to require dates on all TODOs

## When Not to Use This Rule

- If your team doesn't use dated TODO comments
- In legacy codebases with many old TODOs (consider cleaning up first)
- If TODOs are managed through external issue trackers

## Related Rules

- [enforce-todo-format](./enforce-todo-format.md) - Enforce TODO format
- [enforce-fixme-format](./enforce-fixme-format.md) - Enforce FIXME format
- [issue-tracker-integration](./issue-tracker-integration.md) - Validate ticket IDs
