# Changelog

All notable changes to `eslint-plugin-lint-my-lines` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-01-03

### Added
- `no-obvious-comments` rule to detect comments that restate adjacent code
  - AST-aware analysis matches comment text against code semantics
  - Configurable `sensitivity` option (low, medium, high)
  - Skip patterns for JSDoc, TODO/FIXME/NOTE, URLs, and "why" explanations
- `ban-specific-words` rule to prevent usage of specific words/phrases
  - Default banned words including non-inclusive language (whitelist/blacklist, master/slave)
  - Configurable `bannedWords` with optional replacements and reasons
  - Autofix support when replacements are available
  - Options: `caseSensitive`, `includeDefaults`, `wholeWord`
- `require-explanation-comments` rule for complex code patterns
  - Detects regex literals, bitwise operations, ternary chains, deep nesting, recursion
  - Configurable `nestingDepth`, `ternaryChainLength`, `conditionComplexity` thresholds
  - Configurable `requireFor` option to select which patterns require comments

## [0.4.0] - 2026-01-03

### Added
- `enforce-comment-length` rule with min/max length and URL ignore options
- `enforce-capitalization` rule for sentence case with skip patterns and autofix
- `comment-spacing` rule for space after `//` and `*` with autofix

## [0.3.0] - 2026-01-03

### Added
- `no-commented-code` rule to detect and flag commented-out code
- Pattern detection for functions, classes, imports, assignments, and more
- Configurable `threshold` option for minimum code-like lines before flagging
- Configurable `allowPatterns` option for custom ignore patterns
- Error message suggesting Git alternatives (stash, branches)

### Changed
- Added smart skip patterns for JSDoc, URLs, action comments, and license headers

## [0.2.0] - 2026-01-03

### Added
- `enforce-fixme-format` rule for FIXME comment format enforcement
- `enforce-note-format` rule for NOTE comment format enforcement
- Configurable `pattern` option for all action comment rules (custom regex support)
- Autofix support for `enforce-todo-format`, `enforce-fixme-format`, and `enforce-note-format`
- Tests for new rules with valid/invalid cases and autofix output verification

### Changed
- `enforce-todo-format` now supports configurable patterns and autofix

## [0.1.0] - 2026-01-01

### Added
- Initial release
- `enforce-todo-format` rule enforcing `TODO (reference): description` format
- Comprehensive `STYLE_GUIDE.md` with 5 major sections
- `IMPLEMENTATION_PLAN.md` with project roadmap
- Mocha testing framework setup
- Initial test suite for `enforce-todo-format`

## [0.0.1] - 2025-12-28

### Added
- Project scaffold with ESLint plugin structure
- `package.json` with `eslint-plugin-lint-my-lines` naming
- Directory structure (`lib/`, `lib/rules/`, `tests/`)
- `README.md` with installation and configuration instructions
- `LICENSE` (ISC)

[Unreleased]: https://github.com/southpawriter02/lint-my-lines/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/southpawriter02/lint-my-lines/releases/tag/v0.0.1
