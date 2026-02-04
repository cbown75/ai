# Document Types Reference

Type-specific guidance for creating documentation.

## How-To

Step-by-step instructions for accomplishing a task.

**When to use:**
- Installing or configuring software
- Completing a specific workflow
- Troubleshooting a common issue

**Structure:**
```markdown
# How to [Do Something]

Brief overview of what this guide accomplishes.

## Prerequisites

- Requirement 1
- Requirement 2

## Steps

### Step 1: [Action]

Explanation...

```bash
# command
```

### Step 2: [Action]

...

## Verification

How to verify success.

## Troubleshooting

Common issues and solutions.

## Related Notes

- [[Link]] - Connection explanation
```

**Tags:** `documentation/guides/[topic]`, `[domain]/[topic]`

## Reference

Technical reference material for lookup.

**When to use:**
- API documentation
- Configuration options
- Command reference
- Specifications

**Structure:**
```markdown
# [Topic] Reference

Brief description of what this reference covers.

## Overview

High-level explanation.

## [Section]

### [Subsection]

| Property | Type | Description |
|----------|------|-------------|
| ... | ... | ... |

## Examples

```yaml
# example configuration
```

## Related Notes

- [[Link]] - Connection explanation
```

**Tags:** `documentation/reference/[topic]`, `[domain]/[topic]`

## Concept

Conceptual explanations and architectural documentation.

**When to use:**
- Explaining how something works
- Architecture decisions
- Design patterns
- Theory/background

**Structure:**
```markdown
# [Concept Name]

Brief description.

## Overview

What is this and why does it matter?

## How It Works

Detailed explanation.

## Key Components

### [Component 1]

...

## Trade-offs

Pros and cons, alternatives considered.

## Related Notes

- [[Link]] - Connection explanation
```

**Tags:** `architecture/[system]/[aspect]`, `[domain]/concepts`

## Project

Documentation for active projects.

**When to use:**
- Project planning
- Implementation notes
- Progress tracking

**Structure:**
```markdown
# [Project Name]

Brief description of project goals.

## Status

- [ ] Phase 1
- [ ] Phase 2

## Goals

What this project aims to accomplish.

## Approach

How we're implementing this.

## Resources

- Links
- Related docs

## Related Notes

- [[Link]] - Connection explanation
```

**Tags:** `projects/[project-name]`, `[domain]/[topic]`

## Runbook

Operational procedures for recurring tasks.

**When to use:**
- On-call procedures
- Deployment processes
- Incident response
- Maintenance tasks

**Structure:**
```markdown
# [Procedure Name] Runbook

When to use this runbook.

## Prerequisites

- Access requirements
- Tools needed

## Procedure

### Step 1: [Action]

```bash
command
```

Expected output:
```
...
```

### Step 2: [Action]

...

## Rollback

How to undo if needed.

## Escalation

When and how to escalate.

## Related Notes

- [[Link]] - Connection explanation
```

**Tags:** `operations/runbooks/[service]`, `[domain]/[topic]`
