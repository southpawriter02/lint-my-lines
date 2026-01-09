/**
 * TypeScript type definitions for eslint-plugin-lint-my-lines
 *
 * These types provide full IntelliSense support for:
 * - Configuration presets
 * - Rule options
 * - Plugin API
 *
 * ## Installation
 *
 * Types are included with the package - no additional installation needed.
 *
 * ## Usage
 *
 * ```typescript
 * // eslint.config.ts
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import type { FlatConfig } from "eslint-plugin-lint-my-lines";
 *
 * const config: FlatConfig[] = [
 *   lintMyLines.configs["flat/recommended"],
 * ];
 *
 * export default config;
 * ```
 *
 * @packageDocumentation
 * @module eslint-plugin-lint-my-lines
 */

import type { Linter, ESLint, Rule } from "eslint";

// =============================================================================
// Severity Types
// =============================================================================

/**
 * Rule severity levels.
 *
 * Can be specified as strings ("off", "warn", "error") or numbers (0, 1, 2).
 *
 * | Value | String | Meaning |
 * |-------|--------|---------|
 * | 0 | "off" | Rule is disabled |
 * | 1 | "warn" | Rule violations produce warnings |
 * | 2 | "error" | Rule violations produce errors |
 *
 * @example
 * const rules: RulesConfig = {
 *   "lint-my-lines/enforce-todo-format": "warn", // String form
 *   "lint-my-lines/no-commented-code": 2,        // Number form (error)
 * };
 */
export type RuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

/**
 * Rule configuration type.
 *
 * Rules can be configured in three ways:
 * 1. Just severity: `"warn"` or `2`
 * 2. Severity in array: `["warn"]` or `[2]`
 * 3. Severity with options: `["warn", { maxLength: 100 }]`
 *
 * @typeParam T - The type of the rule's options object
 *
 * @example
 * // Severity only
 * const rule1: RuleConfig = "warn";
 *
 * // With options
 * const rule2: RuleConfig<{ maxLength: number }> = ["warn", { maxLength: 100 }];
 */
export type RuleConfig<T = unknown> =
  | RuleSeverity
  | [RuleSeverity]
  | [RuleSeverity, T];

// =============================================================================
// Comment Context Types (v1.1.1)
// =============================================================================

// =============================================================================
// Ignore Options (v1.1.2)
// =============================================================================

/**
 * Ignore pattern options for rules (v1.1.2).
 *
 * Controls what content is excluded from rule analysis:
 * - URLs (http://, https://)
 * - Markdown code blocks (```code```)
 * - Inline code (`code`)
 * - Custom regex patterns
 *
 * @example
 * {
 *   "lint-my-lines/enforce-comment-length": ["warn", {
 *     ignoreUrls: true,
 *     ignoreCodeBlocks: true,
 *     ignoreRegex: "@see\\s+\\S+"
 *   }]
 * }
 */
export interface IgnoreOptions {
  /**
   * Whether to ignore URLs in comment content.
   *
   * When true, URLs (http:// and https://) are excluded from
   * analysis. This is useful because URLs are often long and
   * unavoidable.
   *
   * @default true
   */
  ignoreUrls?: boolean;

  /**
   * Whether to ignore markdown code blocks (```code```).
   *
   * When true, triple-backtick code blocks are excluded from
   * analysis. Useful for documentation comments containing examples.
   *
   * @default true
   */
  ignoreCodeBlocks?: boolean;

  /**
   * Whether to ignore inline code (`code`).
   *
   * When true, backtick-wrapped code is excluded from analysis.
   *
   * @default true
   */
  ignoreInlineCode?: boolean;

  /**
   * Custom regex pattern to strip from comment content.
   *
   * Content matching this pattern is removed before analysis.
   * Useful for ignoring custom tags or references.
   *
   * @example
   * // Ignore @see references
   * ignoreRegex: "@see\\s+\\S+"
   *
   * @example
   * // Ignore @link tags
   * ignoreRegex: "@link\\s+\\S+"
   */
  ignoreRegex?: string;
}

/**
 * Comment context handling options for rules.
 *
 * Controls how rules treat different types of comments:
 * - Documentation comments (JSDoc, file headers, license blocks)
 * - Inline comments (single-line, trailing, explanatory)
 *
 * @example
 * {
 *   "lint-my-lines/no-obvious-comments": ["warn", {
 *     commentContext: {
 *       documentationComments: "skip",
 *       inlineComments: "normal"
 *     }
 *   }]
 * }
 */
export interface CommentContextOptions {
  /**
   * How to handle JSDoc and documentation comments.
   *
   * | Value | Behavior |
   * |-------|----------|
   * | strict | Apply stricter checking to documentation comments |
   * | normal | Apply normal rule behavior (default) |
   * | skip | Skip documentation comments entirely |
   *
   * @default "normal"
   */
  documentationComments?: "strict" | "normal" | "skip";

  /**
   * How to handle inline and trailing comments.
   *
   * | Value | Behavior |
   * |-------|----------|
   * | strict | Apply stricter checking to inline comments |
   * | normal | Apply normal rule behavior (default) |
   * | skip | Skip inline comments entirely |
   *
   * @default "normal"
   */
  inlineComments?: "strict" | "normal" | "skip";
}

/**
 * File context detection result.
 *
 * Returned by file context detection utilities to classify files
 * by type (test, generated, minified).
 *
 * @example
 * const context = detectFileContext("dist/app.min.js");
 * // { isTestFile: false, isGeneratedFile: true, isMinifiedFile: true }
 */
export interface FileContext {
  /** Whether this is a test file (*.test.js, *.spec.ts, __tests__/*, etc.) */
  isTestFile: boolean;
  /** Whether this is a generated file (dist/*, build/*, *.d.ts, etc.) */
  isGeneratedFile: boolean;
  /** Whether this is a minified file (*.min.js, *.bundle.js, etc.) */
  isMinifiedFile: boolean;
}

/**
 * Comment purpose classification.
 *
 * Describes the semantic purpose of a comment.
 */
export type CommentPurpose =
  | "documentation"  // JSDoc, file headers, API docs
  | "explanation"    // Explains why code does something
  | "todo"           // TODO, FIXME, NOTE markers
  | "directive"      // ESLint directives, pragma comments
  | "noise";         // Obvious/redundant comments

/**
 * Enhanced comment classification with context.
 *
 * Provides detailed classification of a comment including
 * its purpose and whether it contains valuable information.
 */
export interface EnhancedCommentClassification {
  /** Whether this is a documentation-style comment (JSDoc, file header) */
  isDocumentationComment: boolean;
  /** Whether this is an inline/trailing comment */
  isInlineComment: boolean;
  /** The semantic purpose of the comment */
  purpose: CommentPurpose;
  /** Whether the comment contains "why" indicators (because, workaround, etc.) */
  hasWhyIndicator: boolean;
}

// =============================================================================
// Rule Option Interfaces
// =============================================================================

/**
 * Options for enforce-todo-format, enforce-fixme-format, and enforce-note-format rules.
 *
 * These rules enforce a consistent format for structured comments:
 * `TODO (TICKET-123): Description of the task`
 *
 * @example
 * {
 *   "lint-my-lines/enforce-todo-format": ["warn", {
 *     pattern: "^TODO\\s*\\([A-Z]+-\\d+\\):",
 *     placeholder: "JIRA-XXX"
 *   }]
 * }
 */
export interface EnforceTodoFormatOptions {
  /**
   * Custom regex pattern for TODO/FIXME/NOTE format.
   *
   * The pattern should match the entire structured comment prefix.
   * Use capture groups if you need to extract specific parts.
   *
   * @default /^TODO\s*\([^)]+\):/
   *
   * @example
   * // Match: TODO (JIRA-123):
   * pattern: "^TODO\\s*\\(JIRA-\\d+\\):"
   *
   * @example
   * // Match: TODO (@username):
   * pattern: "^TODO\\s*\\(@\\w+\\):"
   */
  pattern?: string;

  /**
   * Placeholder text used when autofixing invalid TODOs.
   *
   * When the rule fixes a bare `TODO:` comment, it inserts this
   * placeholder as the reference. The user should then replace it
   * with a real ticket number.
   *
   * @default "TICKET-XXX"
   *
   * @example
   * // Before: // TODO: fix this
   * // After:  // TODO (JIRA-XXX): fix this
   * placeholder: "JIRA-XXX"
   */
  placeholder?: string;
}

/**
 * Options for enforce-comment-length rule.
 *
 * Enforces minimum and maximum lengths for comments to ensure
 * they are neither too terse nor excessively long.
 *
 * @example
 * {
 *   "lint-my-lines/enforce-comment-length": ["warn", {
 *     maxLength: 100,
 *     minLength: 10,
 *     ignoreUrls: true
 *   }]
 * }
 */
export interface EnforceCommentLengthOptions {
  /**
   * Maximum allowed comment length in characters.
   *
   * Comments longer than this will produce a warning/error.
   * This helps ensure comments fit on screen without scrolling.
   *
   * @default 120
   *
   * @example
   * maxLength: 80  // Stricter, fits in narrow terminals
   * maxLength: 150 // More lenient, allows longer explanations
   */
  maxLength?: number;

  /**
   * Minimum required comment length in characters.
   *
   * Comments shorter than this will produce a warning/error.
   * This helps prevent one-word comments that add no value.
   *
   * @default 0 (no minimum)
   *
   * @example
   * minLength: 10  // Require at least 10 characters
   */
  minLength?: number;

  /**
   * Whether to ignore URLs when calculating comment length.
   *
   * URLs can be very long and are often unavoidable in comments.
   * When true, URL lengths are excluded from the calculation.
   *
   * @default true
   *
   * @example
   * // With ignoreUrls: true, this won't exceed maxLength
   * // See https://very-long-documentation-url.example.com/api/reference
   */
  ignoreUrls?: boolean;

  /**
   * Whether to ignore inline code when calculating length.
   *
   * Backtick-wrapped code (e.g., `functionName`) is excluded
   * from length calculation when true.
   *
   * @default true
   */
  ignoreInlineCode?: boolean;

  /**
   * Whether to ignore markdown code blocks (```code```) in length calculation (v1.1.2).
   *
   * @default true
   */
  ignoreCodeBlocks?: boolean;

  /**
   * Custom regex pattern to exclude from length calculation (v1.1.2).
   *
   * @example
   * ignoreRegex: "@see\\s+\\S+"
   */
  ignoreRegex?: string;

  /**
   * Comment context handling options (v1.1.1).
   *
   * Controls how this rule treats documentation vs inline comments.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for ban-specific-words rule.
 *
 * Bans certain words or phrases in comments, with optional
 * suggested replacements. Useful for:
 * - Removing non-inclusive language
 * - Enforcing terminology standards
 * - Preventing profanity
 *
 * @example
 * {
 *   "lint-my-lines/ban-specific-words": ["warn", {
 *     includeDefaults: true,
 *     bannedWords: [
 *       { word: "hack", replacement: "workaround", reason: "Be specific" },
 *       { word: "obvious", reason: "Nothing is obvious to everyone" }
 *     ]
 *   }]
 * }
 */
export interface BanSpecificWordsOptions {
  /**
   * Include the default list of banned words.
   *
   * The default list includes non-inclusive terms and vague words.
   * Set to false to only use your custom list.
   *
   * @default true
   */
  includeDefaults?: boolean;

  /**
   * Custom banned words with optional replacements.
   *
   * Each entry specifies a word to ban, an optional replacement,
   * and an optional reason explaining why it's banned.
   *
   * @example
   * bannedWords: [
   *   { word: "blacklist", replacement: "blocklist" },
   *   { word: "whitelist", replacement: "allowlist" },
   *   { word: "dummy", reason: "Use 'placeholder' or 'sample' instead" }
   * ]
   */
  bannedWords?: Array<{
    /** The word or phrase to ban */
    word: string;
    /** Suggested replacement (shown in error message) */
    replacement?: string;
    /** Reason for banning (shown in error message) */
    reason?: string;
  }>;

  /**
   * Use case-sensitive matching.
   *
   * When false, "TODO" and "todo" are treated the same.
   *
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Match whole words only.
   *
   * When true, "hack" won't match "hackathon".
   *
   * @default true
   */
  wholeWord?: boolean;

  /**
   * Ignore matches inside URLs (v1.1.2).
   *
   * @default true
   */
  ignoreUrls?: boolean;

  /**
   * Ignore matches inside markdown code blocks (v1.1.2).
   *
   * @default true
   */
  ignoreCodeBlocks?: boolean;

  /**
   * Ignore matches inside inline code (v1.1.2).
   *
   * @default true
   */
  ignoreInlineCode?: boolean;

  /**
   * Custom regex pattern - matches inside are ignored (v1.1.2).
   */
  ignoreRegex?: string;

  /**
   * Comment context handling options (v1.1.1).
   *
   * Controls how this rule treats documentation vs inline comments.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for enforce-capitalization rule.
 *
 * Enforces capitalization at the start of comments.
 *
 * @example
 * {
 *   "lint-my-lines/enforce-capitalization": ["warn", {
 *     ignoreInlineCode: true,
 *     ignorePatterns: ["^e\\.g\\.", "^i\\.e\\."]
 *   }]
 * }
 */
export interface EnforceCapitalizationOptions {
  /**
   * Ignore comments starting with backtick-wrapped code.
   *
   * @default true
   */
  ignoreInlineCode?: boolean;

  /**
   * Additional patterns to ignore (regex strings).
   *
   * @example
   * ignorePatterns: ["^e\\.g\\.", "^i\\.e\\."]
   */
  ignorePatterns?: string[];

  /**
   * Ignore comments starting with URLs (v1.1.2).
   *
   * @default true
   */
  ignoreUrls?: boolean;

  /**
   * Ignore markdown code blocks (v1.1.2).
   *
   * @default true
   */
  ignoreCodeBlocks?: boolean;

  /**
   * Custom regex pattern to strip before checking capitalization (v1.1.2).
   */
  ignoreRegex?: string;

  /**
   * Comment context handling options (v1.1.1).
   *
   * Controls how this rule treats documentation vs inline comments.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for no-obvious-comments rule.
 *
 * Detects comments that simply restate what the code does,
 * adding no value to the reader.
 *
 * @example
 * // Bad: // Increment counter
 * counter++;
 *
 * // Good: // Track retries for exponential backoff
 * counter++;
 *
 * @example
 * {
 *   "lint-my-lines/no-obvious-comments": ["warn", {
 *     sensitivity: "medium"
 *   }]
 * }
 */
export interface NoObviousCommentsOptions {
  /**
   * Detection sensitivity level.
   *
   * | Level | Description |
   * |-------|-------------|
   * | low | Only flag extremely obvious comments |
   * | medium | Balance between precision and recall |
   * | high | Flag more comments (may have false positives) |
   *
   * @default "medium"
   */
  sensitivity?: "low" | "medium" | "high";

  /**
   * Ignore URLs when checking for obviousness (v1.1.2).
   *
   * @default true
   */
  ignoreUrls?: boolean;

  /**
   * Ignore markdown code blocks (v1.1.2).
   *
   * @default true
   */
  ignoreCodeBlocks?: boolean;

  /**
   * Custom regex pattern to strip before checking (v1.1.2).
   */
  ignoreRegex?: string;

  /**
   * Comment context handling options (v1.1.1).
   *
   * Controls how this rule treats documentation vs inline comments.
   * By default, documentation comments are skipped.
   *
   * @default { documentationComments: "skip", inlineComments: "normal" }
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for require-explanation-comments rule.
 *
 * Requires explanatory comments for complex or non-obvious code patterns.
 *
 * @example
 * {
 *   "lint-my-lines/require-explanation-comments": ["warn", {
 *     requireFor: ["regex", "bitwise", "magic-numbers"]
 *   }]
 * }
 */
export interface RequireExplanationCommentsOptions {
  /**
   * Code patterns that require explanatory comments.
   *
   * | Pattern | Description |
   * |---------|-------------|
   * | regex | Regular expressions |
   * | bitwise | Bitwise operations (|, &, ^, ~, <<, >>) |
   * | magic-numbers | Numeric literals (except 0, 1, -1) |
   * | ternary | Complex ternary expressions |
   *
   * @default ["regex", "bitwise"]
   */
  requireFor?: Array<"regex" | "bitwise" | "magic-numbers" | "ternary">;

  /**
   * Custom regex pattern to strip from comment before checking meaningfulness (v1.1.2).
   */
  ignoreRegex?: string;

  /**
   * Comment context handling options (v1.1.1).
   *
   * Controls what counts as a "meaningful" explanation comment.
   * When documentationComments is "skip", JSDoc comments won't
   * count as sufficient explanation.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for require-jsdoc rule.
 *
 * Requires JSDoc comments for specified code constructs.
 *
 * @example
 * {
 *   "lint-my-lines/require-jsdoc": ["warn", {
 *     require: {
 *       FunctionDeclaration: true,
 *       ClassDeclaration: true,
 *       MethodDefinition: true
 *     },
 *     exemptEmptyFunctions: true,
 *     minLineCount: 5
 *   }]
 * }
 */
export interface RequireJsdocOptions {
  /**
   * Which code constructs require JSDoc.
   *
   * Set each to true to require JSDoc for that construct type.
   */
  require?: {
    /** Named function declarations */
    FunctionDeclaration?: boolean;
    /** Arrow function expressions (when assigned) */
    ArrowFunctionExpression?: boolean;
    /** Function expressions (when assigned) */
    FunctionExpression?: boolean;
    /** Class declarations */
    ClassDeclaration?: boolean;
    /** Class methods */
    MethodDefinition?: boolean;
  };

  /**
   * Exempt functions with empty bodies.
   *
   * Empty functions are often stubs or intentional no-ops
   * that don't need documentation.
   *
   * @default true
   */
  exemptEmptyFunctions?: boolean;

  /**
   * Minimum line count to require JSDoc.
   *
   * Short functions may be self-documenting.
   * Set this to only require JSDoc for longer functions.
   *
   * @default 0 (require for all)
   *
   * @example
   * minLineCount: 5  // Only require JSDoc for functions >= 5 lines
   */
  minLineCount?: number;

  /**
   * Exempt private methods (starting with _).
   *
   * @default false
   */
  exemptPrivate?: boolean;
}

/**
 * Options for valid-jsdoc rule.
 *
 * Validates that JSDoc comments match function signatures.
 */
export interface ValidJsdocOptions {
  /**
   * Require @param for all parameters.
   *
   * @default true
   */
  requireParam?: boolean;

  /**
   * Require @returns for functions that return values.
   *
   * @default true
   */
  requireReturn?: boolean;

  /**
   * Require type annotations in @param and @returns.
   *
   * @default true
   */
  requireParamType?: boolean;

  /**
   * Require descriptions for @param tags.
   *
   * @default false
   */
  requireParamDescription?: boolean;
}

/**
 * Options for jsdoc-type-syntax rule.
 *
 * Enforces consistent type syntax in JSDoc comments.
 *
 * @example
 * {
 *   "lint-my-lines/jsdoc-type-syntax": ["warn", {
 *     prefer: "typescript"
 *   }]
 * }
 */
export interface JsdocTypeSyntaxOptions {
  /**
   * Preferred type syntax style.
   *
   * | Style | Example |
   * |-------|---------|
   * | jsdoc | `{Array.<string>}` |
   * | typescript | `{string[]}` |
   *
   * @default "typescript"
   */
  prefer?: "jsdoc" | "typescript";
}

/**
 * Options for require-file-header rule.
 *
 * Requires a file header comment at the top of each file.
 *
 * @example
 * {
 *   "lint-my-lines/require-file-header": ["warn", {
 *     requiredTags: ["@file", "@author"]
 *   }]
 * }
 */
export interface RequireFileHeaderOptions {
  /**
   * JSDoc tags that must be present in the file header.
   *
   * @default ["@file"]
   *
   * @example
   * requiredTags: ["@file", "@author", "@license"]
   */
  requiredTags?: string[];

  /**
   * Custom header template pattern.
   *
   * Regex pattern the header must match.
   */
  template?: string;
}

/**
 * Options for comment-code-ratio rule.
 *
 * Reports files that are under or over-documented based on
 * the ratio of comment lines to code lines.
 *
 * @example
 * {
 *   "lint-my-lines/comment-code-ratio": ["warn", {
 *     minRatio: 0.1,
 *     maxRatio: 0.5,
 *     excludeJSDoc: false
 *   }]
 * }
 */
export interface CommentCodeRatioOptions {
  /**
   * Minimum comment-to-code ratio.
   *
   * Files with less than this ratio of comments are flagged
   * as under-documented.
   *
   * @default 0.05 (5%)
   *
   * @example
   * minRatio: 0.1  // Require at least 10% comments
   */
  minRatio?: number;

  /**
   * Maximum comment-to-code ratio.
   *
   * Files with more than this ratio of comments are flagged
   * as over-documented (comments may be excessive or outdated).
   *
   * @default 0.40 (40%)
   *
   * @example
   * maxRatio: 0.3  // Allow at most 30% comments
   */
  maxRatio?: number;

  /**
   * Exclude JSDoc comments from ratio calculation.
   *
   * JSDoc is often auto-generated and may skew the ratio.
   *
   * @default false
   */
  excludeJSDoc?: boolean;

  /**
   * Exclude TODO/FIXME comments from ratio calculation.
   *
   * @default false
   */
  excludeTodo?: boolean;
}

/**
 * Options for todo-aging-warnings rule.
 *
 * Warns when TODO/FIXME comments become stale based on age.
 *
 * @example
 * {
 *   "lint-my-lines/todo-aging-warnings": ["warn", {
 *     maxAgeDays: 30,
 *     criticalAgeDays: 90
 *   }]
 * }
 */
export interface TodoAgingWarningsOptions {
  /**
   * Days before a TODO becomes stale.
   *
   * TODOs older than this produce warnings.
   *
   * @default 30
   */
  maxAgeDays?: number;

  /**
   * Days before a TODO becomes critical.
   *
   * TODOs older than this produce errors.
   *
   * @default 90
   */
  criticalAgeDays?: number;

  /**
   * How to determine TODO age.
   *
   * | Method | Description |
   * |--------|-------------|
   * | git-blame | Use git blame to get line age |
   * | date-comment | Parse date from comment text |
   *
   * @default "git-blame"
   */
  ageMethod?: "git-blame" | "date-comment";
}

/**
 * Options for stale-comment-detection rule.
 *
 * Detects comments that reference non-existent code elements.
 */
export interface StaleCommentDetectionOptions {
  /**
   * Check for references to non-existent functions.
   *
   * @default true
   */
  checkFunctionRefs?: boolean;

  /**
   * Check for references to non-existent variables.
   *
   * @default true
   */
  checkVariableRefs?: boolean;

  /**
   * Minimum confidence level for stale detection.
   *
   * @default 0.7
   */
  minConfidence?: number;

  /**
   * Custom regex pattern to strip from comment before checking references (v1.1.2).
   */
  ignoreRegex?: string;
}

// =============================================================================
// Accessibility Rule Options (v1.2.0)
// =============================================================================

/**
 * Options for require-alt-text-comments rule.
 *
 * Requires comments for complex UI elements explaining their accessibility purpose.
 *
 * @since 1.2.0
 *
 * @example
 * {
 *   "lint-my-lines/require-alt-text-comments": ["warn", {
 *     elements: ["img", "svg", "Icon"],
 *     minCommentLength: 10
 *   }]
 * }
 */
export interface RequireAltTextCommentsOptions {
  /**
   * JSX elements to check for accessibility comments.
   *
   * @default ["img", "svg", "Icon", "button"]
   */
  elements?: string[];

  /**
   * Require comment when aria-label is present.
   *
   * @default true
   */
  requireForAriaLabels?: boolean;

  /**
   * Regex patterns to match icon component names.
   *
   * @default ["Icon$", "Ico$", "^Icon", "^Svg"]
   */
  iconComponentPatterns?: string[];

  /**
   * Minimum length for a meaningful comment.
   *
   * @default 10
   */
  minCommentLength?: number;

  /**
   * Check elements with empty alt text (decorative images).
   *
   * @default true
   */
  checkEmptyAlt?: boolean;

  /**
   * Comment context handling options.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for accessibility-todo-format rule.
 *
 * Enforces a standard format for accessibility TODO comments.
 *
 * @since 1.2.0
 *
 * @example
 * {
 *   "lint-my-lines/accessibility-todo-format": ["warn", {
 *     requireWcagReference: true
 *   }]
 * }
 */
export interface AccessibilityTodoFormatOptions {
  /**
   * Custom regex pattern for A11Y-TODO format validation.
   *
   * @default "^A11Y-TODO\\s*\\(([^)]+)\\):"
   */
  pattern?: string;

  /**
   * Require WCAG guideline reference in the TODO.
   *
   * @default false
   */
  requireWcagReference?: boolean;

  /**
   * Accepted prefixes for accessibility TODOs.
   *
   * @default ["A11Y-TODO", "ALLY-TODO"]
   */
  allowedPrefixes?: string[];

  /**
   * Custom pattern for WCAG references.
   *
   * @default "WCAG-\\d+\\.\\d+\\.\\d+"
   */
  wcagPattern?: string;
}

/**
 * Options for screen-reader-context rule.
 *
 * Requires explanatory comments for UI patterns that behave differently for screen readers.
 *
 * @since 1.2.0
 *
 * @example
 * {
 *   "lint-my-lines/screen-reader-context": ["warn", {
 *     checkAriaHidden: true,
 *     minExplanationLength: 20
 *   }]
 * }
 */
export interface ScreenReaderContextOptions {
  /**
   * Check aria-hidden elements.
   *
   * @default true
   */
  checkAriaHidden?: boolean;

  /**
   * Check role=presentation elements.
   *
   * @default true
   */
  checkRolePresentation?: boolean;

  /**
   * Check negative tabindex elements.
   *
   * @default true
   */
  checkTabindex?: boolean;

  /**
   * Check aria-live regions.
   *
   * @default true
   */
  checkAriaLive?: boolean;

  /**
   * Check aria-expanded elements.
   *
   * @default false
   */
  checkAriaExpanded?: boolean;

  /**
   * Class names for visually hidden elements.
   *
   * @default ["sr-only", "visually-hidden", "visuallyhidden", "screen-reader-only", "clip-hide"]
   */
  visuallyHiddenClasses?: string[];

  /**
   * Minimum length for meaningful explanation.
   *
   * @default 15
   */
  minExplanationLength?: number;

  /**
   * Comment context handling options.
   */
  commentContext?: CommentContextOptions;
}

/**
 * Options for issue-tracker-integration rule.
 *
 * Validates ticket IDs in TODO comments against issue trackers.
 */
export interface IssueTrackerIntegrationOptions {
  /**
   * Issue tracker type.
   */
  tracker?: "jira" | "github" | "gitlab" | "linear";

  /**
   * Base URL for the issue tracker.
   *
   * @example
   * baseUrl: "https://company.atlassian.net"
   */
  baseUrl?: string;

  /**
   * API token for issue tracker (can also use env var).
   */
  apiToken?: string;

  /**
   * Allowed project prefixes for ticket IDs.
   *
   * @example
   * projects: ["PROJ", "CORE", "UI"]
   */
  projects?: string[];
}

// =============================================================================
// Rule Names
// =============================================================================

/**
 * All available rule names.
 *
 * Use with `RulesConfig` for type-safe rule configuration.
 */
export type RuleName =
  // Comment Format Rules
  | "lint-my-lines/enforce-todo-format"
  | "lint-my-lines/enforce-fixme-format"
  | "lint-my-lines/enforce-note-format"
  | "lint-my-lines/enforce-comment-length"
  | "lint-my-lines/enforce-capitalization"
  | "lint-my-lines/comment-spacing"
  // Content Quality Rules
  | "lint-my-lines/no-commented-code"
  | "lint-my-lines/no-obvious-comments"
  | "lint-my-lines/ban-specific-words"
  | "lint-my-lines/require-explanation-comments"
  // JSDoc/TSDoc Rules
  | "lint-my-lines/require-jsdoc"
  | "lint-my-lines/valid-jsdoc"
  | "lint-my-lines/valid-tsdoc"
  | "lint-my-lines/jsdoc-type-syntax"
  | "lint-my-lines/require-file-header"
  // Template Rules
  | "lint-my-lines/vue-template-comments"
  | "lint-my-lines/svelte-template-comments"
  // Advanced Analysis Rules
  | "lint-my-lines/stale-comment-detection"
  | "lint-my-lines/todo-aging-warnings"
  | "lint-my-lines/comment-code-ratio"
  | "lint-my-lines/issue-tracker-integration"
  // Accessibility Rules (v1.2.0)
  | "lint-my-lines/require-alt-text-comments"
  | "lint-my-lines/accessibility-todo-format"
  | "lint-my-lines/screen-reader-context";

/**
 * Rules configuration object with full type support.
 *
 * @example
 * const rules: RulesConfig = {
 *   "lint-my-lines/enforce-todo-format": "warn",
 *   "lint-my-lines/enforce-comment-length": ["error", { maxLength: 100 }],
 *   "lint-my-lines/no-commented-code": 2,
 * };
 */
export interface RulesConfig {
  "lint-my-lines/enforce-todo-format"?: RuleConfig<EnforceTodoFormatOptions>;
  "lint-my-lines/enforce-fixme-format"?: RuleConfig<EnforceTodoFormatOptions>;
  "lint-my-lines/enforce-note-format"?: RuleConfig<EnforceTodoFormatOptions>;
  "lint-my-lines/enforce-comment-length"?: RuleConfig<EnforceCommentLengthOptions>;
  "lint-my-lines/enforce-capitalization"?: RuleConfig<EnforceCapitalizationOptions>;
  "lint-my-lines/comment-spacing"?: RuleConfig;
  "lint-my-lines/no-commented-code"?: RuleConfig;
  "lint-my-lines/no-obvious-comments"?: RuleConfig<NoObviousCommentsOptions>;
  "lint-my-lines/ban-specific-words"?: RuleConfig<BanSpecificWordsOptions>;
  "lint-my-lines/require-explanation-comments"?: RuleConfig<RequireExplanationCommentsOptions>;
  "lint-my-lines/require-jsdoc"?: RuleConfig<RequireJsdocOptions>;
  "lint-my-lines/valid-jsdoc"?: RuleConfig<ValidJsdocOptions>;
  "lint-my-lines/valid-tsdoc"?: RuleConfig;
  "lint-my-lines/jsdoc-type-syntax"?: RuleConfig<JsdocTypeSyntaxOptions>;
  "lint-my-lines/require-file-header"?: RuleConfig<RequireFileHeaderOptions>;
  "lint-my-lines/vue-template-comments"?: RuleConfig;
  "lint-my-lines/svelte-template-comments"?: RuleConfig;
  "lint-my-lines/stale-comment-detection"?: RuleConfig<StaleCommentDetectionOptions>;
  "lint-my-lines/todo-aging-warnings"?: RuleConfig<TodoAgingWarningsOptions>;
  "lint-my-lines/comment-code-ratio"?: RuleConfig<CommentCodeRatioOptions>;
  "lint-my-lines/issue-tracker-integration"?: RuleConfig<IssueTrackerIntegrationOptions>;
  // Accessibility rules (v1.2.0)
  "lint-my-lines/require-alt-text-comments"?: RuleConfig<RequireAltTextCommentsOptions>;
  "lint-my-lines/accessibility-todo-format"?: RuleConfig<AccessibilityTodoFormatOptions>;
  "lint-my-lines/screen-reader-context"?: RuleConfig<ScreenReaderContextOptions>;
}

// =============================================================================
// Config Types
// =============================================================================

/**
 * Flat config preset names.
 *
 * Use these with `plugin.configs["preset-name"]`.
 */
export type FlatConfigPreset =
  | "flat/minimal"
  | "flat/recommended"
  | "flat/strict"
  | "flat/analysis"
  | "flat/accessibility" // v1.2.0
  | "flat/typescript"
  | "flat/typescript-strict"
  | "flat/react"
  | "flat/vue"
  | "flat/svelte"
  | "flat/markdown"
  // v1.1.1: File context presets
  | "flat/test-files"
  | "flat/generated"
  | "flat/minified";

/**
 * Legacy config preset names (ESLint v8 .eslintrc format).
 *
 * Use these with `extends: ["plugin:lint-my-lines/preset-name"]`.
 */
export type LegacyConfigPreset =
  | "minimal"
  | "recommended"
  | "strict"
  | "analysis";

/**
 * A single flat config object.
 *
 * This is the structure returned by `plugin.configs["flat/recommended"]`.
 *
 * @example
 * // eslint.config.js
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 * import type { FlatConfig } from "eslint-plugin-lint-my-lines";
 *
 * const config: FlatConfig = lintMyLines.configs["flat/recommended"];
 *
 * export default [config];
 */
export interface FlatConfig {
  /**
   * Config name for debugging and ESLint config inspector.
   *
   * Format: "lint-my-lines/flat/preset-name"
   */
  name: string;

  /**
   * Plugin instances.
   *
   * Maps plugin namespace to plugin object.
   */
  plugins: {
    "lint-my-lines": Plugin;
  };

  /**
   * Rule configurations.
   */
  rules: RulesConfig;

  /**
   * File patterns this config applies to.
   *
   * Uses glob syntax. Only present for language-specific configs.
   *
   * @example
   * files: ["**\/*.ts", "**\/*.tsx"]
   */
  files?: string[];

  /**
   * Processor reference for non-JS files.
   *
   * Format: "plugin-name/.extension"
   *
   * @example
   * processor: "lint-my-lines/.vue"
   */
  processor?: string;

  /**
   * Language options (ESLint v9 style).
   *
   * Includes parser settings, ecmaVersion, etc.
   */
  languageOptions?: Linter.LanguageOptions;
}

/**
 * Legacy config object (ESLint v8 .eslintrc format).
 */
export interface LegacyConfig {
  /** Plugin names to load */
  plugins: string[];
  /** Rule configurations */
  rules: RulesConfig;
}

/**
 * All available configs exported by the plugin.
 */
export interface Configs {
  // Flat configs (ESLint v9 / v8.54+)
  "flat/minimal": FlatConfig;
  "flat/recommended": FlatConfig;
  "flat/strict": FlatConfig;
  "flat/analysis": FlatConfig;
  "flat/accessibility": FlatConfig; // v1.2.0
  "flat/typescript": FlatConfig;
  "flat/typescript-strict": FlatConfig;
  "flat/react": FlatConfig;
  "flat/vue": FlatConfig;
  "flat/svelte": FlatConfig;
  "flat/markdown": FlatConfig;
  // v1.1.1: File context presets
  "flat/test-files": FlatConfig;
  "flat/generated": FlatConfig;
  "flat/minified": FlatConfig;

  // Legacy configs (ESLint v8 .eslintrc)
  minimal: LegacyConfig;
  recommended: LegacyConfig;
  strict: LegacyConfig;
  analysis: LegacyConfig;
}

// =============================================================================
// Processor Types
// =============================================================================

/**
 * ESLint processor interface.
 *
 * Processors extract code blocks from non-JS files (Vue, Svelte, Markdown).
 */
export interface Processor {
  /**
   * Preprocess a file into code blocks.
   *
   * @param text - Raw file content
   * @param filename - File name
   * @returns Array of code blocks to lint
   */
  preprocess: (
    text: string,
    filename: string
  ) => Array<string | { text: string; filename: string }>;

  /**
   * Postprocess lint messages from code blocks.
   *
   * @param messages - Messages from each code block
   * @param filename - Original file name
   * @returns Combined and adjusted messages
   */
  postprocess: (
    messages: Linter.LintMessage[][],
    filename: string
  ) => Linter.LintMessage[];

  /**
   * Whether this processor supports autofix.
   */
  supportsAutofix?: boolean;
}

// =============================================================================
// Plugin Type
// =============================================================================

/**
 * The plugin interface exported by eslint-plugin-lint-my-lines.
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 *
 * // Access configs
 * const recommended = lintMyLines.configs["flat/recommended"];
 *
 * // Access rules
 * const todoRule = lintMyLines.rules["enforce-todo-format"];
 *
 * // Access processors
 * const vueProcessor = lintMyLines.processors[".vue"];
 */
export interface Plugin {
  /**
   * Plugin meta information.
   *
   * Used by ESLint for identification and version tracking.
   */
  meta?: {
    /** Plugin name */
    name: string;
    /** Plugin version (semver) */
    version: string;
  };

  /**
   * All available rules.
   *
   * Keys are rule names without plugin prefix.
   */
  rules: Record<string, Rule.RuleModule>;

  /**
   * All available configs (both flat and legacy).
   */
  configs: Configs;

  /**
   * Available file processors.
   *
   * Keys are file extensions including the dot.
   */
  processors: {
    ".vue": Processor;
    ".svelte": Processor;
    ".md": Processor;
  };

  /**
   * Clear all internal caches.
   *
   * Useful for testing or when configuration changes.
   */
  clearCaches: () => void;
}

// =============================================================================
// Module Exports
// =============================================================================

/**
 * The default export - the complete plugin object.
 *
 * @example
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 *
 * export default [
 *   lintMyLines.configs["flat/recommended"],
 * ];
 */
declare const plugin: Plugin;
export default plugin;

/**
 * Named export for the plugin object.
 */
export { plugin };

/**
 * Named export for all rules.
 */
export const rules: Plugin["rules"];

/**
 * Named export for all configs.
 */
export const configs: Configs;

/**
 * Named export for all processors.
 */
export const processors: Plugin["processors"];

/**
 * Named export for the cache clearing function.
 */
export const clearCaches: Plugin["clearCaches"];

// =============================================================================
// Config Helper Types (re-exported from helpers.d.ts)
// =============================================================================

/**
 * Options for extending a preset with custom overrides.
 */
export interface ExtendPresetOptions {
  /** Rule settings to override */
  rules?: Partial<RulesConfig>;
  /** Custom config name */
  name?: string;
  /** File patterns to apply this config to */
  files?: string[];
  /** File patterns to exclude */
  ignores?: string[];
}

/**
 * Severity variants returned by createSeverityVariants.
 */
export interface SeverityVariants {
  /** Preset with all rules set to "warn" severity */
  warn: FlatConfig;
  /** Preset with all rules set to "error" severity */
  error: FlatConfig;
}

/**
 * Options for createFileTypePreset.
 */
export interface FileTypePresetOptions {
  /** Base preset to extend */
  basePreset: FlatConfig;
  /** File patterns this preset applies to */
  files: string[];
  /** Rule overrides (optional) */
  rules?: Partial<RulesConfig>;
  /** Custom config name (optional) */
  name?: string;
}

// =============================================================================
// Config Helper Functions
// =============================================================================

/**
 * Create a config that only applies to specific file patterns.
 *
 * This is the "include" pattern - the config will only be applied to files
 * matching the specified glob patterns.
 *
 * @param preset - Base preset config from plugin.configs
 * @param patterns - Glob pattern(s) for files to include
 * @returns New config object with files property
 *
 * @example
 * ```typescript
 * import lintMyLines from "eslint-plugin-lint-my-lines";
 *
 * export default [
 *   lintMyLines.createConfigForFiles(
 *     lintMyLines.configs["flat/strict"],
 *     "src/**\/*.js"
 *   ),
 * ];
 * ```
 */
export function createConfigForFiles(
  preset: FlatConfig,
  patterns: string | string[]
): FlatConfig;

/**
 * Create a config with specific file exclusions.
 *
 * This is the "exclude" pattern - the config will include the `ignores`
 * property to exclude matching files from rule application.
 *
 * @param preset - Base preset config
 * @param patterns - Glob pattern(s) for files to exclude
 * @returns Config object with ignores property
 */
export function createConfigWithExclude(
  preset: FlatConfig,
  patterns: string | string[]
): FlatConfig;

/**
 * Extend a preset with custom rule overrides.
 *
 * This enables rule inheritance by starting with a base preset and
 * overriding specific rules.
 *
 * @param preset - Base preset config
 * @param overrides - Configuration overrides
 * @returns Extended config object
 */
export function extendPreset(
  preset: FlatConfig,
  overrides?: ExtendPresetOptions
): FlatConfig;

/**
 * Create warn and error severity variants of a preset.
 *
 * This utility converts all rule severities in a preset to either
 * "warn" or "error", useful for creating development vs production configs.
 *
 * @param preset - Base preset config
 * @returns Object with warn and error variants
 */
export function createSeverityVariants(preset: FlatConfig): SeverityVariants;

/**
 * Merge multiple configs with proper precedence.
 *
 * Later configs override earlier ones. This is useful for creating
 * custom presets from multiple sources.
 *
 * @param configs - Config objects to merge
 * @returns Merged config object
 */
export function mergeConfigs(...configs: FlatConfig[]): FlatConfig;

/**
 * Create a preset for specific file types with proper inheritance.
 *
 * This is a convenience function that combines file patterns
 * with rule overrides for the common use case of creating
 * language-specific or directory-specific configurations.
 *
 * @param options - Configuration options
 * @returns Configured preset
 */
export function createFileTypePreset(options: FileTypePresetOptions): FlatConfig;
