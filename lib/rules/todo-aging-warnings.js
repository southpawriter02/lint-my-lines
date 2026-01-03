/**
 * @fileoverview Rule to warn on old TODO/FIXME comments.
 * @author Jules
 */
"use strict";

const {
  parseDate,
  calculateAgeDays,
  extractDateFromComment,
  formatAge,
} = require("../utils/date-utils");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Warn when TODO/FIXME comments exceed age threshold",
      category: "Best Practices",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          maxAgeDays: {
            type: "integer",
            minimum: 1,
            description: "Maximum age in days before warning (default: 30)",
          },
          criticalAgeDays: {
            type: "integer",
            minimum: 1,
            description: "Age in days to trigger critical warning (default: 90)",
          },
          includeFixme: {
            type: "boolean",
            description: "Also check FIXME comments (default: true)",
          },
          includeNote: {
            type: "boolean",
            description: "Also check NOTE comments (default: false)",
          },
          warnOnNoDate: {
            type: "boolean",
            description: "Warn if TODO/FIXME has no date (default: false)",
          },
          ignoreFutureDates: {
            type: "boolean",
            description: "Ignore future-dated comments (default: true)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      todoAged:
        "TODO is {{age}} old (max: {{maxAge}} days). Reference: {{reference}}",
      todoCritical:
        "TODO is critically overdue ({{age}} old, critical: {{criticalAge}} days). Reference: {{reference}}",
      fixmeAged:
        "FIXME is {{age}} old (max: {{maxAge}} days). Reference: {{reference}}",
      fixmeCritical:
        "FIXME is critically overdue ({{age}} old, critical: {{criticalAge}} days). This bug has been known for too long.",
      noteAged:
        "NOTE is {{age}} old (max: {{maxAge}} days). Reference: {{reference}}",
      todoNoDate:
        "TODO has no date. Consider using format: TODO (author, YYYY-MM-DD): description",
      fixmeNoDate:
        "FIXME has no date. Consider using format: FIXME (author, YYYY-MM-DD): description",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const maxAgeDays = options.maxAgeDays || 30;
    const criticalAgeDays = options.criticalAgeDays || 90;
    const includeFixme = options.includeFixme !== false;
    const includeNote = options.includeNote || false;
    const warnOnNoDate = options.warnOnNoDate || false;
    const ignoreFutureDates = options.ignoreFutureDates !== false;

    const sourceCode = context.getSourceCode();

    /**
     * Check a comment for aging
     * @param {Object} comment - ESLint comment object
     */
    function checkComment(comment) {
      const text = comment.value;

      // Check if this is a TODO/FIXME/NOTE comment
      const extracted = extractDateFromComment(text);

      if (!extracted.keyword) {
        return;
      }

      // Skip NOTE unless configured
      if (extracted.keyword === "NOTE" && !includeNote) {
        return;
      }

      // Skip FIXME unless configured
      if (extracted.keyword === "FIXME" && !includeFixme) {
        return;
      }

      // Check if there's a date
      if (!extracted.date) {
        if (warnOnNoDate) {
          const messageId =
            extracted.keyword === "TODO" ? "todoNoDate" : "fixmeNoDate";
          context.report({
            node: null,
            loc: comment.loc,
            messageId,
          });
        }
        return;
      }

      // Ignore future dates
      if (ignoreFutureDates && extracted.date > new Date()) {
        return;
      }

      // Calculate age
      const ageDays = calculateAgeDays(extracted.date);

      if (ageDays < 0) {
        return;
      }

      // Determine reference text
      const reference = extracted.reference || "no reference";

      // Check thresholds
      if (ageDays >= criticalAgeDays) {
        const messageId =
          extracted.keyword === "TODO"
            ? "todoCritical"
            : extracted.keyword === "FIXME"
              ? "fixmeCritical"
              : "noteAged";
        context.report({
          node: null,
          loc: comment.loc,
          messageId,
          data: {
            age: formatAge(ageDays),
            criticalAge: criticalAgeDays.toString(),
            maxAge: maxAgeDays.toString(),
            reference,
          },
        });
      } else if (ageDays >= maxAgeDays) {
        const messageId =
          extracted.keyword === "TODO"
            ? "todoAged"
            : extracted.keyword === "FIXME"
              ? "fixmeAged"
              : "noteAged";
        context.report({
          node: null,
          loc: comment.loc,
          messageId,
          data: {
            age: formatAge(ageDays),
            maxAge: maxAgeDays.toString(),
            reference,
          },
        });
      }
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        for (const comment of comments) {
          checkComment(comment);
        }
      },
    };
  },
};
