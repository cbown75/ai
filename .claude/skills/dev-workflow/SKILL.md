---
name: dev-workflow
description: |
  Orchestrates Git and ticket tracker workflows for development. Use when starting work, creating branches, committing, or creating PRs. Coordinates the git-conventions and ticket-tracker skills. Uses conventional commits throughout.
---

<objective>
Provide a unified workflow for development that integrates Git conventions (git-conventions skill) with ticket management (ticket-tracker skill). This is the entry point for development work that needs ticket tracking.
</objective>

<when_to_use>
Invoke this skill when:
- Starting new work that needs a tracking ticket
- User wants to "start working on X"
- Committing and creating a PR with ticket linkage
- Any development workflow that involves both git and ticket tracking
</when_to_use>

<mandatory_skill_invocation>
## CRITICAL: Invoke Child Skills Before Operations

**You MUST invoke child skills using the Skill tool before performing their operations.**

### Before Ticket Operations -> Invoke `/ticket-tracker`
```
Skill tool -> skill: "ticket-tracker"
```
Then you'll have:
- Correct CLI command syntax
- Status transition IDs
- Epic discovery commands
- Project defaults

### Before Git Operations -> Invoke `/git-conventions`
```
Skill tool -> skill: "git-conventions"
```
Then you'll have:
- Branch naming format (conventional: `feat/description`)
- Commit message format (conventional: `feat: description`)
- Attribution rules
- Stale branch detection

### Why This Matters
Without loading child skills, you will:
- Use wrong command flags and waste time
- Forget conventions
- Miss context (epic linkage, status IDs)

**DO NOT skip this step. Load the skill, then execute.**
</mandatory_skill_invocation>

<workflow_starting_work>
## Starting Work (Branch Creation)

**When user wants to start work:**

### Step 1: Check for existing ticket
- Did user provide a ticket number?
- Is there a ticket in the conversation context?

### Step 2: If no ticket -> invoke ticket-tracker skill
The ticket-tracker skill handles:
- Epic discovery and selection
- Assignee prompting
- Ticket creation with smart defaults

### Step 3: Create branch (git-conventions skill handles format)
```bash
# Branch uses conventional format
git checkout -b feat/description-of-work
```

### Step 4: Update ticket -> ticket-tracker skill
- Assign to user
- Transition to "In Progress"
- Add branch name as comment (for linkage)

### Flow Diagram
```
User: "I need to fix the login validation bug"
  |
  +- Check for ticket -> None found
  |
  +- ticket-tracker skill: Create ticket
  |   +- Search epics
  |   +- Ask assignee
  |   +- Create ticket
  |
  +- git-conventions skill: Create branch
  |   +- git checkout -b fix/login-validation
  |
  +- ticket-tracker skill: Update ticket
      +- Assign
      +- Transition "In Progress"
      +- Comment with branch name
```
</workflow_starting_work>

<workflow_committing>
## Committing Changes

### Step 1: Stage and commit (git-conventions skill handles format)
- Stage specific files (never `git add .`)
- Conventional commit format: `type: message`
- Follow attribution rules

### Flow Diagram
```
User: "commit these changes"
  |
  +- Stage specific files
  |
  +- git-conventions skill: Commit
      +- "fix: resolve login validation logic"
```
</workflow_committing>

<workflow_pr>
## Creating Pull Request

### Step 1: Create PR (git-conventions skill handles format)
- Title: conventional format (`fix: description`)
- Body: Summary + Test plan + ticket reference
- Open in browser after creation

### Step 2: Update ticket -> ticket-tracker skill
- Transition to "Ready to Deploy" (or equivalent)
- Add comment with PR URL

### Flow Diagram
```
User: "create a PR for this"
  |
  +- git-conventions skill: Create PR
  |   +- "fix: resolve login validation"
  |   +- Body includes ticket reference
  |
  +- Open in browser
  |
  +- ticket-tracker skill: Update ticket
      +- Transition "Ready to Deploy"
      +- Comment with PR URL
```
</workflow_pr>

<workflow_complete>
## Complete Development Cycle

```
1. START WORK -> /dev-workflow "fix login bug"
   +- ticket-tracker: Create ticket
   +- git-conventions: Create branch fix/login-validation
   +- ticket-tracker: Transition "In Progress"

2. DO WORK -> (user makes code changes)

3. COMMIT -> conventional commit
   +- git-conventions: "fix: resolve login validation"

4. CREATE PR -> /dev-workflow "create pr"
   +- git-conventions: Create PR, open browser
   +- ticket-tracker: Transition "Ready to Deploy"

5. AFTER MERGE -> ticket-tracker skill
   +- Transition "Done"
```
</workflow_complete>

<skill_delegation>
## Skill Responsibilities

| Task | Skill | What it does |
|------|-------|--------------|
| Git format validation | `/git-conventions` | Conventional commits, branch naming, no attribution |
| Ticket operations | `/ticket-tracker` | Create, transition, assign, comment |
| Orchestration | `/dev-workflow` | Coordinates both, knows the workflow order |

**This skill (dev-workflow) invokes the others as needed. The child skills stay single-purpose.**
</skill_delegation>

<success_criteria>
This skill is working correctly when:
- User can say "start working on X" and get a ticket + branch created
- All commits use conventional commit format
- User can create PR and ticket is automatically updated
- No manual ticket updates needed during normal dev workflow
- git-conventions and ticket-tracker skills are invoked at the right times
</success_criteria>
