# lint-my-lines Versioned Roadmap

This document outlines the planned releases from **v0.0.1** through **v1.0.0**, mapping out the evolution of `eslint-plugin-lint-my-lines` from a proof-of-concept to a production-ready commenting style linter.

---

## Current Status

| Version | Status | Description |
|---------|--------|-------------|
| **v0.1.0** | ✅ Released | Initial development version with `enforce-todo-format` rule |
| **v0.2.0** | ✅ Released | Action comment suite with FIXME/NOTE rules, patterns, autofix |
| **v0.3.0** | ✅ Released | Commented-out code detection with configurable thresholds |
| **v0.4.0** | ✅ Released | Comment formatting rules (length, capitalization, spacing) |
| **v0.5.0** | ✅ Released | Content quality rules (obvious comments, banned words, explanation requirements) |
| **v0.6.0** | ✅ Released | JSDoc integration (require-jsdoc, valid-jsdoc, jsdoc-type-syntax) |
| **v0.7.0** | ✅ Released | File header enforcement (require-file-header) |
| **v0.8.0** | ✅ Released | Configurable rule presets (minimal, recommended, strict) |
| **v0.9.0** | ✅ Released | Developer tooling integration (CLI, flat config, CI/CD) |
| **v0.10.0** | ✅ Released | Additional language support (TypeScript, Vue, Svelte, Markdown) |
| **v0.11.0** | ✅ Released | Advanced analysis (stale detection, TODO aging, code ratio, issue trackers) |
| **v0.12.0** | ✅ Released | Performance optimization (caching, LRU eviction, error handling) |

---

## v0.0.1 – Initial Scaffold (Completed)

**Theme:** Project foundation

- [x] Initialize Node.js project with ESLint plugin structure
- [x] Create `package.json` with proper naming (`eslint-plugin-lint-my-lines`)
- [x] Set up directory structure (`lib/`, `lib/rules/`, `tests/`)
- [x] Create initial `README.md`
- [x] Add `LICENSE` file

---

## v0.1.0 – First Rule (Completed) ✅

**Theme:** Proof of concept

- [x] Implement `enforce-todo-format` rule
- [x] Create comprehensive `STYLE_GUIDE.md`
- [x] Write `IMPLEMENTATION_PLAN.md`
- [x] Set up Mocha testing framework
- [x] Create initial test for `enforce-todo-format`

---

## v0.2.0 – Action Comment Suite (Completed) ✅

**Theme:** Complete action-oriented comment rules

- [x] Implement `enforce-fixme-format` rule (mirrors TODO format for FIXME)
- [x] Implement `enforce-note-format` rule (for NOTE comments)
- [x] Add configurable format patterns via rule options
- [x] Add autofix support for TODO/FIXME/NOTE to suggest format corrections

---

## v0.3.0 – Commented-Out Code Detection (Completed) ✅

**Theme:** Code cleanliness

- [x] Implement `no-commented-code` rule
- [x] Detect multi-line commented functions/classes
- [x] Detect single-line statement comments (assignments, calls)
- [x] Allow configurable thresholds for acceptable commented lines
- [x] Provide clear error messages suggesting Git alternatives

---

## v0.4.0 – Comment Formatting Rules (Completed) ✅

**Theme:** Readability and consistency

- [x] Implement `enforce-comment-length` rule
  - Configure min/max length
  - Ignore links/URLs in length calculations
- [x] Implement `enforce-capitalization` rule
  - Sentence case for comment starts
  - Configurable exceptions for code references
- [x] Implement `comment-spacing` rule
  - Enforce space after `//`
  - Enforce space around `*` in block comments

---

## v0.5.0 – Content Quality Rules (Completed) ✅

**Theme:** Meaningful comments

- [x] Implement `no-obvious-comments` rule
  - Detect comments restating code (`// increment i`, `// return value`)
  - Use AST to match comment text against code patterns
  - Configurable sensitivity levels (low, medium, high)
- [x] Implement `ban-specific-words` rule
  - Configurable list of banned words/phrases
  - Default banned words including non-inclusive language
  - Suggest replacements where appropriate with autofix
- [x] Implement `require-explanation-comments` rule for complex code blocks
  - Configurable complexity detection (nesting depth, regex, bitwise, ternary chains)
  - Recursion detection
  - Complex condition detection

---

## v0.6.0 – JSDoc Integration (Completed) ✅

**Theme:** Function documentation

- [x] Implement `require-jsdoc` rule (for exported functions)
- [x] Implement `valid-jsdoc` rule
  - Validate `@param` matches function parameters
  - Validate `@returns` presence for non-void functions
- [x] Implement `jsdoc-type-syntax` rule
  - Enforce TypeScript-style types vs JSDoc types
- [x] Add autofix to generate JSDoc templates

---

## v0.7.0 – File Header Enforcement (Completed) ✅

**Theme:** File-level documentation

- [x] Implement `require-file-header` rule
- [x] Configurable required fields (`@file`, `@author`, `@license`)
- [x] Template-based header generation (autofix)
- [x] Support for different header styles (JSDoc, block, line)

---

## v0.8.0 – Configurable Rule Presets (Completed) ✅

**Theme:** User experience

- [x] Create `recommended` config preset
- [x] Create `strict` config preset
- [x] Create `minimal` config preset
- [x] Document all rule options comprehensively

---

## v0.9.0 – Developer Tooling Integration (Completed) ✅

**Theme:** CI/CD and workflow

- [x] Create official pre-commit hook configuration (docs/INTEGRATION_GUIDE.md)
- [x] Create GitHub Action for PR checks (.github/workflows/lint-comments.yml)
- [x] Add configuration generator CLI (`npx lint-my-lines init`)
- [x] Support for `.lintmylinesrc` config file
- [x] Create ESLint flat config support (`flat/minimal`, `flat/recommended`, `flat/strict`)

---

## v0.10.0 – Additional Language Support (Completed) ✅

**Theme:** Ecosystem expansion

- [x] TypeScript-specific comment rules
  - `valid-tsdoc` rule for TSDoc tag validation (`@typeParam`, `@remarks`, `@beta`, etc.)
  - TSDoc utility functions in `lib/utils/jsdoc-utils.js`
  - `typescript` and `typescript-strict` configuration presets
- [x] JSX/TSX comment handling
  - JSX-aware autofix for TODO/FIXME/NOTE rules
  - `react` configuration preset
- [x] Support for Vue SFC templates
  - `.vue` processor for template HTML comment extraction
  - `vue-template-comments` rule
  - `vue` configuration preset
- [x] Support for Svelte components
  - `.svelte` processor for markup HTML comment extraction
  - `svelte-template-comments` rule
  - `svelte` configuration preset
- [x] Markdown code block comment scanning
  - `.md` processor for fenced code block extraction
  - `markdown` configuration preset

---

## v0.11.0 – Advanced Analysis (Completed) ✅

**Theme:** Intelligent linting

- [x] Stale comment detection (comment references outdated code)
  - `stale-comment-detection` rule for detecting references to non-existent identifiers
  - Conservative detection strategy (backtick-quoted references)
  - Configurable ignore patterns and minimum identifier length
- [x] TODO/FIXME aging warnings (configurable stale threshold)
  - `todo-aging-warnings` rule with date parsing from comment format
  - Supports ISO, US, European, and written date formats
  - Configurable warning and critical thresholds
- [x] Comment-to-code ratio metrics
  - `comment-code-ratio` rule with min/max ratio enforcement
  - Options to exclude JSDoc and TODO comments from calculation
- [x] Integration with issue trackers (validate ticket IDs exist)
  - `issue-tracker-integration` rule supporting GitHub, Jira, GitLab, Linear, and custom APIs
  - Environment variable support for tokens
  - In-memory caching for API responses
  - Uses Node's built-in `https` module (no new dependencies)
- [x] New `analysis` / `flat/analysis` preset

---

## v0.12.0 – Performance & Polish (Completed) ✅

**Theme:** Production readiness

- [x] Performance optimization for large codebases
  - Comment caching via WeakMap (auto-cleanup)
  - LRU caching for regex, JSDoc parsing, and date parsing
  - Identifier collection caching
- [x] Caching for repeated runs
  - Shared comment cache across all rules
  - JSDoc parse results cached by content
- [x] Batch operations (within ESLint's serial execution model)
  - Pre-classified comments for efficient filtering
  - Quick rejection patterns for date parsing
- [x] Memory usage optimization
  - LRU eviction for all global caches (configurable max sizes)
  - WeakMap for file-scoped caches (auto garbage collection)
  - Issue tracker cache limited to 1000 entries
- [x] Comprehensive error handling and messages
  - Safe regex compilation with fallback patterns
  - Environment variable resolution with actionable error messages
  - Option validation utilities

---

## v1.0.0 – Stable Release 🎉

**Theme:** Production-ready release

- [ ] All planned rules implemented and tested
- [ ] 100% test coverage for core functionality
- [ ] Complete documentation (README, STYLE_GUIDE, API docs)
- [ ] Migration guide from pre-1.0 versions
- [ ] Published to npm as stable
- [ ] Changelog and release notes
- [ ] VS Code extension compatibility verified
- [ ] Community contribution guidelines (`CONTRIBUTING.md`)

---

## Future Considerations (Post-1.0)

These features are being considered for future major versions:

### Integration Enhancements
- Slack/Discord notifications for stale TODOs
- Jira/Linear integration for ticket validation
- IDE extensions with real-time feedback

### AI-Powered Features
- AI-suggested comment improvements
- Automatic documentation generation
- Semantic comment quality scoring

### Multi-Language Support
- Python comment linting
- Go comment linting
- Language-agnostic core engine

---

## Version Timeline (Estimated)

| Version | Target | Focus Area |
|---------|--------|------------|
| v0.2.0 | Q1 2026 | Action comments |
| v0.3.0 | Q1 2026 | Code cleanliness |
| v0.4.0 | Q1 2026 | Formatting |
| v0.5.0 | Q2 2026 | Content quality |
| v0.6.0 | Q2 2026 | JSDoc |
| v0.7.0 | Q2 2026 | File headers |
| v0.8.0 | Q3 2026 | Presets |
| v0.9.0 | Q3 2026 | Tooling |
| v0.10.0 | Q3 2026 | Multi-language |
| v0.11.0 | Q4 2026 | Advanced analysis |
| v0.12.0 | Q4 2026 | Polish |
| v1.0.0 | Q4 2026 | Stable release |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this roadmap and the project.
