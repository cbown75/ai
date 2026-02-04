# Reference Template

```markdown
---
tags:
  - documentation/reference/[topic]
  - [domain]/[topic]
date: {{DATE}}
type: reference
---

# [Topic] Reference

Brief description of what this reference covers and when to consult it.

## Overview

High-level explanation of the technology/concept and its purpose.

## [Main Section]

### [Subsection]

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | - | Description |
| `enabled` | boolean | `true` | Description |
| `count` | integer | `10` | Description |

### [Another Subsection]

**Description:** What this section covers.

```yaml
# example configuration
key: value
nested:
  property: value
```

## Configuration Options

### Required Settings

| Setting | Description |
|---------|-------------|
| `required_option` | Must be set for... |

### Optional Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `optional_option` | `default` | Used for... |

## Examples

### Basic Example

```yaml
# minimal configuration
basic:
  setting: value
```

### Advanced Example

```yaml
# full configuration with all options
advanced:
  setting: value
  optional:
    nested: config
```

## Common Use Cases

### Use Case 1: [Description]

```yaml
# configuration for use case 1
```

### Use Case 2: [Description]

```yaml
# configuration for use case 2
```

## Notes

- Important consideration 1
- Important consideration 2
- Gotcha to be aware of

## Related Notes

- [[Related Reference]] - Complementary information
- [[How-To Guide]] - Practical application of this reference
- [[Concept Explanation]] - Background context
```
