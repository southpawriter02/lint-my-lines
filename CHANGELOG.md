# Changelog

All notable changes to `eslint-plugin-lint-my-lines` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-03

### Summary

First stable release of `eslint-plugin-lint-my-lines`!

### Highlights

- 21 production-ready rules for comment quality enforcement
- Complete documentation for all rules and integration guides
- Performance optimizations with intelligent caching (30-50% faster)
- Multi-language support (TypeScript, Vue, Svelte, Markdown)
- Configuration presets (minimal, recommended, strict, analysis)
- CLI tool for easy project setup (`npx lint-my-lines init`)

### Added

- `CONTRIBUTING.md` - Community contribution guidelines
- `docs/MIGRATION.md` - Version upgrade documentation
- Complete npm publishing metadata (repository, bugs, homepage)
- Author information in package.json

### Changed

- License field in package.json updated from ISC to MIT (matching LICENSE file)
- Version bumped to 1.0.0 for stable release

### No Breaking Changes

All APIs are stable from v0.12.x. No configuration changes required when upgrading.

## [0.12.1] - 2026-01-03

### Fixed
- Code quality issues identified by ESLint static analysis:
  - Removed unused imports and variables across rule files
  - Fixed unnecessary escape characters in regex patterns
  - Added proper block scoping for case statements with lexical declarations
  - CLI `init` command now properly uses `generateFlatConfigCJS` for CommonJS projects
  - Svelte processor now uses predefined regex patterns consistently

### Added
- ESLint configuration (`.eslintrc.js`) for project linting
- GitHub Actions workflow now runs ESLint checks

## [0.12.0] - 2026-01-03

### Added
- Performance optimization utilities:
  - `lib/utils/performance-cache.js` - LRU caching infrastructure with configurable max sizes
  - `lib/utils/comment-utils.js` - Shared comment processing with caching
  - `lib/utils/ast-utils.js` - Optimized AST traversal utilities
  - `lib/utils/error-utils.js` - Safe regex compilation and option validation
- Performance documentation (`docs/PERFORMANCE_GUIDE.md`)
- Cache size limits for issue tracker validation (max 1000 entries)
- `clearCaches()` export for testing and cache management

### Changed
- High-impact rules now use cached comment collection (30-50% faster):
  - `no-obvious-comments`
  - `stale-comment-detection`
  - `ban-specific-words`
  - `valid-jsdoc`
- JSDoc parsing is cached across rules via `parseJSDocCached()`
- Date parsing uses quick-check pattern for early rejection
- Regex patterns are compiled once and cached (LRU with max 200 entries)
- Issue tracker cache now has LRU eviction to prevent unbounded growth

### Fixed
- Missing environment variables now show actionable suggestions
- Issue tracker cache no longer grows unbounded in long-running processes

## [0.11.0] - 2026-01-03

### Added
- Advanced Analysis rules:
  - `stale-comment-detection` - Detect comments referencing non-existent code identifiers
    - Conservative detection: only flags backtick-quoted references
    - Configurable `ignorePatterns` and `minIdentifierLength`
  - `todo-aging-warnings` - Warn on old TODO/FIXME comments with dates
    - Parses dates from `TODO (author, YYYY-MM-DD): description` format
    - Supports ISO, US, European, and written date formats
    - Configurable `maxAgeDays` (30 default) and `criticalAgeDays` (90 default)
  - `comment-code-ratio` - Report under/over-documented files
    - Configurable `minRatio` (5%) and `maxRatio` (40%)
    - Options to `excludeJSDoc` and `excludeTodo` from calculation
  - `issue-tracker-integration` - Validate ticket IDs exist in issue trackers
    - Supports GitHub, Jira, GitLab, Linear, and custom APIs
    - Environment variable support for tokens (`$GITHUB_TOKEN` syntax)
    - In-memory caching with configurable TTL
    - Options: `allowClosed`, `warnOnClosed`, `offline` mode
- New utilities:
  - `lib/utils/date-utils.js` - Date parsing for comment aging analysis
  - `lib/utils/issue-tracker-client.js` - HTTP clients for issue trackers
- New preset: `analysis` / `flat/analysis` for advanced analysis rules
- Documentation for all new rules in `docs/rules/`

### Dependencies
- No new dependencies (uses Node's built-in `https` module for API requests)

## [0.10.0] - 2026-01-03

### Added
- TypeScript support:
  - `valid-tsdoc` rule for TSDoc-specific validation (`@typeParam`, `@remarks`, `@beta`, etc.)
  - `typescript` and `typescript-strict` configuration presets
  - TSDoc utility functions in `lib/utils/jsdoc-utils.js`
- JSX/TSX support:
  - JSX-aware autofix for TODO/FIXME/NOTE rules (uses block comments in JSX expressions)
  - `react` configuration preset
- Vue SFC support:
  - `.vue` processor for template HTML comments extraction
  - `vue-template-comments` rule for linting `<!-- -->` comments in templates
  - `vue` configuration preset
- Svelte support:
  - `.svelte` processor for markup HTML comments extraction
  - `svelte-template-comments` rule for linting `<!-- -->` comments in markup
  - `svelte` configuration preset
- Markdown support:
  - `.md` processor for fenced code block extraction
  - Supports js, javascript, ts, typescript, jsx, tsx, mjs, cjs language hints
  - `markdown` configuration preset
- Documentation for new rules (`docs/rules/valid-tsdoc.md`, `vue-template-comments.md`, `svelte-template-comments.md`)
- Language support section in README and Integration Guide

### Changed
- `enforce-todo-format`, `enforce-fixme-format`, `enforce-note-format` now detect JSX context for proper autofix

### Dependencies
- Added optional peer dependencies: `@typescript-eslint/parser`, `vue-eslint-parser`, `svelte-eslint-parser`

## [0.9.0] - 2026-01-03

### Added
- ESLint flat config support (v9+) with new config names:
  - `flat/minimal`, `flat/recommended`, `flat/strict`
- Configuration generator CLI: `npx lint-my-lines init`
  - `--preset` flag to select minimal, recommended, or strict
  - `--flat` / `--no-flat` flags to choose config format
  - Detects existing ESLint config and provides merge instructions
  - Reads `.lintmylinesrc` for project-specific overrides
- `.lintmylinesrc` / `.lintmylinesrc.json` config file support
  - Define preset and rule overrides for project-wide defaults
  - Also supports `lintmylines` key in `package.json`
- GitHub Actions workflow template (`.github/workflows/lint-comments.yml`)
- Comprehensive integration guide (`docs/INTEGRATION_GUIDE.md`)
  - Pre-commit hooks setup (Husky, lint-staged, pre-commit framework)
  - CI/CD examples (GitHub Actions, GitLab CI, CircleCI)
  - Editor integration (VS Code, WebStorm, Vim/Neovim)
  - Monorepo configurations
- Updated README with CLI quick start and integration section

### Dependencies
- Added `commander` for CLI argument parsing

## [0.8.0] - 2026-01-03

### Added
- Configuration presets for easy adoption:
  - `plugin:lint-my-lines/minimal` - Essential comment hygiene (4 rules)
  - `plugin:lint-my-lines/recommended` - Balanced defaults (8 rules)
  - `plugin:lint-my-lines/strict` - Maximum enforcement (14 rules)
- Comprehensive documentation for all rules in `docs/rules/`
  - enforce-todo-format, enforce-fixme-format, enforce-note-format
  - enforce-comment-length, enforce-capitalization, comment-spacing
  - no-commented-code, no-obvious-comments, ban-specific-words
  - require-explanation-comments
- Updated README with preset usage examples and complete rule reference

### Changed
- Reorganized `lib/index.js` to export both `rules` and `configs`

## [0.7.0] - 2026-01-03

### Added
- `require-file-header` rule to enforce file header comments
  - Supports JSDoc (`/** */`), block (`/* */`), and line (`//`) comment styles
  - Configurable `requiredTags` option to specify required tags (default: `["@file"]`)
  - Common tags: `@file`, `@fileoverview`, `@author`, `@license`, `@copyright`
  - `allowShebang` option allows `#!/usr/bin/env node` before header (default: `true`)
  - `maxLinesBeforeHeader` option to allow blank lines before header (default: `0`)
  - Custom `template` option with placeholders: `{filename}`, `{date}`, `{year}`, `{author}`
  - Autofix generates header from template based on configured style
- Documentation for require-file-header rule

## [0.6.0] - 2026-01-03

### Added
- `require-jsdoc` rule to enforce JSDoc comments on exported functions
  - Detects named exports (`export function`), default exports, and CommonJS exports (`module.exports`)
  - Configurable for FunctionDeclaration, ArrowFunctionExpression, FunctionExpression, ClassDeclaration, and MethodDefinition
  - Options: `exemptEmptyFunctions` to skip functions with empty bodies, `minLineCount` to only require JSDoc for longer functions
  - Autofix generates JSDoc templates with `@param` for each parameter and `@returns` for functions that return values
  - Handles rest parameters (`...args`) and default parameters as optional `[param]`
- `valid-jsdoc` rule to validate JSDoc content matches function signatures
  - Validates `@param` tags match function parameter names
  - Validates `@param` order matches function signature order
  - Validates `@returns` presence for functions that return values
  - Detects duplicate `@param` tags for the same parameter
  - Options: `requireParamType`, `requireReturnType`, `requireParamDescription`, `requireReturnDescription`, `checkParamNames`, `checkParamOrder`
  - Autofix adds missing `@param` and `@returns` tags
- `jsdoc-type-syntax` rule to enforce consistent type syntax in JSDoc
  - Enforces TypeScript-style lowercase types (`string`, `number`, `boolean`) by default
  - Option `prefer: "jsdoc"` to enforce capitalized types (`String`, `Number`, `Boolean`)
  - Custom type mappings via `typeMap` option (e.g., `{"int": "number"}`)
  - Handles complex types: generics (`Array<String>`), unions (`String|Number`), nullable (`?String`)
  - Autofix replaces type names automatically
- Shared JSDoc utilities module at `lib/utils/jsdoc-utils.js`
  - Functions: `isJSDocComment`, `parseJSDoc`, `getJSDocComment`, `hasJSDocComment`, `getFunctionParams`, `functionReturnsValue`, `getIndentation`, `generateJSDocTemplate`
- Documentation for all new rules in `docs/rules/` directory

### Dependencies
- Added `comment-parser` library for robust JSDoc parsing

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

[Unreleased]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.12.1...v1.0.0
[0.12.1]: https://github.com/southpawriter02/lint-my-lines/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/southpawriter02/lint-my-lines/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/southpawriter02/lint-my-lines/releases/tag/v0.0.1
