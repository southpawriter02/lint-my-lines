# ban-specific-words

Ban specific words or phrases in comments.

## Rule Details

This rule prevents usage of vague, non-inclusive, or otherwise problematic words in comments. It includes a default list of banned terms and supports custom additions.

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bannedWords` | `object[]` | `[]` | Custom banned words with replacements |
| `caseSensitive` | `boolean` | `false` | Case-sensitive matching |
| `includeDefaults` | `boolean` | `true` | Include default banned words |
| `wholeWord` | `boolean` | `true` | Match whole words only |

## Default Banned Words

| Word/Phrase | Reason | Suggested Replacement |
|-------------|--------|----------------------|
| `hack` | Vague | "workaround", "temporary fix" |
| `magic number` | Vague | Define as named constant |
| `fix later` | Vague | Create a TODO with ticket |
| `obvious` | Unhelpful | Remove or explain |
| `self-explanatory` | Unhelpful | Remove or explain |
| `clearly` | Unhelpful | Remove or explain |
| `whitelist` | Non-inclusive | "allowlist" |
| `blacklist` | Non-inclusive | "blocklist" |
| `master` | Non-inclusive | "main", "primary" |
| `slave` | Non-inclusive | "replica", "secondary" |
| `xxx` | Vague | Create proper TODO |
| `kludge` | Vague | "workaround" |

## Examples

### Default Configuration

**Valid:**

```js
// Using allowlist for approved domains
// This is a workaround for the browser bug
// The primary database handles writes
```

**Invalid:**

```js
// This is a hack to fix the bug
// Add to the whitelist
// Check the blacklist first
// The slave database handles reads
```

### Custom Banned Words

```json
{
  "rules": {
    "lint-my-lines/ban-specific-words": ["error", {
      "bannedWords": [
        {
          "word": "asap",
          "reason": "Be specific about timeline",
          "replacement": "by [specific date]"
        }
      ],
      "includeDefaults": true
    }]
  }
}
```

### Case Sensitivity

```json
{
  "rules": {
    "lint-my-lines/ban-specific-words": ["error", {
      "caseSensitive": true
    }]
  }
}
```

## Autofix

When a replacement is available, the rule provides automatic fixes:

```js
// Before
// Add to the whitelist

// After (autofix)
// Add to the allowlist
```

## When Not To Use It

- When discussing these terms in documentation context
- When the terms are part of external API names

## Related Rules

- [no-obvious-comments](no-obvious-comments.md)
