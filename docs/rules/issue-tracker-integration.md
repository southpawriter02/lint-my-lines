# issue-tracker-integration

Validate that ticket IDs referenced in TODO/FIXME comments exist in your issue tracker.

## Rule Details

This rule extracts ticket IDs from TODO and FIXME comments and validates them against external issue trackers (GitHub, Jira, GitLab, Linear, or custom APIs).

### Supported Trackers

| Tracker | Pattern Examples |
|---------|------------------|
| GitHub | `GH-123`, `#123` |
| Jira | `PROJ-123`, `ABC-456` |
| GitLab | `#123` |
| Linear | `ABC-123` |
| Custom | Configurable |

### Examples

❌ **Invalid** - Ticket doesn't exist:

```javascript
// TODO (GH-99999): This issue doesn't exist
function foo() {}
```

❌ **Warning** - Ticket is closed:

```javascript
// TODO (GH-42): This issue was closed
function bar() {}
```

✅ **Valid** - Ticket exists and is open:

```javascript
// TODO (GH-123): Implement error handling
function baz() {}
```

## Options

```json
{
  "lint-my-lines/issue-tracker-integration": ["warn", {
    "tracker": "github",
    "githubRepo": "owner/repo",
    "githubToken": "$GITHUB_TOKEN"
  }]
}
```

## Tracker Configuration

### GitHub

```json
{
  "tracker": "github",
  "githubRepo": "owner/repo",
  "githubToken": "$GITHUB_TOKEN"
}
```

| Option | Description |
|--------|-------------|
| `githubRepo` | Repository in `owner/repo` format |
| `githubToken` | Personal access token or `$ENV_VAR` reference |

### Jira

```json
{
  "tracker": "jira",
  "jiraBaseUrl": "https://company.atlassian.net",
  "jiraToken": "$JIRA_TOKEN",
  "jiraEmail": "user@company.com"
}
```

| Option | Description |
|--------|-------------|
| `jiraBaseUrl` | Jira instance URL |
| `jiraToken` | API token or `$ENV_VAR` reference |
| `jiraEmail` | Account email for authentication |

### GitLab

```json
{
  "tracker": "gitlab",
  "gitlabBaseUrl": "https://gitlab.com",
  "gitlabProjectId": "12345",
  "gitlabToken": "$GITLAB_TOKEN"
}
```

| Option | Description |
|--------|-------------|
| `gitlabBaseUrl` | GitLab instance URL |
| `gitlabProjectId` | Project ID or URL-encoded path |
| `gitlabToken` | Personal access token or `$ENV_VAR` reference |

### Linear

```json
{
  "tracker": "linear",
  "linearToken": "$LINEAR_TOKEN"
}
```

| Option | Description |
|--------|-------------|
| `linearToken` | API key or `$ENV_VAR` reference |

### Custom API

```json
{
  "tracker": "custom",
  "customApiUrl": "https://api.example.com/issues/{{ticketId}}",
  "customHeaders": {
    "Authorization": "Bearer $API_TOKEN"
  }
}
```

| Option | Description |
|--------|-------------|
| `customApiUrl` | URL with `{{ticketId}}` placeholder |
| `customHeaders` | Headers object (supports `$ENV_VAR` in values) |

## Common Options

These options apply to all trackers:

```json
{
  "ticketPattern": "[A-Z]+-\\d+",
  "cacheTimeout": 3600,
  "allowClosed": true,
  "warnOnClosed": true,
  "offline": false
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `ticketPattern` | `[A-Z]+-\\d+\|#\\d+\|GH-\\d+` | Regex to extract ticket IDs |
| `cacheTimeout` | `3600` | Cache duration in seconds (0 to disable) |
| `allowClosed` | `true` | Allow references to closed issues |
| `warnOnClosed` | `true` | Warn (not error) when issue is closed |
| `offline` | `false` | Skip API validation entirely |

## Environment Variables

Token options can reference environment variables using the `$VAR_NAME` syntax:

```json
{
  "githubToken": "$GITHUB_TOKEN"
}
```

The rule will resolve `$GITHUB_TOKEN` to `process.env.GITHUB_TOKEN` at runtime.

## Caching

API responses are cached in memory to avoid repeated requests:

- Default cache timeout: 1 hour (3600 seconds)
- Cache is per-ticket, not per-file
- Set `cacheTimeout: 0` to disable caching

## Messages

| Message ID | Description |
|------------|-------------|
| `invalidTicket` | Ticket '{{ticketId}}' does not exist in {{tracker}} |
| `closedTicket` | Ticket '{{ticketId}}' is closed. Consider removing TODO |
| `unreachableTracker` | Could not reach {{tracker}}. Check configuration |
| `missingConfig` | Issue tracker validation enabled but '{{field}}' is not configured |
| `authFailed` | Authentication failed for {{tracker}}. Check token |
| `rateLimited` | Rate limited by {{tracker}}. Validation skipped |

## CI/CD Integration

### GitHub Actions

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

steps:
  - run: npm ci
  - run: npx eslint .
```

### GitLab CI

```yaml
variables:
  GITLAB_TOKEN: $CI_JOB_TOKEN

lint:
  script:
    - npm ci
    - npx eslint .
```

## When Not to Use This Rule

- In offline development environments
- When API rate limits are a concern
- If tickets are managed informally (no external tracker)

## Related Rules

- [enforce-todo-format](./enforce-todo-format.md) - Enforce TODO format with references
- [enforce-fixme-format](./enforce-fixme-format.md) - Enforce FIXME format with references
- [todo-aging-warnings](./todo-aging-warnings.md) - Warn on old TODO comments
