# Performance Guide

This guide covers performance optimizations available in lint-my-lines v0.12.0+.

## Overview

lint-my-lines uses several caching strategies to improve performance when linting large codebases:

1. **Comment caching** - Comments are collected and classified once per file
2. **Regex caching** - Regular expressions are compiled once and reused
3. **JSDoc caching** - Parsed JSDoc comments are cached by content
4. **Date caching** - Parsed dates are cached for TODO aging analysis
5. **Issue tracker caching** - API responses are cached with TTL

## Caching Architecture

### WeakMap Caches (Auto-cleanup)

The following caches use `WeakMap` keyed by ESLint's `sourceCode` object:

- `commentCache` - Classified comments per file
- `identifierCache` - Collected identifiers per file
- `nodeIndexCache` - AST nodes indexed by line number

These caches are automatically garbage collected when ESLint finishes processing a file.

### LRU Caches (Size-limited)

The following caches use LRU (Least Recently Used) eviction:

| Cache | Max Size | Purpose |
|-------|----------|---------|
| `regexCache` | 200 | Compiled regex patterns |
| `jsdocCache` | 500 | Parsed JSDoc comments |
| `dateCache` | 200 | Parsed date strings |
| `ticketCache` | 1000 | Issue tracker API responses |

## Performance Tips

### 1. Use Shared Configurations

When multiple rules analyze comments, they share the cached comment collection:

```javascript
// All these rules share the same cached comments:
"lint-my-lines/no-obvious-comments": "warn",
"lint-my-lines/stale-comment-detection": "warn",
"lint-my-lines/ban-specific-words": "warn",
```

### 2. Configure Issue Tracker Caching

For `issue-tracker-integration`, adjust cache timeout based on your needs:

```javascript
{
  "lint-my-lines/issue-tracker-integration": ["warn", {
    "tracker": "github",
    "cacheTimeout": 3600  // Cache for 1 hour (default)
  }]
}
```

Set `cacheTimeout: 0` to disable caching (useful for CI where fresh data is needed).

### 3. Use Offline Mode When Appropriate

Skip API validation entirely in development:

```javascript
{
  "lint-my-lines/issue-tracker-integration": ["warn", {
    "offline": true  // No API calls
  }]
}
```

### 4. Tune TODO Aging Date Parsing

Date parsing uses a quick-check pattern to skip strings that definitely aren't dates:

```javascript
// Quick rejection pattern
/\d{4}|\d{1,2}[/.-]\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i
```

This means comments without any date-like patterns are skipped efficiently.

## Clearing Caches

For testing or to force fresh analysis, clear all caches:

```javascript
const plugin = require("eslint-plugin-lint-my-lines");

// Clear all LRU caches (WeakMap caches auto-clear)
plugin.clearCaches();
```

This is automatically called between test runs.

## Benchmarks

Expected performance improvements in v0.12.0:

| Scenario | Improvement |
|----------|-------------|
| Multi-rule lint time | 30-50% faster |
| `no-obvious-comments` | Up to 60% faster |
| Repeated runs (cached) | Significantly faster |
| Memory usage | 20-30% reduction |

## Memory Considerations

### LRU Cache Limits

The caches are size-limited to prevent unbounded memory growth:

- Regex cache: 200 entries (~50KB max)
- JSDoc cache: 500 entries (~500KB max)
- Date cache: 200 entries (~20KB max)
- Ticket cache: 1000 entries (~200KB max)

### WeakMap Cleanup

WeakMap caches are cleaned up automatically when:
- ESLint finishes processing a file
- The `sourceCode` object is garbage collected

This means memory usage scales with the number of files being processed concurrently, not the total number of files.

## Debugging Performance

To identify slow rules, use ESLint's timing feature:

```bash
TIMING=1 npx eslint .
```

This shows how long each rule takes, helping identify bottlenecks.
