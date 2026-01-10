# Changelog

All notable changes to `eslint-plugin-lint-my-lines` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0a] - 2026-01-10

### Added

- **Accessibility Documentation** (v1.2.0a)
  - Comprehensive documentation for all three accessibility rules with WCAG references
  - New `docs/ACCESSIBILITY_GUIDE.md` - Complete accessibility comment guide:
    - WCAG Quick Reference organized by POUR principles (Perceivable, Operable, Understandable, Robust)
    - 8+ comment patterns by accessibility scenario (decorative images, icon buttons, modals, etc.)
    - Real-world examples from popular accessible component libraries
  - New rule documentation files:
    - `docs/rules/accessibility-todo-format.md` - A11Y-TODO format with WCAG references
    - `docs/rules/require-alt-text-comments.md` - Alt text documentation patterns
    - `docs/rules/screen-reader-context.md` - Screen reader behavior documentation

- **WCAG Reference Integration**
  - All accessibility rule docs include WCAG reference tables with direct links to w3.org
  - References: WCAG 1.1.1, 1.3.1, 1.4.3, 1.4.5, 2.1.1, 2.4.7, 4.1.2, 4.1.3
  - Guidelines organized by success criterion

- **Real-World Pattern Examples**
  - Patterns from Material-UI, Chakra UI, Radix UI, React Aria, Headless UI
  - Examples for: modals/dialogs, accordions, toast notifications, form validation, navigation menus, skip links, tab panels

### Changed

- Updated README.md:
  - Rule count updated from 21 to 24
  - Added Accessibility Rules section with links to rule docs
  - Added `accessibility` preset to presets table
  - Added link to ACCESSIBILITY_GUIDE.md

- Updated docs/INTEGRATION_GUIDE.md:
  - Added Accessibility section under Language Support
  - Configuration examples for `flat/accessibility` preset
  - JSX/React accessibility comment patterns

### Documentation

- Theme: Accessibility support
- Helps teams document WCAG compliance in code
- Provides patterns for React, Vue, and Svelte accessibility comments

## [1.2.0] - 2026-01-09

### Added

- **Accessibility Comment Rules** (v1.2.0)
  - New `require-alt-text-comments` rule - Requires comments for complex UI elements (icons, images, buttons without visible text) explaining their accessibility purpose
  - New `accessibility-todo-format` rule - Enforces standardized format for accessibility TODOs: `A11Y-TODO (reference): description`
  - New `screen-reader-context` rule - Requires explanatory comments for UI patterns that behave differently for screen readers (aria-hidden, role="presentation", negative tabindex, aria-live regions, visually hidden elements)

- **New Configuration Preset**
  - `flat/accessibility` - Bundle of all accessibility-focused comment rules with sensible defaults

- **TypeScript Types**
  - New `RequireAltTextCommentsOptions` interface
  - New `AccessibilityTodoFormatOptions` interface
  - New `ScreenReaderContextOptions` interface
  - Added `flat/accessibility` to `FlatConfigPreset` and `Configs` types

### Rule Details

#### `require-alt-text-comments`
- Detects JSX elements: `<img>`, `<svg>`, `<Icon>`, `<button>` without visible text
- Configurable icon component patterns (default: Icon$, Ico$, ^Icon, ^Svg)
- Option to require comments for elements with aria-label
- Option to require comments for decorative images (empty alt)
- Minimum comment length validation

#### `accessibility-todo-format`
- Enforces format: `A11Y-TODO (WCAG-X.X.X): description` or `A11Y-TODO (TICKET-XXX): description`
- Supports both A11Y-TODO and ALLY-TODO prefixes
- Optional enforcement of WCAG guideline references
- Auto-fix capability

#### `screen-reader-context`
- Checks for: aria-hidden="true", role="presentation/none", negative tabindex, aria-live regions
- Detects visually hidden classes: sr-only, visually-hidden, etc.
- Configurable checks (can disable specific detections)
- Minimum explanation length validation

### Developer Experience

- Theme: Inclusive development
- Helps teams document UI components for users with disabilities
- Supports WCAG compliance documentation
- Ideal for React/Vue/Svelte applications with complex UI

## [1.1.2] - 2026-01-08

### Added

- **Ignore Pattern Options** (v1.1.2)
  - New shared utility functions in `lib/utils/comment-utils.js`:
    - `isInsideUrl(text, position)` - Check if position is inside a URL
    - `stripUrls(text)` - Remove URLs from text
    - `isInsideCodeBlock(text, position)` - Check if position is inside markdown code block
    - `isInsideInlineCode(text, position)` - Check if position is inside inline code
    - `stripCodeBlocks(text)` - Remove markdown code blocks from text
    - `stripInlineCode(text)` - Remove inline code from text
    - `applyIgnoreRegex(text, pattern)` - Apply custom regex to strip content
    - `processTextWithIgnores(text, options)` - Combined ignore processing

- **New Rule Options**
  - `enforce-comment-length`: Added `ignoreCodeBlocks`, `ignoreRegex` options
  - `enforce-capitalization`: Added `ignoreUrls`, `ignoreCodeBlocks`, `ignoreRegex` options
  - `ban-specific-words`: Added `ignoreUrls`, `ignoreCodeBlocks`, `ignoreInlineCode`, `ignoreRegex` options (formalized existing behavior)
  - `no-obvious-comments`: Added `ignoreUrls`, `ignoreCodeBlocks`, `ignoreRegex` options
  - `require-explanation-comments`: Added `ignoreRegex` option
  - `stale-comment-detection`: Added `ignoreRegex` option

- **TypeScript Types**
  - New `IgnoreOptions` interface in `types/index.d.ts`
  - Updated rule option interfaces with new ignore properties

- **Documentation**
  - New `docs/IGNORE_PATTERNS.md` comprehensive guide

- **Tests**
  - New `tests/lib/utils/comment-utils.test.js` with 46 tests for utility functions

### Changed

- Refactored `ban-specific-words` to use shared utility functions instead of inline implementations
- All ignore options default to `true` for better out-of-box experience
- URL and code block handling is now consistent across all applicable rules

### Developer Experience

- Fine-grained control over what content is analyzed
- Reduced false positives from URLs and code examples in comments
- Custom pattern exclusion via `ignoreRegex` option
- Path-based exclusions documented using ESLint's native configuration

## [1.1.1] - 2026-01-08

### Added

- **Comment Context Detection** (`lib/utils/comment-context-utils.js`)
  - New utility for enhanced comment classification and purpose detection
  - Functions for detecting documentation vs inline comments
  - `hasWhyIndicator()` - Detect explanatory comments (because, workaround, etc.)
  - `isDocumentationComment()`, `isInlineComment()` - Comment type classification
  - `getCommentPurpose()` - Classify as documentation, explanation, todo, directive, or noise
  - `shouldSkipByContext()` - Context-aware comment filtering
  - Shared `COMMENT_CONTEXT_SCHEMA` for rule option validation

- **File Context Detection** (`lib/utils/file-context-utils.js`)
  - New utility for detecting file types based on filename patterns
  - `isTestFile()` - Detect test files (*.test.js, *.spec.ts, __tests__/*, etc.)
  - `isGeneratedFile()` - Detect generated files (dist/*, build/*, *.d.ts, etc.)
  - `isMinifiedFile()` - Detect minified files (*.min.js, *.bundle.js, etc.)
  - `detectFileContext()` - Get full file context classification
  - `hasGeneratedMarker()` - Detect generated file markers in content
  - Glob pattern helpers for ESLint config: `getTestFileGlobs()`, `getGeneratedFileGlobs()`, `getMinifiedFileGlobs()`

- **New Configuration Presets** (`lib/configs/flat-config-factory.js`)
  - `flat/test-files` - Relaxed rules for test files (all lint-my-lines rules off)
  - `flat/generated` - Rules disabled for generated files
  - `flat/minified` - Rules disabled for minified files
  - Presets automatically apply to matching file patterns

- **New Rule Option: `commentContext`**
  - Added to `no-obvious-comments`, `enforce-comment-length`, `enforce-capitalization`, `ban-specific-words`, `require-explanation-comments`
  - Options:
    - `documentationComments`: "strict" | "normal" | "skip" - How to handle JSDoc/doc comments
    - `inlineComments`: "strict" | "normal" | "skip" - How to handle inline comments
  - Allows skipping documentation comments or applying stricter rules to inline comments

- **Enhanced Comment Classification** (`lib/utils/comment-utils.js`)
  - New properties in `classifyComment()`:
    - `isFileHeader` - Detect file header comments (@file, @fileoverview)
    - `isCopyright` - Detect copyright/license comments
    - `isBlock` - Whether comment is a block comment
    - `isLine` - Whether comment is a line comment

- **New Caches** (`lib/utils/performance-cache.js`)
  - `fileContextCache` (WeakMap) - Cache file context per sourceCode object
  - `commentContextCache` (LRU, 300 entries) - Cache enhanced comment classification

- **TypeScript Types** (`types/index.d.ts`)
  - `CommentContextOptions` interface for rule configuration
  - `FileContext` interface for file type detection results
  - `CommentPurpose` type for comment classification
  - `EnhancedCommentClassification` interface
  - `EnforceCapitalizationOptions` interface
  - Updated rule option interfaces with `commentContext` property
  - New preset types: `flat/test-files`, `flat/generated`, `flat/minified`

- **New Tests**
  - `tests/lib/utils/file-context-utils.test.js` - File context detection tests
  - `tests/lib/utils/comment-context-utils.test.js` - Comment context detection tests

### Changed

- Rules now use `getAllCommentsCached()` consistently for better performance
- `no-obvious-comments` defaults to skipping documentation comments
- `require-explanation-comments` now supports context-aware meaningful comment detection

### Developer Experience

- Smarter rule behavior based on file and comment context
- Reduced false positives for documentation comments
- Easy opt-out of rules for test/generated/minified files via presets
- Fine-grained control over how rules treat different comment types

## [1.1.0] - 2026-01-08

### Added

- **Configuration Helper Utilities** (`lib/utils/config-helpers.js`)
  - New utility functions for flexible ESLint flat config configuration:
    - `createConfigForFiles(preset, patterns)` - Apply a preset only to specific files (include pattern)
    - `createConfigWithExclude(preset, patterns)` - Exclude specific files from a preset
    - `extendPreset(preset, overrides)` - Extend a preset with custom rule overrides (inheritance)
    - `createSeverityVariants(preset)` - Generate warn/error variants for dev vs production
    - `mergeConfigs(...configs)` - Merge multiple configs with proper precedence
    - `createFileTypePreset(options)` - Create file-type-specific presets
  - Available via subpath import: `eslint-plugin-lint-my-lines/helpers`
  - Also re-exported from main package for convenience

- **Preset Inheritance Chain** (`lib/configs/flat-config-factory.js`)
  - `PRESET_INHERITANCE` constant documenting preset relationships
  - `getPresetInheritanceChain(presetName)` function to get full inheritance path
  - Clear hierarchy: minimal -> recommended -> strict, with language-specific extensions

- **TypeScript Types for Helpers** (`types/helpers.d.ts`)
  - Full type definitions for all helper functions
  - Interfaces: `ExtendPresetOptions`, `SeverityVariants`, `FileTypePresetOptions`
  - Added to main types (`types/index.d.ts`) as well

- **New Documentation**
  - Configuration Helpers Guide (`docs/CONFIG_HELPERS.md`)
    - Complete reference for all helper functions
    - Common usage patterns (monorepo, environment-specific, team presets)
    - TypeScript examples
    - Preset inheritance diagram

- **New Test Suite**
  - Comprehensive tests for config helpers (`tests/lib/utils/config-helpers.test.js`)
  - New test script: `npm run test:config-helpers`

### Changed

- **Package Configuration**
  - Version bumped to 1.1.0
  - Added subpath export: `./helpers` for config helper utilities
  - New keyword: `config-helpers`

### Developer Experience

- Easier customization of presets without manual object spreading
- Environment-aware configurations (dev vs CI) with single function call
- Clear patterns for monorepo and multi-language projects
- Type-safe configuration with full IntelliSense support

## [1.0.3] - 2026-01-08

### Added

- **ESLint v9 Full Support**
  - Complete compatibility with ESLint v9 flat config system
  - Version detection utilities (`lib/utils/eslint-compat.js`)
    - `isESLintV9()`, `isESLintV8()` - Check installed ESLint version
    - `getESLintVersion()`, `getESLintMajorVersion()` - Get version info
    - `createESLintInstance()` - Create version-appropriate ESLint instance
  - Optimized flat config factory (`lib/configs/flat-config-factory.js`)
    - Singleton pattern for config caching (faster cold starts)
    - Frozen configs to prevent accidental mutation
    - Debug logging for troubleshooting
  - ESLint v9 cache integration (`lib/utils/cache-integration.js`)
    - `getCacheConfig()` - Get version-appropriate cache options
    - `generateCacheKey()` - Generate cache keys for preset isolation
    - `getCacheStats()` - Get cache statistics for debugging
    - Support for ESLint v9 cache strategies (metadata/content)

- **TypeScript Type Definitions**
  - Complete type definitions in `types/index.d.ts`
  - Full IntelliSense support for:
    - All 21 rule options with detailed documentation
    - Configuration presets (flat and legacy)
    - Plugin API (`rules`, `configs`, `processors`, `meta`)
  - Compatible with `eslint.config.ts` TypeScript config files

- **Debug Logging System**
  - Structured logging utilities (`lib/utils/debug.js`)
  - Environment variable control: `DEBUG_LINT_MY_LINES=1`
  - Category-based filtering: `DEBUG_LINT_MY_LINES=config,cache`
  - Categories: config, cache, rules, cli, eslint-compat, factory

- **Plugin Metadata**
  - Added `meta` export with plugin name and version
  - Compatible with ESLint v9 config inspector

- **New Documentation**
  - ESLint v9 Migration Guide (`docs/ESLINT_V9_MIGRATION.md`)
    - Step-by-step migration from ESLint v8 to v9
    - Flat config examples and patterns
    - Troubleshooting common issues
    - TypeScript configuration examples

- **New Test Infrastructure**
  - ESLint compatibility tests (`tests/eslint-compat/eslint-v9.test.js`)
  - CI matrix testing with ESLint v8 and v9
  - New test script: `npm run test:eslint-compat`

### Changed

- **Package Configuration**
  - ESLint peer dependency updated: `^8.56.0 || ^9.0.0`
  - Node.js engine requirement: `>=18.18.0` (for ESLint v9)
  - Added TypeScript types field and exports
  - New keywords: `eslint9`, `flat-config`

- **CLI Improvements**
  - `lib/cli/lint.js` now uses ESLint compat utilities
  - Version-appropriate ESLint instance creation
  - Debug logging for troubleshooting

- **GitHub Actions**
  - Test workflow now includes ESLint v8/v9 matrix
  - Separate ESLint v9 integration test job
  - Shows ESLint version in CI output

### Performance

- Flat config creation is cached (singleton pattern)
- First import: ~5ms, subsequent imports: <0.1ms
- Configs are frozen to prevent repeated object creation

## [1.0.2a] - 2026-01-08

### Added

- **Standalone Binary Distribution**
  - New `lint` CLI command for direct linting without ESLint configuration
    - `lint-my-lines lint` - Lint current directory with recommended preset
    - `lint-my-lines lint --preset strict` - Use different presets
    - `lint-my-lines lint --fix` - Auto-fix issues
    - `lint-my-lines lint --format json` - Output as JSON
  - Cross-platform pre-built binaries (no Node.js required):
    - Windows: `lint-my-lines-win-x64.exe`
    - macOS (Intel): `lint-my-lines-macos-x64`
    - macOS (Apple Silicon): `lint-my-lines-macos-arm64`
    - Linux: `lint-my-lines-linux-x64`
  - GitHub Actions release workflow (`.github/workflows/release.yml`)
    - Automated binary builds on version tags
    - Publishes to GitHub Releases

- **New Files**
  - `lib/cli/lint.js` - ESLint wrapper for standalone linting
  - `tests/integration/lint-command.test.js` - Tests for lint command

### Changed

- Updated README.md with standalone binary usage instructions
- Added build scripts to `package.json`:
  - `build` - Build for current platform
  - `build:all` - Build for all platforms
  - `build:linux`, `build:macos`, `build:macos-arm`, `build:windows`

### Dependencies

- Added `pkg` as dev dependency for binary bundling

## [1.0.2] - 2026-01-08

### Added

- **Test Infrastructure Improvements**
  - GitHub Actions CI/CD workflow (`.github/workflows/test.yml`)
    - Node.js version matrix testing (18, 20, 22)
    - Separate jobs for unit tests, parser-specific tests, and integration tests
  - New test scripts in `package.json`:
    - `test:rules` - Run only rule tests
    - `test:utils` - Run only utility tests
    - `test:integration` - Run integration tests
    - `test:parsers` - Run parser-specific tests (Vue/Svelte)
    - `test:all` - Run unit + integration tests
    - `bench` - Run performance benchmarks
    - `bench:check` - Check for performance regressions

- **New Test Files**
  - `tests/lib/rules/vue-template-comments.js` - 25+ test cases for Vue template HTML comments
  - `tests/lib/rules/svelte-template-comments.js` - 20+ test cases for Svelte template HTML comments
  - `tests/integration/eslint-integration.test.js` - ESLint API integration tests
    - Flat config and legacy config support
    - Autofix verification
    - Multi-rule interaction tests
    - Preset configuration validation
  - `tests/integration/cli.test.js` - CLI command tests
    - `lint-my-lines init` with various presets
    - ESM/CJS project detection
    - `--no-flat` flag behavior
  - `tests/benchmarks/performance.bench.js` - Performance benchmark suite
  - `tests/benchmarks/check-regression.js` - Regression detection script (20% threshold)

- **Test Fixtures**
  - `tests/fixtures/perf/small.js` - 50-line test fixture
  - `tests/fixtures/perf/medium.js` - 500-line test fixture
  - `tests/fixtures/perf/large.js` - 1000+ line test fixture

- **Edge Case Tests**
  - Unicode/emoji handling in TODO comments
  - JSX context detection
  - Boundary condition tests for comment length
  - Multiple URL handling with `ignoreUrls` option

### Changed

- Updated `package.json` test script to include `tests/lib/**/*.js` (was only `tests/lib/rules/`)
- Vue/Svelte template tests now gracefully skip when parsers aren't installed
- Updated `CONTRIBUTING.md` with comprehensive test guidelines:
  - Running different test suites
  - Test coverage requirements
  - Test category explanations (unit, utility, integration, performance)
  - Example test patterns for edge cases and integration tests
- Added `tests/fixtures/` to `.eslintrc.js` ignore patterns

### Fixed

- Integration tests now work with ESLint v8 API (`useEslintrc: false` instead of `overrideConfigFile: true`)

### Dependencies

- Added `benchmark` as dev dependency for performance testing

## [1.0.1] - 2026-01-08

### Added

- Comprehensive FAQ documentation (`docs/FAQ.md`) with 25+ questions covering:
  - General plugin usage and preset selection
  - Configuration patterns for test files and monorepos
  - Rule-specific troubleshooting
  - Integration with CI/CD pipelines
  - Contributing guidelines
- FAQ link added to README.md

### Changed

- Expanded troubleshooting section in Integration Guide with 5 new entries:
  - Plugin conflicts with other ESLint plugins
  - Performance issues in large codebases
  - Vue/Svelte template comments not being linted
  - Autofix not applying changes
  - Rules work in IDE but not in CI
- Fixed license reference in README.md (ISC → MIT)

### Documentation (v1.0.1a)

- Clarified `require-explanation-comments` options:
  - Added examples for `ternaryChainLength` at different values
  - Added examples for `conditionComplexity` with complexity scoring explanation
- Clarified `valid-tsdoc` `requireRemarks` option:
  - Defined "public API" explicitly (exported functions, classes, interfaces, types)
  - Added examples showing when remarks are/aren't required
- Clarified `enforce-comment-length` `ignoreUrls` behavior:
  - Documented URL detection pattern (http://, https:// only)
  - Added edge cases for other protocols and partial URLs
- Clarified `comment-code-ratio` multi-line counting:
  - Explained how block comments and JSDoc count lines
  - Added examples showing line span counting
- Added edge cases to `enforce-capitalization`:
  - Backtick-wrapped code at start of comment
  - JSDoc tag interaction
  - File path comment detection
- Enhanced Integration Guide:
  - VS Code multi-language configuration (Vue/Svelte)
  - Monorepo mixed-preset configuration example
  - Markdown code block language support clarification

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

[Unreleased]: https://github.com/southpawriter02/lint-my-lines/compare/v1.2.0a...HEAD
[1.2.0a]: https://github.com/southpawriter02/lint-my-lines/compare/v1.2.0...v1.2.0a
[1.2.0]: https://github.com/southpawriter02/lint-my-lines/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/southpawriter02/lint-my-lines/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/southpawriter02/lint-my-lines/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.2a...v1.0.3
[1.0.2a]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.2...v1.0.2a
[1.0.2]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/southpawriter02/lint-my-lines/compare/v1.0.0...v1.0.1
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
