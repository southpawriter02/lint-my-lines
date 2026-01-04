# Migration Guide

This guide helps you upgrade to newer versions of `eslint-plugin-lint-my-lines`.

## Upgrading to v1.0.0

v1.0.0 is the first stable release. There are **no breaking changes** from v0.12.x.

### From v0.12.x

Simply update your dependency:

```bash
npm install eslint-plugin-lint-my-lines@1
```

No configuration changes are required. All rules, presets, and options remain the same.

### From v0.11.x or earlier

1. **Update the dependency**:
   ```bash
   npm install eslint-plugin-lint-my-lines@1
   ```

2. **Benefit from automatic improvements**:
   - Performance optimizations are applied automatically
   - Caching reduces lint time by 30-50% for multi-rule configurations
   - Memory usage is optimized with LRU cache eviction

3. **No configuration changes required**:
   - All rule APIs are stable
   - All presets work the same way
   - All options are preserved

### From v0.8.x or earlier (before flat config)

If you're upgrading from before v0.9.0 and want to use ESLint v9's flat config:

**Legacy config (ESLint v8)**:
```javascript
// .eslintrc.js
module.exports = {
  extends: ["plugin:lint-my-lines/recommended"],
};
```

**Flat config (ESLint v9+)**:
```javascript
// eslint.config.js
import lintMyLines from "eslint-plugin-lint-my-lines";

export default [
  lintMyLines.configs["flat/recommended"],
];
```

Both formats are fully supported. Use whichever matches your ESLint version.

---

## Version History Overview

| Version | Key Features |
|---------|-------------|
| v1.0.0 | First stable release, complete documentation |
| v0.12.x | Performance optimizations, caching |
| v0.11.x | Advanced analysis rules (stale detection, TODO aging) |
| v0.10.x | Multi-language support (TypeScript, Vue, Svelte, Markdown) |
| v0.9.x | Flat config support, CLI tool |
| v0.8.x | Configuration presets (minimal, recommended, strict) |
| v0.7.x | File header enforcement |
| v0.6.x | JSDoc integration rules |
| v0.5.x | Content quality rules |
| v0.4.x | Comment formatting rules |
| v0.3.x | Commented-out code detection |
| v0.2.x | Action comment suite (TODO, FIXME, NOTE) |
| v0.1.x | Initial release with enforce-todo-format |

---

## Breaking Changes

### v1.0.0

**None.** v1.0.0 is fully backward compatible with v0.12.x.

### Future Versions (v2.0.0+)

When breaking changes occur in future major versions, they will be documented here with:
- Description of the change
- Migration steps
- Code examples showing before/after

---

## Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG](../CHANGELOG.md) for detailed version notes
2. Review [rule documentation](./rules/) for option changes
3. Open an [issue](https://github.com/southpawriter02/lint-my-lines/issues) if you're stuck

---

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major** (1.x.x → 2.0.0): Breaking changes, removal of deprecated features
- **Minor** (1.0.x → 1.1.0): New features, new rules, backward-compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, documentation updates

Starting with v1.0.0, you can rely on:
- No breaking changes within the same major version
- Deprecated features will be warned before removal
- At least one minor version notice before major changes
