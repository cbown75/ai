---
name: ticket-tracker
description: |
  Automates ticket lifecycle for development projects. Creates tickets with smart defaults, prompts for missing info, and auto-updates status when PRs are created. Use when creating tickets, linking work to epics, or managing ticket state transitions.
---

<objective>
Streamline ticket management with intelligent defaults, interactive prompts for missing information, and automated status transitions tied to Git/PR workflows.
</objective>

<!-- CUSTOMIZE: Replace ALL values in this section with your actual project data -->
<constants>
**Default Project:** `{{PROJECT_KEY}}`

<!-- CUSTOMIZE: List your Jira/Linear/etc. projects -->
**Common Projects:**
| Key | Name |
|-----|------|
| {{PROJECT_KEY}} | Primary project |

<!-- CUSTOMIZE: Update status transitions to match your workflow -->
**Status Transitions:**
| ID | Name | When to Use |
|----|------|-------------|
| 11 | Backlog | New ticket, not yet prioritized |
| 21 | Selected for Development | Prioritized, ready to start |
| 31 | In Progress | Actively working on it |
| 51 | Ready to Deploy | PR created, awaiting merge/deploy |
| 41 | Done | Work complete, deployed |

**Active Epics (run discovery to get current list):**

<!-- CUSTOMIZE: Add your active epics or remove if not using epics -->
**NOTE:** Run epic discovery command to get current list - epics change quarterly.
When using AskUserQuestion for epic, include:
- Active epics from discovery
- "None (no epic)"
- "Other (I'll provide the epic key)"
</constants>

<ticket_creation>
## Creating a Ticket

**Required information:**
- Summary (title) - MUST be provided by user

**Smart defaults:**
- Project: `{{PROJECT_KEY}}` (unless specified)
- Issue Type: `Story` **ALWAYS** (only use Task/Bug if user explicitly requests)
- Assignee: **ASK** (do not auto-assign on creation)
- Initial Status: `Backlog` (unless actively working, then `In Progress`)
- Parent Epic: **Check first, then ask if not obvious** (see Epic Discovery below)
- Description: generate from context if not provided

<!-- CUSTOMIZE: Update the epic discovery query for your project -->
**Epic Discovery (do this BEFORE asking):**
1. Check if user mentioned an epic in their request
2. Check if working on a branch linked to a ticket that has an epic
3. List active epics via CLI
4. If an obvious epic is found, propose it for confirmation
5. If NO obvious epic, THEN use AskUserQuestion with epic options

**Assignee:** Always ask before creating (don't auto-assign)

**When information is missing, use AskUserQuestion:**

```
Questions to ask when creating a ticket:

1. Assignee (ALWAYS ask unless user specified):
   - "Who should this be assigned to?"
   - Options: Me, Unassigned, Other

2. Epic linkage (ALWAYS ask for feature work):
   - "Should this be linked to an epic?"
   - Options: [Run epic discovery first], None, Other

3. Project (only if working outside typical scope):
   - "Which project should this ticket be in?"
```

**Issue Type Selection (STRICT):**
- **Story**: Use for ALL tickets unless user explicitly says "Task" or "Bug"
- **Task**: ONLY when user literally says "create a task"
- **Bug**: ONLY when user literally says "create a bug"

**DO NOT infer Task or Bug from context. When in doubt, use Story.**

**Description Generation:**
If user doesn't provide description, generate one from conversation context:
- What problem does this solve?
- What changes are being made?
- Any technical details discussed
</ticket_creation>

<quick_operations>
## Common Operations

**Create ticket and start working:**
```
1. Create ticket with summary/description
2. Create branch (conventional format via git-conventions skill)
3. Assign to user
4. Transition to "In Progress"
5. Comment on ticket with branch name for linkage
```

<!-- CUSTOMIZE: Update CLI commands for your ticket system (Jira, Linear, etc.) -->
**Link existing ticket to epic:**
```bash
# Example using Atlassian CLI (acli):
acli jira workitem edit --key TICKET-XX --from-json '{"fields":{"parent":{"key":"EPIC-KEY"}}}' -y
```
</quick_operations>

<prompting_behavior>
## When to Prompt vs Use Defaults

**Epic linkage workflow:**
1. First, try to discover the epic automatically
2. If found, propose it for confirmation
3. If NOT found, use AskUserQuestion with epic options
4. Never skip epic linkage entirely - every Story needs an epic or explicit "None"

**MUST prompt for:**
- Assignee - ALWAYS ask who to assign (use AskUserQuestion)

**Apply without asking (but mention in output):**
- Project: {{PROJECT_KEY}} (unless user specified otherwise)
- Issue type: Story (ALWAYS Story unless user explicitly said Task/Bug)

**Infer from context:**
- Initial status: "In Progress" if user says "I'm working on..." or "create a PR for..."
- Description: Generate from conversation if user describes the work

**Never assume:**
- Issue type is Task or Bug (default to Story)
- Whether work is complete (don't auto-transition to Done)
</prompting_behavior>

<!-- CUSTOMIZE: Replace with your ticket system's CLI tool and commands.
     Examples below use Atlassian CLI (acli) for Jira.
     Adapt for Linear, GitHub Issues, Azure DevOps, etc. -->
<api_reference>
## CLI-First: Ticket Management

**Prefer CLI tools for all ticket operations.** Fall back to MCP only when CLI cannot accomplish the task.

### Example: Atlassian CLI (acli) Commands

**Create ticket:**
```bash
acli jira workitem create \
  --project {{PROJECT_KEY}} \
  --type Story \
  --summary "Title" \
  --description "Description" \
  --assignee "{{YOUR_EMAIL}}"
```

**View ticket:**
```bash
acli jira workitem view TICKET-XX --json
```

**Assign ticket:**
```bash
acli jira workitem assign --key TICKET-XX --assignee "@me" -y
```

**Transition ticket:**
```bash
acli jira workitem transition --key TICKET-XX --status "In Progress" -y
acli jira workitem transition --key TICKET-XX --status "Ready to Deploy" -y
acli jira workitem transition --key TICKET-XX --status "Done" -y
```

**Add comment (for PR linkage):**
```bash
acli jira workitem comment create --key TICKET-XX --body "PR created: https://github.com/..."
```

**Search tickets:**
```bash
acli jira workitem search --jql 'assignee = currentUser() AND NOT status = Done' --json
```
</api_reference>

<error_handling>
## Authentication Errors

If CLI commands fail with authentication errors:

1. **Check auth status:**
   ```bash
   acli jira auth status
   ```

2. **Re-authenticate if needed:**
   ```bash
   acli jira auth login --web
   ```

3. **If auth fails repeatedly:** Ask user to check their credentials.
</error_handling>

<success_criteria>
This skill is working correctly when:
- Tickets are created with minimal user input (smart defaults applied)
- User is prompted for genuinely missing info (epic, non-obvious fields)
- PR creation auto-updates ticket status
- Ticket status reflects actual work state
- Workflow integrates seamlessly with dev-workflow and git-conventions skills
</success_criteria>
