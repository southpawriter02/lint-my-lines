# Feature: Configurable Rules

**Parent**: [Core Features](../ROADMAP.md#core-features)

## 1. Summary

This feature will introduce a configuration system that allows users to customize the behavior of ESLint rules in `lint-my-lines`. Many comment style guidelines are subjective, and providing options for rules will make the plugin more flexible and adaptable to different team preferences.

## 2. Motivation

The primary motivation for this feature is to increase the utility and adoption of the plugin. A one-size-fits-all approach to comment styling doesn't work for everyone. By allowing users to tailor the rules to their needs, we can make `lint-my-lines` a more powerful and appealing tool for a wider audience.

## 3. Intended Functionality

Each rule that has customizable aspects will be updated to accept an options object in the `.eslintrc` configuration file.

### Example: `enforce-todo-format`

The existing `enforce-todo-format` rule could be extended to allow users to define their own `TODO` format using a regex pattern.

```json
{
  "plugins": [
    "lint-my-lines"
  ],
  "rules": {
    "lint-my-lines/enforce-todo-format": [
      "warn",
      {
        "pattern": "^TODO\\s*\\([^)]+\\):\\s*\\w+"
      }
    ]
  }
}
```

In this example, the user has provided a custom pattern for `TODO` comments. The rule would use this pattern for validation instead of the default one.

## 4. Requirements

- **Schema Definition:** Each configurable rule must have a JSON schema that defines the shape of its options object. This is crucial for validation and for providing clear error messages when the configuration is invalid.
- **Default Options:** Every rule should have a sensible set of default options, ensuring that it remains functional out-of-the-box without any configuration.
- **Documentation:** The documentation for each rule must be updated to clearly explain the available options, their purpose, and how to configure them.

## 5. Limitations and Dependencies

- **Dependency:** This feature relies on ESLint's built-in support for rule configuration. No external dependencies are required.
- **Limitation:** The complexity of configuration will be limited by what can be expressed in a JSON format. For highly complex or dynamic configurations, users may need to fork the plugin.

## 6. Implementation Sketch

1.  **Update Rule Metadata:** Modify the `meta.schema` property in the rule definition to include the JSON schema for the options.
2.  **Access Options:** In the `create` function of the rule, access the user-provided options from the `context.options` array.
3.  **Apply Logic:** Use the options to modify the rule's behavior. For example, use a custom regex pattern if one is provided, or fall back to the default.
4.  **Update Documentation:** Add a new "Options" section to the rule's documentation.
5.  **Add Tests:** Create new test cases to verify that the rule behaves correctly with different configurations.
