# Claude Code Customization Starter Kit

A battle-tested collection of Claude Code skills, agents, commands, hooks, and scripts for infrastructure engineers. Includes a complete Obsidian knowledge management system, development workflow automation, tool governance, and a foundational CORE skill that defines how Claude operates.

## What's Included

```
.claude/
  hooks/
    tool-governance.ts                        # PreToolUse hook - security validation & MCP blocking
    lib/
      hook-utils.ts                           # Shared hook utilities (stdin, parsing, fail-open)
  scripts/
    vault-indexer.ts                          # Bun script - builds JSON indices from vault
  agents/
    obsidian-work-logger.md                   # Subagent - daily work activity logging
    vault-indexer.md                          # Subagent - runs the indexer script
    vault-search-agent.md                    # Subagent - executes vault searches (used by /vault-search)
    vault-update-agent.md                    # Subagent - creates/updates docs (used by /vault-update)
    vault-researcher.md                      # Subagent - searches vault for existing knowledge before research
  commands/
    vault-search.md                          # /vault-search - search vault via index
    vault-update.md                          # /vault-update - create/update docs
    vault-reindex.md                         # /vault-reindex - rebuild indices
  skills/
    CORE/
      SKILL.md                               # Identity, principles, algorithms, operating rules
      CONSTITUTION.md                        # Founding principles and architectural patterns
      VOICE.md                               # Communication patterns and personality calibration
      ResponseFormat.md                      # Output templates for different scenarios
      StackPreferences.md                    # Technology hierarchy and decisions
      references/
        mcp-servers.md                       # MCP server reference with CLI alternatives
    dev-workflow/
      SKILL.md                               # Development lifecycle orchestrator
    git-conventions/
      SKILL.md                               # Conventional commits, branch naming, PR workflow
    ticket-tracker/
      SKILL.md                               # Ticket lifecycle with smart defaults
    obsidian-vault/
      SKILL.md                               # Core documentation standards (PARA, tags, etc.)
    vault-search/
      SKILL.md                               # Search skill with jq queries and workflows
      references/
        search-strategies.md                 # Domain-specific search hints
      workflows/
        search-files.md                      # File search workflow
        search-tags.md                       # Tag lookup workflow
    vault-update/
      SKILL.md                               # Documentation creation/update skill
      references/
        document-types.md                    # Type-specific guidance (how-to, reference, etc.)
        para-decision-tree.md                # PARA placement logic
      templates/
        how-to.md                            # How-to document template
        reference.md                         # Reference document template
      workflows/
        create-documentation.md              # New doc workflow
        update-documentation.md              # Update doc workflow
        analyze-and-document.md              # Source analysis workflow
```

## Components

### CORE System

| Component | Type | Purpose |
|-----------|------|---------|
| `CORE` | Skill | Identity, principles, foundational algorithm, operating rules, stack preferences |
| `CONSTITUTION.md` | Reference | Founding principles and architectural patterns |
| `VOICE.md` | Reference | Communication patterns and personality calibration |
| `ResponseFormat.md` | Reference | Output templates for different response scenarios |
| `StackPreferences.md` | Reference | Technology hierarchy, language preferences, observability stack |
| `mcp-servers.md` | Reference | MCP server list with CLI-first alternatives |

### Development Workflow

| Component | Type | Purpose |
|-----------|------|---------|
| `dev-workflow` | Skill | Orchestrates the full development lifecycle (git + tickets + code) |
| `git-conventions` | Skill | Conventional commits, branch naming, PR workflow, attribution rules |
| `ticket-tracker` | Skill | Ticket creation with smart defaults, status transitions, epic discovery |

### Tool Governance

| Component | Type | Purpose |
|-----------|------|---------|
| `tool-governance.ts` | Hook | PreToolUse security validation, MCP blocking, git workflow enforcement |
| `hook-utils.ts` | Library | Shared utilities for hooks (stdin reading, JSON parsing, fail-open pattern) |

### Obsidian Knowledge Management

| Component | Type | Purpose |
|-----------|------|---------|
| `vault-indexer.ts` | Script | Scans vault, extracts frontmatter/tags/links, builds 3 JSON index files |
| `vault-indexer` | Agent | Runs the indexer script and reports results |
| `vault-search-agent` | Agent | Executes vault searches invoked by `/vault-search` command |
| `vault-update-agent` | Agent | Creates/updates documentation invoked by `/vault-update` command |
| `vault-researcher` | Agent | Searches vault for existing knowledge before going to external sources |
| `obsidian-work-logger` | Agent | Extracts work activities from conversations, auto-tags, creates daily logs |
| `obsidian-vault` | Skill | Enforces PARA methodology, hierarchical tags, cross-linking, frontmatter standards |
| `vault-search` | Skill | Fast search using pre-built indices (titles, tags, links, content) |
| `vault-update` | Skill | Search-first documentation creation with tag validation and PARA placement |
| `/vault-search` | Command | Search vault by keyword, tag, date, path, or content |
| `/vault-update` | Command | Create or update documentation with guided workflow |
| `/vault-reindex` | Command | Rebuild all index files |

## CORE Skill

The CORE skill is the foundational operating system for Claude Code. It defines identity, principles, and behavioral patterns that every other skill inherits from.

### What It Provides

- **Identity** - A customizable personality and communication style (ships with a Gilfoyle-inspired example)
- **Foundational Algorithm** - A two-loop problem-solving framework (Current→Desired state + 7-phase scientific method)
- **Operating Rules** - CLI-first principle, when to ask vs. act, response philosophy
- **Stack Preferences** - Technology hierarchy for infrastructure, languages, observability
- **Content Governance** - What belongs in CORE vs. CLAUDE.md vs. individual skills

### Modular Structure

The CORE skill is split across multiple files so you can customize each aspect independently:

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill - identity, algorithm, operating rules, delegation |
| `CONSTITUTION.md` | Founding principles and architectural patterns |
| `VOICE.md` | How to communicate - brevity, precision, persona calibration |
| `ResponseFormat.md` | Output templates for tasks, troubleshooting, health checks, analysis |
| `StackPreferences.md` | Technology decisions - IaC, GitOps, languages, observability |
| `references/mcp-servers.md` | MCP server inventory with CLI-first alternatives |

### Customization

The CORE skill is heavily marked with `<!-- CUSTOMIZE -->` comments. Key areas to personalize:

- **Identity** - Replace the Gilfoyle persona with your own communication style
- **Stack preferences** - Update languages, infrastructure tools, observability stack
- **Environments** - Add your cluster contexts, domain names, network ranges
- **Skills table** - List your actual skills so CORE can delegate correctly
- **MCP servers** - List your configured MCP integrations

## Development Workflow

Three skills work together to automate the development lifecycle:

```
dev-workflow (orchestrator)
  +-- git-conventions (conventional commits, branches, PRs)
  +-- ticket-tracker (ticket creation, status transitions)
```

### git-conventions

Enforces [Conventional Commits](https://www.conventionalcommits.org/):
- **Commit format:** `type(scope): description` (feat, fix, docs, chore, refactor, test, ci, style, perf)
- **Branch naming:** `type/short-description` (e.g., `feat/add-auth`, `fix/login-error`)
- **PR workflow:** Creates PR via `gh`, opens in browser for review
- **Attribution rules:** Configurable Claude Co-Authored-By behavior

### ticket-tracker

Manages ticket lifecycle with smart defaults:
- Creates tickets with minimal input (smart defaults for project, type, status)
- Prompts for genuinely missing info (assignee, epic linkage)
- Auto-transitions status when PRs are created
- Ships with Atlassian CLI (`acli`) examples, adaptable to any ticket system

### dev-workflow

Orchestrates the full flow:
1. Create ticket (or find existing)
2. Create conventional branch
3. Code
4. Commit with conventional format
5. Create PR
6. Update ticket status

## How It Works

### The Index (Core Engine)

The `vault-indexer.ts` script scans every markdown file in your vault and produces three JSON files:

| Index File | Contents |
|------------|----------|
| `vault-index.json` | File metadata: path, title, modified date, size, tags, PARA category, summary, wikilinks, word count |
| `vault-tags.json` | Hierarchical tag tree with counts, flat sorted list, top 20 tags |
| `vault-links.json` | Outgoing links, incoming links (backlinks), orphan files |

These indices power fast search without scanning files at query time.

### Search Flow

1. User runs `/vault-search kubernetes deployment`
2. Command invokes the vault-search skill
3. Skill loads `vault-index.json`, searches titles -> summaries -> paths
4. Returns ranked results with previews

### Documentation Flow

1. User runs `/vault-update kubernetes deployment guide`
2. Command invokes vault-update skill
3. Skill searches for existing docs (prevent duplicates)
4. Queries tag registry for valid tags
5. Uses PARA decision tree for placement
6. Presents confirmation, then writes file

### Work Logging Flow

1. User says "log what I did today"
2. Work logger agent analyzes the conversation
3. Auto-detects technology tags from content
4. Checks for existing daily log (merges or creates)
5. Presents summary for confirmation, writes to vault

## Tool Governance Hook

A PreToolUse hook that validates every tool invocation before execution. Two-layer protection:

### Layer 1: MCP Tool Blocking

Blocks MCP tools that have better CLI/filesystem alternatives and redirects to the preferred method. Default configuration blocks Obsidian MCP search tools in favor of pre-built index files.

### Layer 2: Bash Command Security

Validates all Bash commands against a tiered security model. Each tier has an action (`block`, `warn`, or `log`):

| Tier | Category | Action | What It Catches |
|------|----------|--------|-----------------|
| 1 | Catastrophic | Block | `rm -rf /`, `dd`, `mkfs`, `diskutil erase` |
| 2 | Reverse Shell | Block | `bash -i >& /dev/tcp`, `nc -e /bin/sh`, `socat exec` |
| 3 | Remote Code Exec | Block | `curl \| sh`, `wget \| sh`, `base64 -d \| sh` |
| 4 | Prompt Injection | Block | `ignore previous instructions`, `system prompt:` |
| 5 | Data Exfiltration | Block | `curl --upload-file`, `tar \| curl` |
| 6 | Config Protection | Block | `rm -rf .claude/`, `rm .kube/config`, `rm .ssh/id_*` |
| 7 | GitHub Destructive | Block | `gh repo delete`, `gh repo edit --visibility public` |
| 8 | Git Destructive | Block | `git clean -f` |
| 9 | Kubernetes Destructive | Block | `kubectl delete`, `kubectl patch` |
| 10 | Terraform Destructive | Block | `terraform destroy`, `terraform state rm` |
| 11 | Helm Destructive | Block | `helm uninstall`, `helm delete` |
| 12 | Flux Destructive | Block | `flux uninstall`, `flux delete` |
| 13 | AWS Destructive | Block | `aws ec2 terminate`, `aws s3 rm`, `aws rds delete` |
| 14 | Env/Credentials | Warn | `export ANTHROPIC_API_KEY`, `printenv \| KEY` |
| 15 | System Modification | Log | `chmod 777`, `sudo`, `systemctl stop` |

### Layer 3: Git Workflow Enforcement

Blocks `git push` to `main`/`master` in non-dotfiles repositories, enforcing a feature branch workflow. Dotfiles repos are exempt (configurable).

### Command Chain Analysis

Commands chained with `&&`, `||`, `;`, or `|` are split into segments and each segment is validated independently. This prevents bypass attempts like `echo hello && rm -rf /`.

## Setup

### 1. Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- [Obsidian](https://obsidian.md/) vault
- [Bun](https://bun.sh/) runtime (for the indexer script)

### 2. Install the Files

Copy the `.claude/` directory into your home directory:

```bash
# Core system
cp -r .claude/skills/CORE ~/.claude/skills/        # Identity, principles, algorithms
cp -r .claude/hooks ~/.claude/                     # Tool governance hook + shared utilities

# Development workflow
cp -r .claude/skills/dev-workflow ~/.claude/skills/
cp -r .claude/skills/git-conventions ~/.claude/skills/
cp -r .claude/skills/ticket-tracker ~/.claude/skills/

# Obsidian knowledge management
cp -r .claude/scripts ~/.claude/
cp -r .claude/agents/*.md ~/.claude/agents/       # 5 agents: work-logger, indexer, search, update, researcher
cp -r .claude/commands/*.md ~/.claude/commands/    # 3 commands: search, update, reindex
cp -r .claude/skills/obsidian-vault ~/.claude/skills/
cp -r .claude/skills/vault-search ~/.claude/skills/
cp -r .claude/skills/vault-update ~/.claude/skills/
```

Or if you use a dotfiles repo, copy the `.claude/` tree into your dotfiles.

You can install components individually - each section above is independent.

### 3. Configure Your Vault Path

Every file that references the vault path uses `{{VAULT_PATH}}` as a placeholder. Replace it everywhere:

```bash
# Find all files with the placeholder
grep -r '{{VAULT_PATH}}' .claude/

# Replace with your actual path (example for macOS iCloud)
# On macOS: sed -i '' | On Linux: sed -i
find .claude -name '*.md' -o -name '*.ts' | xargs sed -i '' 's|{{VAULT_PATH}}|/Users/yourname/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName|g'
```

**Common vault paths:**
- macOS (local): `/Users/yourname/Documents/Obsidian`
- macOS (iCloud): `/Users/yourname/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName`
- Linux: `/home/yourname/obsidian-vault`

The indexer script (`vault-indexer.ts`) has its own `VAULT_PATH` constant at the top of the file - update that too.

### 4. Customize Your Setup

Search for `<!-- CUSTOMIZE -->` comments across all files. Every personal decision point is marked.

**Placeholders to replace:**

| Placeholder | Where Used | What to Set |
|-------------|-----------|-------------|
| `{{YOUR_COMPANY}}` | work-logger, vault skill, search strategies | Your company/team name |
| `{{YOUR_PROJECT}}` | work-logger, search strategies | Your active project names |
| `{{your-company}}` | search strategies, tag categories | Lowercase version for tags |
| `{{PROJECT_KEY}}` | ticket-tracker | Your ticket system project key (e.g., PROJ) |
| `{{YOUR_EMAIL}}` | ticket-tracker | Your email for ticket assignment |

**CORE skill customization:**
- **Identity** - `CORE/SKILL.md` `<identity>` section - replace the Gilfoyle persona or keep it
- **Stack preferences** - `CORE/StackPreferences.md` - update to your actual tech stack
- **Environments** - `CORE/SKILL.md` `<environments>` section - add your clusters and contexts
- **Skills table** - `CORE/SKILL.md` `<domain_skills>` section - list the skills you've installed
- **MCP servers** - `CORE/references/mcp-servers.md` - list your configured MCP integrations

**Development workflow customization:**
- **Ticket system** - `ticket-tracker/SKILL.md` - adapt CLI commands for your system (Jira, Linear, GitHub Issues, etc.)
- **Status transitions** - `ticket-tracker/SKILL.md` `<constants>` section - match your workflow states
- **Attribution** - `git-conventions/SKILL.md` `<attribution>` section - enable/disable Claude Co-Authored-By

**Vault customization:**
- **Technology tags** in the work logger's `<auto-tagging>` section
- **Tag categories** in the obsidian-vault skill's `<standard-categories>`
- **Search strategies** in `vault-search/references/search-strategies.md`
- **PARA examples** in `vault-update/references/para-decision-tree.md`

### 5. Build the Initial Index

```bash
bun ~/.claude/scripts/vault-indexer.ts
```

This creates the three JSON index files inside your vault's `.claude/` directory.

### 6. Add Vault Path to Claude Code Permissions

Add your vault path to `~/.claude/settings.json` so tools can read/write without prompting:

```json
{
  "permissions": {
    "allow": [
      "Read(~/Library/Mobile Documents/iCloud~md~obsidian/Documents/**)",
      "Bash(bun ~/.claude/scripts/vault-indexer.ts)"
    ]
  }
}
```

### 7. Register the Tool Governance Hook

Add the PreToolUse hook to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bun ~/.claude/hooks/tool-governance.ts"
          }
        ]
      }
    ]
  }
}
```

The empty `matcher` string means the hook runs for **every** tool invocation. The hook itself decides what to block based on tool name and command content.

**How it works:**
- Exit code `0` = allow the tool call
- Exit code `2` = block the tool call (message shown to Claude)
- On unexpected errors, the hook fails open (exit 0) so it never breaks your workflow

### 8. Vault Directory Structure

The system expects PARA methodology in your vault:

```
YourVault/
  Projects/           # Active projects with timelines
  Areas/              # Ongoing responsibilities
  Resources/          # Timeless reference material
  Archive/            # Completed/historical
  Notes/
    Work Notes/       # Daily work logs (YYYY/MM-MMMM/YYYY-MM-DD.md)
```

Directories are created automatically as needed.

## Hosting Your Obsidian Vault on iCloud

iCloud provides seamless sync across Apple devices and works as a free backend for Obsidian.

### Initial Setup

1. **Create the vault in iCloud:**
   - Open Obsidian
   - Click "Create new vault"
   - Name your vault (e.g., `Obsidian`)
   - Toggle **"Store in iCloud Drive"** ON
   - Click "Create"

2. **Locate the vault path:**
   ```
   ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName/
   ```
   This is the path you'll use for `{{VAULT_PATH}}`.

3. **Verify access from terminal:**
   ```bash
   ls ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/
   ```

### Sync Across Devices

- **Mac to Mac**: Automatic via iCloud Drive.
- **Mac to iPhone/iPad**: Install Obsidian on iOS, open the vault from iCloud. Obsidian's iOS app natively supports iCloud vaults.
- **Sync timing**: Near-instant on the same network, may lag on slow connections.

### Tips

- **Don't use both iCloud AND Obsidian Sync** - pick one sync mechanism. Using both causes conflicts.
- **The `Mobile Documents` path has spaces** - escape the space (`Mobile\ Documents`) or quote the full path in terminal commands.
- **iCloud may evict files** - macOS can offload vault files to free disk space. Right-click the vault folder in Finder and select "Download Now" to force local copies.
- **Index files stay local** - The `.claude/` directory inside your vault (where indices live) syncs via iCloud too, so all machines share the same index.

## Updating Skills, Commands, and Scripts

### Quick Reference

| What to Change | File(s) to Edit |
|----------------|-----------------|
| **CORE** | |
| Change personality/identity | `.claude/skills/CORE/SKILL.md` (`<identity>`) |
| Modify operating principles | `.claude/skills/CORE/CONSTITUTION.md` |
| Adjust communication style | `.claude/skills/CORE/VOICE.md` |
| Change response templates | `.claude/skills/CORE/ResponseFormat.md` |
| Update technology stack | `.claude/skills/CORE/StackPreferences.md` |
| Add/remove MCP servers | `.claude/skills/CORE/references/mcp-servers.md` |
| **Development Workflow** | |
| Change commit types | `.claude/skills/git-conventions/SKILL.md` (`<commit_format>`) |
| Change branch naming | `.claude/skills/git-conventions/SKILL.md` (`<branch_naming>`) |
| Change ticket defaults | `.claude/skills/ticket-tracker/SKILL.md` (`<constants>`) |
| Change ticket CLI commands | `.claude/skills/ticket-tracker/SKILL.md` (`<api_reference>`) |
| Modify dev lifecycle flow | `.claude/skills/dev-workflow/SKILL.md` (`<standard_workflow>`) |
| **Vault** | |
| Add technology tags for work logging | `.claude/agents/obsidian-work-logger.md` (`<auto-tagging>`) |
| Change daily log template | `.claude/agents/obsidian-work-logger.md` (`<daily-log-template>`) |
| Add tag categories | `.claude/skills/obsidian-vault/SKILL.md` (`<standard-categories>`) |
| Change frontmatter requirements | `.claude/skills/obsidian-vault/SKILL.md` (`<frontmatter-requirements>`) |
| Modify PARA rules | `.claude/skills/obsidian-vault/SKILL.md` (`<para-methodology>`) |
| Add search domain hints | `.claude/skills/vault-search/references/search-strategies.md` |
| Change search ranking | `.claude/skills/vault-search/SKILL.md` (`<relevance-ranking>`) |
| Add document types | `.claude/skills/vault-update/references/document-types.md` |
| Add document templates | `.claude/skills/vault-update/templates/` |
| Modify PARA decision tree | `.claude/skills/vault-update/references/para-decision-tree.md` |
| Change indexer behavior | `.claude/scripts/vault-indexer.ts` (excluded dirs, batch size, etc.) |
| Change index output location | `.claude/scripts/vault-indexer.ts` (`OUTPUT_DIR` constant) |
| **Hook** | |
| Add security tiers | `.claude/hooks/tool-governance.ts` (`SECURITY_TIERS` object) |
| Block MCP tools | `.claude/hooks/tool-governance.ts` (`BLOCKED_TOOLS` array) |
| Exempt repos from git enforcement | `.claude/hooks/tool-governance.ts` (`getGitContext` function) |
| Add git commit rules | `.claude/hooks/tool-governance.ts` (see commented examples) |
| Protect file paths from edits | `.claude/hooks/tool-governance.ts` (Layer 3 section) |

### Editing Skills

Skills are markdown files with XML structure. Each skill has:
- `SKILL.md` - Main skill definition with behaviors, workflows, standards
- `workflows/` - Step-by-step workflow definitions
- `references/` - Supporting reference material
- `templates/` - Document templates (vault-update only)

Edit the relevant section and save. No restart needed - Claude Code reads skill files on each invocation.

### Editing Commands

Commands are markdown files with YAML frontmatter. They define:
- `description` - What the command does (shown in `/help`)
- `argument-hint` - Usage hint shown to user
- Body content - Instructions for Claude Code on how to execute

### Editing the Indexer Script

The `vault-indexer.ts` script has clearly labeled configuration sections at the top:
- `VAULT_PATH` - Path to your vault
- `OUTPUT_DIR` - Where index files are written
- `EXCLUDED_DIRS` - Directories to skip during scanning
- `EXCLUDED_PREFIXES` - File prefixes to skip
- `BATCH_SIZE` - Parallel processing batch size (default: 50)

After modifying the script, run it to verify:
```bash
bun ~/.claude/scripts/vault-indexer.ts
```

### Editing the Governance Hook

The `tool-governance.ts` hook has clearly labeled sections with `// CUSTOMIZE` comments:

**Adding a security tier:**
```typescript
// In SECURITY_TIERS object:
myCustomTier: {
  patterns: [/dangerous-pattern/i],
  action: 'block',     // 'block' | 'warn' | 'log'
  message: 'BLOCKED: Reason for blocking'
},
```

**Blocking an MCP tool:**
```typescript
// In BLOCKED_TOOLS array:
{
  pattern: 'mcp__servicename__tool_name',
  reason: 'Why this tool should not be used',
  alternative: 'What to use instead',
},
```

**Exempting repos from git push-to-main blocking:**
```typescript
// In getGitContext function, update the dotfiles repo list:
const isDotfilesRepo = repoName ?
  ['dotfiles', 'my-config-repo'].includes(repoName) : false;
```

**Commented examples included in the file:**
- Git commit signing enforcement
- Conventional commit format enforcement
- Claude attribution blocking
- `gh pr create` must open browser
- Write/Edit path protection for symlinked dotfiles

The hook uses `hook-utils.ts` for stdin reading and JSON parsing. If you create additional hooks, import from the same library for consistent behavior.

### After Making Changes

Changes take effect immediately on next use. If you modified the indexer script or vault structure, rebuild the index:

```bash
bun ~/.claude/scripts/vault-indexer.ts
```

### Versioning

If you keep these in a dotfiles repo (recommended):

```bash
git add .claude/
git commit -m "feat(vault): add new technology tags for ArgoCD"
```

## Usage Examples

### Daily Work Logging
```
"Log what I did today"
"Document this debugging session"
"End of day log"
```

### Searching the Vault
```
/vault-search kubernetes deployment
/vault-search --tags infrastructure
/vault-search --recent 7
/vault-search --content "alertmanager config"
```

### Creating Documentation
```
/vault-update kubernetes deployment guide
/vault-update --analyze ~/configs/app.yaml
/vault-update --edit Resources/DevOps/Kubernetes/setup.md
```

### Rebuilding the Index
```
/vault-reindex
```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- [Obsidian](https://obsidian.md/) vault (local or iCloud-hosted)
- [Bun](https://bun.sh/) runtime (for the indexer script)
- `jq` (for search queries - `brew install jq` or `apt install jq`)
