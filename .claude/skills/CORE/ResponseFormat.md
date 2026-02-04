# Response Format

Output templates for different scenarios. Use the appropriate format, but don't force structure where it doesn't help.

---

## The Golden Rule

**Match response complexity to question complexity.**

Simple question -> Simple answer. No ceremony.
Complex task -> Structured output. Clear sections.

---

## Quick Answers

For simple, direct questions. No template needed.

**Q:** "What's the production cluster context?"
**A:** `prod-cluster`

**Q:** "Where are the Helm charts?"
**A:** `Charts/` directory, organized by component.

**Q:** "Is Flux healthy?"
**A:**
```bash
flux check
```

---

## Implementation Tasks

When you've done something that changes state.

```markdown
## What I Did
[1-2 sentence summary of the action taken]

## Changes
[Specific changes - files modified, resources created, commands run]

## Verification
[Command or check to confirm it worked]

## Notes
[Optional: anything to watch out for, follow-up needed]
```

---

## Troubleshooting

When diagnosing and fixing issues.

```markdown
## Problem
[One line: what's broken]

## Evidence
[What you found - logs, metrics, events]

## Root Cause
[Why it's broken]

## Fix
[What you did or what needs to be done]

## Prevention
[Optional: how to avoid this in the future]
```

---

## Health Checks

For cluster/infrastructure status reports.

```markdown
# [Environment] Health Check
**Timestamp:** YYYY-MM-DD HH:MM:SS
**Status:** HEALTHY | DEGRADED | CRITICAL

## Summary
| Metric | Value |
|--------|-------|
| Total Pods | X |
| Healthy | X |
| Issues | X |

## Critical Issues
[List with details, or "None"]

## Warnings
[List with details, or "None"]

## Recommendations
[Prioritized action items]
```

---

## Analysis

When investigating options or explaining something complex.

```markdown
## Context
[What we're analyzing and why]

## Findings
[What you discovered - data, patterns, observations]

## Options
[If applicable: different approaches with trade-offs]

| Option | Pros | Cons |
|--------|------|------|
| A | ... | ... |
| B | ... | ... |

## Recommendation
[What I'd do and why]
```

---

## Documentation Creation

When creating Obsidian documentation, always follow the vault skill standards.

**Required frontmatter:**
```yaml
---
tags:
  - category/subcategory
  - category/subcategory
date: YYYY-MM-DD HH:MM:SS
type: how-to | reference | concept | project | runbook
---
```

**Required sections:**
- H1 title matching filename
- Content with proper heading hierarchy
- Related Notes section with explanations

---

## Asking Clarifying Questions

When you need information before proceeding.

**Format:**
> [Context for why you're asking]
>
> [Specific question]
>
> [Options if applicable]

**Example:**
> This change affects deployment behavior.
>
> Which environment should I target?
> - Dev (safe to break)
> - Staging (production mirror)
> - Production (requires extra confirmation)

**Keep it brief.** Don't write a paragraph when a sentence works.

---

## Error Responses

When something fails or can't be done.

**Format:**
> **Failed:** [What went wrong]
>
> **Reason:** [Why]
>
> **Fix:** [What to do about it, if anything]

---

## When NOT to Use Templates

- Simple yes/no questions
- Quick lookups
- Single-command answers
- Casual conversation
- When the structure would be longer than the content

**Bad:**
```markdown
## What I Did
Retrieved the cluster context.

## Result
prod-cluster

## Verification
N/A
```

**Good:**
> `prod-cluster`

---

## Anti-Patterns

| Don't | Why | Instead |
|-------|-----|---------|
| Empty sections | Wastes space | Omit if nothing to say |
| Repetitive summaries | User already knows | Get to the point |
| Over-structured simple answers | Patronizing | Match complexity |
| Headers for one-liners | Visual noise | Just answer |
| "Let me explain..." intros | Filler | Start with the explanation |
