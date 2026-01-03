# lint-my-lines Versioned Roadmap

This document outlines the planned releases from **v0.0.1** through **v1.0.0**, mapping out the evolution of `eslint-plugin-lint-my-lines` from a proof-of-concept to a production-ready commenting style linter.

---

## Current Status

| Version | Status | Description |
|---------|--------|-------------|
| **v0.1.0** | ✅ Released | Initial development version with `enforce-todo-format` rule |
| **v0.2.0** | ✅ Released | Action comment suite with FIXME/NOTE rules, patterns, autofix |

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

## v0.3.0 – Commented-Out Code Detection

**Theme:** Code cleanliness

- [ ] Implement `no-commented-code` rule
- [ ] Detect multi-line commented functions/classes
- [ ] Detect single-line statement comments (assignments, calls)
- [ ] Allow configurable thresholds for acceptable commented lines
- [ ] Provide clear error messages suggesting Git alternatives

---

## v0.4.0 – Comment Formatting Rules

**Theme:** Readability and consistency

- [ ] Implement `enforce-comment-length` rule
  - Configure min/max length
  - Ignore links/URLs in length calculations
- [ ] Implement `enforce-capitalization` rule
  - Sentence case for comment starts
  - Configurable exceptions for code references
- [ ] Implement `comment-spacing` rule
  - Enforce space after `//`
  - Enforce space around `*` in block comments

---

## v0.5.0 – Content Quality Rules

**Theme:** Meaningful comments

- [ ] Implement `no-obvious-comments` rule
  - Detect comments restating code (`// increment i`, `// return value`)
  - Use AST to match comment text against code patterns
- [ ] Implement `ban-specific-words` rule
  - Configurable list of banned words/phrases
  - Suggest replacements where appropriate
- [ ] Implement `require-explanation-comments` rule for complex code blocks

---

## v0.6.0 – JSDoc Integration

**Theme:** Function documentation

- [ ] Implement `require-jsdoc` rule (for exported functions)
- [ ] Implement `valid-jsdoc` rule
  - Validate `@param` matches function parameters
  - Validate `@returns` presence for non-void functions
- [ ] Implement `jsdoc-type-syntax` rule
  - Enforce TypeScript-style types vs JSDoc types
- [ ] Add autofix to generate JSDoc templates

---

## v0.7.0 – File Header Enforcement

**Theme:** File-level documentation

- [ ] Implement `require-file-header` rule
- [ ] Configurable required fields (`@file`, `@author`, `@license`)
- [ ] Template-based header generation (autofix)
- [ ] Support for different header styles (JSDoc, plain, etc.)

---

## v0.8.0 – Configurable Rule Presets

**Theme:** User experience

- [ ] Create `recommended` config preset
- [ ] Create `strict` config preset
- [ ] Create `minimal` config preset
- [ ] Add plugin-wide shared settings support
- [ ] Document all rule options comprehensively

---

## v0.9.0 – Developer Tooling Integration

**Theme:** CI/CD and workflow

- [ ] Create official pre-commit hook configuration
- [ ] Create GitHub Action for PR checks
- [ ] Add configuration generator CLI (`npx lint-my-lines init`)
- [ ] Support for `.lintmylinesrc` config file
- [ ] Create ESLint flat config support

---

## v0.10.0 – Additional Language Support

**Theme:** Ecosystem expansion

- [ ] TypeScript-specific comment rules
- [ ] JSX/TSX comment handling
- [ ] Support for Vue SFC `<script>` sections
- [ ] Support for Svelte components
- [ ] Markdown code block comment scanning (optional)

---

## v0.11.0 – Advanced Analysis

**Theme:** Intelligent linting

- [ ] Stale comment detection (comment references outdated code)
- [ ] TODO/FIXME aging warnings (configurable stale threshold)
- [ ] Comment-to-code ratio metrics
- [ ] Integration with issue trackers (validate ticket IDs exist)

---

## v0.12.0 – Performance & Polish

**Theme:** Production readiness

- [ ] Performance optimization for large codebases
- [ ] Caching for repeated runs
- [ ] Parallel rule execution
- [ ] Memory usage optimization
- [ ] Comprehensive error handling and messages

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
