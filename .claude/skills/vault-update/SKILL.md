---
name: vault-update
description: |
  Create and update infrastructure/technical documentation in Obsidian vault. Use this skill when:
  - Creating new documentation (guides, references, how-tos)
  - Updating existing documentation
  - Documenting configurations, code, or infrastructure
  - Capturing technical knowledge from conversations

  Trigger phrases: "create documentation", "document this", "write to vault",
  "update docs", "create how-to", "document configuration"

  Out of scope: Daily logs, RCAs, session notes (use dedicated agents)
---

# Vault Update Skill

Create and update infrastructure and technical documentation in the Obsidian vault.

<vault-config>
  <!-- CUSTOMIZE: Update to your Obsidian vault path -->
  <vault-path>{{VAULT_PATH}}</vault-path>
  <search-skill>vault-search</search-skill>
  <search-command>/vault-search</search-command>
  <index-command>/vault-reindex</index-command>
</vault-config>

<scope>
  <in-scope>
    - Infrastructure documentation
    - Technical references
    - How-to guides
    - Configuration documentation
    - Architecture documentation
    - Code/config analysis documentation
  </in-scope>
  <out-of-scope>
    - Daily work logs -> obsidian-work-logger
    - RCA documentation -> obsidian-rca-logger
    - Session notes -> session-documentation-agent
    - Zettelkasten permanent notes -> zettelkasten-agent
  </out-of-scope>
</scope>

<principle name="filesystem-first">
Use filesystem tools in this order:
1. **Read** - Read existing files, check for duplicates
2. **Write** - Create new files
3. **Edit** - Modify existing files
4. **vault-search** - Find existing docs, query tags
5. **MCP obsidian tools** - Only as fallback (avoid obsidian_patch_content - unreliable)
</principle>

<mandatory-behaviors>

<behavior name="search-first" priority="critical">
  <description>Before ANY create/update operation, invoke vault-search.</description>
  <workflow>
    <step>Search for existing docs on same topic</step>
    <step>Identify related docs for cross-linking</step>
    <step>Query available tags matching the content</step>
    <step>Proceed only after reviewing search results</step>
  </workflow>
</behavior>

<behavior name="duplicate-check" priority="high">
  <description>Check for existing documentation before creating new.</description>
  <workflow>
    <step>Search for docs with similar title/topic</step>
    <step>If similar exists: offer to update instead of create</step>
    <step>Present options: update existing, create new with distinction, or cancel</step>
  </workflow>
</behavior>

<behavior name="tag-validation" priority="high">
  <description>Validate all tags against vault registry before applying.</description>
  <workflow>
    <step>Query vault-search --tags for available tags</step>
    <step>Prefer existing tags over creating new ones</step>
    <step>If creating new tag, validate it follows hierarchy conventions</step>
    <step>Present tag choices to user for confirmation</step>
  </workflow>
</behavior>

<behavior name="para-placement" priority="high">
  <description>Determine correct PARA location before writing.</description>
  <workflow>
    <step>Use PARA decision tree to determine location</step>
    <step>Projects/ - Active projects with timeline</step>
    <step>Areas/ - Ongoing responsibilities</step>
    <step>Resources/ - Timeless reference material</step>
    <step>Archive/ - Historical/inactive</step>
  </workflow>
</behavior>

<behavior name="cross-linking" priority="high">
  <description>Include Related Notes section with connections.</description>
  <requirements>
    <requirement>Use vault-search results to identify related notes</requirement>
    <requirement>Minimum 2-3 cross-links with explanations</requirement>
    <requirement>Include Related Notes section at end of document</requirement>
  </requirements>
</behavior>

</mandatory-behaviors>

<workflows>

## create-documentation

Create new documentation in the vault.

**Input:** Topic, content type, optional source files
**Process:**
1. vault-search for existing docs on topic
2. vault-search --tags for relevant tags
3. Determine PARA location using decision tree
4. Present plan for confirmation
5. Write file using Write tool
6. Suggest running /vault-reindex

See: `workflows/create-documentation.md`

## update-documentation

Update existing documentation.

**Input:** File path or topic, changes to make
**Process:**
1. Read existing file
2. vault-search for related updates
3. Edit file using Edit tool
4. Update cross-links if needed
5. Suggest running /vault-reindex

See: `workflows/update-documentation.md`

## analyze-and-document

Analyze source files/configs and create documentation.

**Input:** Source files/configs to document
**Process:**
1. Read and analyze source files
2. vault-search for existing docs
3. vault-search --tags for relevant tags
4. Create comprehensive documentation

See: `workflows/analyze-and-document.md`

</workflows>

<documentation-standards>

## Frontmatter Requirements

All documentation must include:

```yaml
---
tags:
  - category/subcategory/specific
  - category/subcategory
date: YYYY-MM-DD HH:MM:SS
type: how-to | reference | concept | project | runbook
context: work | personal | shared  # optional
status: active | draft | complete  # optional
---
```

## Content Structure

- H1 title matching filename
- Brief description paragraph
- Sections with proper heading hierarchy (H1 -> H2 -> H3)
- Code blocks with language specified
- Related Notes section at end

## Tag Conventions

Tags follow hierarchical format: `category/subcategory/specific`

<!-- CUSTOMIZE: Update these categories to match your domains -->
Standard categories (see vault-tags.json for current list):
- infrastructure/* (aws, kubernetes, networking)
- homelab/* (monitoring, storage)
- programming/* (python, javascript, git)
- devops/* (cicd, gitops, kubernetes, helm)
- ai/* (claude, prompts)
- work/* (your-company, your-platform)
- documentation/* (guides, reference)
- operations/* (runbooks, checklists)

</documentation-standards>

<confirmation-flow>

Before creating/updating, present to user:

```markdown
## Ready to [Create/Update] Documentation

**Title**: [Document title]
**Location**: [PARA path]
**Type**: [Document type]

**Tags** (validated against vault):
- [existing-tag-1] (used in N files)
- [existing-tag-2] (used in N files)
- [NEW: proposed-new-tag] (will create)

**Cross-Links** (from vault-search):
- [[Related Note 1]] - Connection explanation
- [[Related Note 2]] - Connection explanation

**Content Summary**:
- [Section 1]
- [Section 2]
- ...

Proceed? (yes/no/modify)
```

</confirmation-flow>

<file-operations>

## Create New File

Use Write tool:
```
Write:
  file_path: $VAULT_PATH/[PARA]/[Subcategory]/[Title].md
  content: [Full document with frontmatter]
```

## Update Existing File

Use Edit tool:
```
Edit:
  file_path: [path to existing file]
  old_string: [content to replace]
  new_string: [updated content]
```

## Never Use

- MCP obsidian_patch_content (unreliable)
- Echo/cat for file creation (use Write tool)

</file-operations>

<templates>

Document templates available in `templates/`:
- `how-to.md` - Step-by-step instructions
- `reference.md` - Technical reference documentation

See `references/document-types.md` for type-specific guidance.

</templates>

<integration>

## Uses

- `vault-search` skill - Find existing docs, query tags
- `vault-search-agent` - Execute searches
- `/vault-search` command - Primary search interface

## Used By

- `/vault-update` command - Primary interface
- `vault-update-agent` - Autonomous documentation agent

## After Updates

Run `/vault-reindex` to update index with new/modified files.

</integration>
