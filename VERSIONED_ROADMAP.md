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
| **v1.0.0** | ✅ Released | First stable release with complete documentation and npm metadata |

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

## v1.0.0 – Stable Release 🎉 (Completed) ✅

**Theme:** Production-ready release

- [x] All planned rules implemented and tested (21 rules, 376 tests)
- [x] 100% test coverage for core functionality
- [x] Complete documentation (README, STYLE_GUIDE, 21 rule docs, integration guides)
- [x] Migration guide from pre-1.0 versions (`docs/MIGRATION.md`)
- [x] Published to npm as stable
- [x] Changelog and release notes
- [x] VS Code extension compatibility verified (N/A - ESLint plugin works with VS Code ESLint extension)
- [x] Community contribution guidelines (`CONTRIBUTING.md`)

---

# Post-1.0 Roadmap

The following versions outline the planned evolution of `eslint-plugin-lint-my-lines` beyond the stable v1.0.0 release.

---

## v1.0.x – Patch Releases (Maintenance)

### v1.0.1 – Bug Fixes & Polish

**Theme:** Community feedback response

- [ ] Fix any bugs reported after v1.0.0 release
- [ ] Improve error messages based on user feedback
- [ ] Update documentation for common questions
- [ ] Add FAQ section to documentation

### v1.0.1a – Documentation Hotfix

**Theme:** Quick documentation updates

- [ ] Fix any broken links in documentation
- [ ] Add examples for edge cases
- [ ] Clarify configuration options

### v1.0.2 – Test Coverage Expansion

**Theme:** Stability improvements

- [ ] Add edge case tests identified from issues
- [ ] Improve test fixtures for multi-language scenarios
- [ ] Add integration tests for CI/CD environments
- [ ] Benchmark tests for performance regression detection

### v1.0.2a – CI/CD Compatibility

**Theme:** Pipeline improvements

- [ ] Verify compatibility with GitHub Actions latest runners
- [ ] Add GitLab CI templates to documentation
- [ ] Test with Bitbucket Pipelines

### v1.0.3 – ESLint v9 Optimization

**Theme:** Modern ESLint support

- [ ] Optimize flat config performance
- [ ] Add type definitions for TypeScript configs
- [ ] Improve ESLint v9 cache compatibility

---

## v1.1.x – Enhanced Rule Options

### v1.1.0 – Rule Flexibility

**Theme:** Configurable rules

- [ ] Add `severity` option to all rules (allow warnings vs errors per-rule)
- [ ] Add `exclude` patterns for file-level rule disabling
- [ ] Add `include` patterns for targeted rule application
- [ ] Implement rule inheritance from parent configs

### v1.1.0a – Preset Customization

**Theme:** Flexible presets

- [ ] Allow preset extension with overrides
- [ ] Add `preset: "recommended+strict"` combination syntax
- [ ] Document preset composition patterns

### v1.1.1 – Comment Context Rules

**Theme:** Smart context detection

- [ ] Add option to detect comments in test files differently
- [ ] Add option for generated file detection
- [ ] Add option for minified file exclusion
- [ ] Improve detection of documentation vs inline comments

### v1.1.2 – Ignore Patterns

**Theme:** Fine-grained control

- [ ] Add `ignoreUrls` option to more rules
- [ ] Add `ignoreCodeBlocks` for markdown-in-comments
- [ ] Add `ignoreRegex` for custom pattern exclusions
- [ ] Add `ignorePaths` for directory-level exclusions

---

## v1.2.x – New Rule Categories

### v1.2.0 – Accessibility Comments

**Theme:** Inclusive development

- [ ] New rule: `require-alt-text-comments` - suggest comments for complex UI
- [ ] New rule: `accessibility-todo-format` - track a11y improvements
- [ ] New rule: `screen-reader-context` - explain non-obvious UI behavior
- [ ] Add accessibility preset

### v1.2.0a – Accessibility Documentation

**Theme:** Accessibility support

- [ ] Add WCAG reference links to rule docs
- [ ] Document accessibility best practices for comments
- [ ] Add examples from popular accessible codebases

### v1.2.1 – Security Comments

**Theme:** Security awareness

- [ ] New rule: `security-todo-format` - track security improvements
- [ ] New rule: `sensitive-data-warning` - flag comments containing secrets
- [ ] New rule: `require-security-review-comment` - enforce review markers
- [ ] Add security preset

### v1.2.2 – Performance Comments

**Theme:** Performance documentation

- [ ] New rule: `performance-todo-format` - track performance TODOs
- [ ] New rule: `complexity-explanation` - require comments for O(n²)+ algorithms
- [ ] New rule: `big-o-annotation` - suggest complexity comments
- [ ] Add performance preset

---

## v1.3.x – External Integrations

### v1.3.0 – GitHub Integration

**Theme:** GitHub-native features

- [ ] GitHub Actions output format with annotations
- [ ] PR comment integration (summary of issues)
- [ ] Issue auto-creation for stale TODOs
- [ ] GitHub Checks API integration

### v1.3.0a – GitHub Configuration

**Theme:** GitHub setup

- [ ] Add `.github/lint-my-lines.yml` configuration support
- [ ] GitHub App authentication for issue tracker
- [ ] GitHub Actions reusable workflow

### v1.3.1 – Jira Integration

**Theme:** Enterprise issue tracking

- [ ] Full Jira Cloud API integration
- [ ] Jira Server/Data Center support
- [ ] JQL-based ticket validation
- [ ] Sprint-aware TODO aging

### v1.3.1a – Jira Advanced

**Theme:** Jira power features

- [ ] Custom field support for ticket validation
- [ ] Jira automation triggers
- [ ] Confluence documentation linking

### v1.3.2 – Linear Integration

**Theme:** Modern issue tracking

- [ ] Full Linear API integration
- [ ] Cycle-aware TODO aging
- [ ] Linear project/team scoping
- [ ] Linear webhook support

### v1.3.3 – Slack/Discord Notifications

**Theme:** Team communication

- [ ] Slack webhook for stale TODO reports
- [ ] Discord webhook integration
- [ ] Daily/weekly digest options
- [ ] Per-channel routing based on file paths

---

## v1.4.x – IDE Extensions

### v1.4.0 – VS Code Extension

**Theme:** First-party VS Code support

- [ ] Native VS Code extension (not just ESLint integration)
- [ ] Real-time comment quality indicators
- [ ] Quick-fix actions with previews
- [ ] Comment templates and snippets

### v1.4.0a – VS Code Configuration

**Theme:** VS Code customization

- [ ] Settings UI for rule configuration
- [ ] Workspace-specific settings
- [ ] Color customization for indicators

### v1.4.1 – JetBrains Plugin

**Theme:** IntelliJ platform support

- [ ] WebStorm/IntelliJ IDEA plugin
- [ ] Live inspection integration
- [ ] Quick-fix intentions
- [ ] Settings panel integration

### v1.4.2 – Neovim Plugin

**Theme:** Terminal editor support

- [ ] Neovim native plugin (Lua)
- [ ] LSP integration
- [ ] Telescope picker for comment issues
- [ ] Virtual text annotations

---

## v1.5.x – Advanced Analysis

### v1.5.0 – Comment Quality Scoring

**Theme:** Quantitative analysis

- [ ] Per-file comment quality score (0-100)
- [ ] Project-wide comment health dashboard
- [ ] Trend tracking over time
- [ ] Quality thresholds with CI blocking

### v1.5.0a – Scoring Configuration

**Theme:** Customizable metrics

- [ ] Weight configuration for different rule categories
- [ ] Custom scoring formulas
- [ ] Team benchmarks

### v1.5.1 – Comment Duplication Detection

**Theme:** DRY comments

- [ ] New rule: `no-duplicate-comments` - detect copy-pasted comments
- [ ] Cross-file duplication detection
- [ ] Similar comment clustering
- [ ] Suggest consolidation opportunities

### v1.5.2 – Stale Comment Detection v2

**Theme:** Intelligent staleness

- [ ] Git blame integration for comment age
- [ ] Code change detection near comments
- [ ] Automated "needs review" flagging
- [ ] Comment-to-code drift detection

### v1.5.3 – Documentation Coverage

**Theme:** Coverage metrics

- [ ] JSDoc coverage percentage
- [ ] Public API documentation enforcement
- [ ] Coverage reports for CI
- [ ] Coverage trend tracking

---

## v1.6.x – Multi-Language Expansion

### v1.6.0 – Python Support

**Theme:** Python ecosystem

- [ ] Python docstring linting
- [ ] PEP 257 compliance checking
- [ ] Sphinx/NumPy/Google docstring formats
- [ ] Python-specific TODO patterns

### v1.6.0a – Python Integration

**Theme:** Python tooling

- [ ] Integration with Pylint
- [ ] Pre-commit hook for Python
- [ ] pyproject.toml configuration

### v1.6.1 – Go Support

**Theme:** Go ecosystem

- [ ] Go doc comment linting
- [ ] Godoc format enforcement
- [ ] Go-specific comment patterns
- [ ] Integration with golangci-lint

### v1.6.2 – Rust Support

**Theme:** Rust ecosystem

- [ ] Rust doc comment linting
- [ ] Rustdoc format enforcement
- [ ] `///` vs `//!` comment checking
- [ ] Cargo integration

### v1.6.3 – Java/Kotlin Support

**Theme:** JVM languages

- [ ] Javadoc linting
- [ ] KDoc linting for Kotlin
- [ ] Android-specific patterns
- [ ] Gradle/Maven integration

---

## v1.7.x – AI-Powered Features

### v1.7.0 – AI Comment Suggestions

**Theme:** Intelligent assistance

- [ ] AI-powered comment improvement suggestions
- [ ] Context-aware comment generation hints
- [ ] Natural language quality checking
- [ ] Configurable AI providers (OpenAI, Anthropic, local)

### v1.7.0a – AI Configuration

**Theme:** AI customization

- [ ] API key configuration
- [ ] Model selection
- [ ] Prompt customization
- [ ] Privacy/offline mode

### v1.7.1 – Automatic Documentation

**Theme:** Doc generation

- [ ] Auto-generate JSDoc from function signatures
- [ ] README section generation
- [ ] API documentation scaffolding
- [ ] Changelog entry suggestions

### v1.7.2 – Semantic Analysis

**Theme:** Deep understanding

- [ ] Comment-to-code relevance scoring
- [ ] Outdated comment detection via semantic comparison
- [ ] Suggested comment updates when code changes
- [ ] Technical debt estimation

---

## v1.8.x – Enterprise Features

### v1.8.0 – Team Presets

**Theme:** Organization-wide standards

- [ ] Shared preset publishing (npm/private registry)
- [ ] Preset versioning and updates
- [ ] Team-specific rule bundles
- [ ] Central configuration management

### v1.8.1 – Compliance Reporting

**Theme:** Audit and compliance

- [ ] SARIF output format for security tools
- [ ] Compliance report generation (PDF/HTML)
- [ ] Audit trail for comment changes
- [ ] SOC2/ISO compliance helpers

### v1.8.2 – Multi-Repo Support

**Theme:** Monorepo and multi-repo

- [ ] Cross-repo TODO tracking
- [ ] Shared configuration inheritance
- [ ] Workspace-aware presets
- [ ] Centralized dashboard for multiple repos

---

## v2.0.0 – Next Generation (Future Major)

**Theme:** Breaking changes for the future

- [ ] ESLint v10 exclusive support
- [ ] Drop Node.js 18 support (Node 20+ only)
- [ ] New rule API with enhanced capabilities
- [ ] Plugin architecture for community extensions
- [ ] GraphQL API for integrations
- [ ] Real-time collaborative linting

---

## Version Timeline (Projected)

| Version | Target | Focus Area |
|---------|--------|------------|
| v1.0.x | Q1 2026 | Maintenance & bug fixes |
| v1.1.x | Q1 2026 | Enhanced rule options |
| v1.2.x | Q2 2026 | New rule categories |
| v1.3.x | Q2-Q3 2026 | External integrations |
| v1.4.x | Q3 2026 | IDE extensions |
| v1.5.x | Q3-Q4 2026 | Advanced analysis |
| v1.6.x | Q4 2026 | Multi-language expansion |
| v1.7.x | Q1 2027 | AI-powered features |
| v1.8.x | Q2 2027 | Enterprise features |
| v2.0.0 | Q4 2027 | Next generation |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this roadmap and the project.

### Proposing New Features

1. Open a GitHub issue with the `enhancement` label
2. Describe the use case and expected behavior
3. Reference this roadmap if applicable
4. Community voting helps prioritize features

### Version Numbering

- **Major (x.0.0)**: Breaking changes, major new features
- **Minor (1.x.0)**: New features, backward compatible
- **Patch (1.0.x)**: Bug fixes, documentation updates
- **Sub-patch (1.0.1a)**: Hotfixes, quick documentation updates
