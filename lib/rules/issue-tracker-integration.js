/**
 * @fileoverview Rule to validate ticket IDs in TODO/FIXME comments.
 * @author Jules
 */
"use strict";

const { createClient, clearCache } = require("../utils/issue-tracker-client");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Validate ticket IDs in TODO/FIXME comments exist in issue tracker",
      category: "Best Practices",
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          tracker: {
            type: "string",
            enum: ["github", "jira", "gitlab", "linear", "custom"],
            description: "Issue tracker type",
          },
          // GitHub options
          githubRepo: {
            type: "string",
            description: "GitHub repository (owner/repo)",
          },
          githubToken: {
            type: "string",
            description: "GitHub token or $ENV_VAR reference",
          },
          // Jira options
          jiraBaseUrl: {
            type: "string",
            description: "Jira base URL",
          },
          jiraToken: {
            type: "string",
            description: "Jira API token or $ENV_VAR reference",
          },
          jiraEmail: {
            type: "string",
            description: "Jira account email",
          },
          // GitLab options
          gitlabBaseUrl: {
            type: "string",
            description: "GitLab base URL",
          },
          gitlabToken: {
            type: "string",
            description: "GitLab token or $ENV_VAR reference",
          },
          gitlabProjectId: {
            type: "string",
            description: "GitLab project ID or path",
          },
          // Linear options
          linearToken: {
            type: "string",
            description: "Linear API token or $ENV_VAR reference",
          },
          // Custom options
          customApiUrl: {
            type: "string",
            description: "Custom API URL with {{ticketId}} placeholder",
          },
          customHeaders: {
            type: "object",
            description: "Custom headers for API requests",
          },
          // Common options
          ticketPattern: {
            type: "string",
            description: "Regex pattern to extract ticket IDs",
          },
          cacheTimeout: {
            type: "integer",
            minimum: 0,
            description: "Cache timeout in seconds (0 to disable)",
          },
          allowClosed: {
            type: "boolean",
            description: "Allow references to closed issues",
          },
          warnOnClosed: {
            type: "boolean",
            description: "Warn (not error) when issue is closed",
          },
          offline: {
            type: "boolean",
            description: "Skip API validation (offline mode)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidTicket: "Ticket '{{ticketId}}' does not exist in {{tracker}}.",
      closedTicket: "Ticket '{{ticketId}}' is closed. Consider removing this TODO/FIXME.",
      unreachableTracker: "Could not reach {{tracker}} to validate '{{ticketId}}'. Check configuration.",
      missingConfig: "Issue tracker validation enabled but '{{field}}' is not configured.",
      authFailed: "Authentication failed for {{tracker}}. Check token configuration.",
      rateLimited: "Rate limited by {{tracker}}. Ticket '{{ticketId}}' validation skipped.",
    },
  },

  create(context) {
    const options = context.options[0] || {};

    // Skip if offline mode or no tracker configured
    if (options.offline || !options.tracker) {
      return {};
    }

    const ticketPattern = new RegExp(
      options.ticketPattern || "[A-Z]+-\\d+|#\\d+|GH-\\d+",
      "gi"
    );
    const allowClosed = options.allowClosed !== false;
    const warnOnClosed = options.warnOnClosed !== false;

    const sourceCode = context.getSourceCode();

    // Create tracker client
    let client;
    try {
      client = createClient(options);
    } catch (err) {
      // Invalid tracker configuration
      return {
        Program(node) {
          context.report({
            node,
            messageId: "missingConfig",
            data: { field: "tracker" },
          });
        },
      };
    }

    // Collect all tickets to validate
    const ticketsToValidate = new Map();

    /**
     * Extract ticket IDs from a comment
     * @param {Object} comment - ESLint comment object
     */
    function extractTickets(comment) {
      const text = comment.value;

      // Only check TODO/FIXME comments
      if (!/\b(TODO|FIXME)\b/i.test(text)) {
        return;
      }

      // Find all ticket references
      ticketPattern.lastIndex = 0;
      let match;
      while ((match = ticketPattern.exec(text)) !== null) {
        const ticketId = match[0];

        // Store comment location for reporting
        if (!ticketsToValidate.has(ticketId)) {
          ticketsToValidate.set(ticketId, []);
        }
        ticketsToValidate.get(ticketId).push(comment);
      }
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        for (const comment of comments) {
          extractTickets(comment);
        }
      },

      async "Program:exit"(node) {
        // Validate all tickets
        for (const [ticketId, comments] of ticketsToValidate) {
          let result;

          try {
            result = await client.validateTicket(ticketId);
          } catch (err) {
            result = { error: "unreachable", message: err.message };
          }

          // Handle errors
          if (result.error) {
            const comment = comments[0];

            if (result.error === "missingConfig") {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "missingConfig",
                data: { field: result.field },
              });
            } else if (result.error === "authFailed") {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "authFailed",
                data: { tracker: options.tracker },
              });
            } else if (result.error === "rateLimited") {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "rateLimited",
                data: { tracker: options.tracker, ticketId },
              });
            } else if (result.error === "unreachable") {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "unreachableTracker",
                data: { tracker: options.tracker, ticketId },
              });
            }
            continue;
          }

          // Handle non-existent tickets
          if (!result.exists) {
            for (const comment of comments) {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "invalidTicket",
                data: { ticketId, tracker: options.tracker },
              });
            }
            continue;
          }

          // Handle closed tickets
          if (result.closed && !allowClosed) {
            for (const comment of comments) {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "closedTicket",
                data: { ticketId },
              });
            }
          } else if (result.closed && warnOnClosed) {
            for (const comment of comments) {
              context.report({
                node: null,
                loc: comment.loc,
                messageId: "closedTicket",
                data: { ticketId },
              });
            }
          }
        }
      },
    };
  },
};
