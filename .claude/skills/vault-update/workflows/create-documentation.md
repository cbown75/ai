# Create Documentation Workflow

Create new documentation in the Obsidian vault with proper search-first validation.

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| topic | Yes | Topic to document |
| type | No | Document type (how-to, reference, concept, etc.) |
| source_files | No | Files/configs to analyze and document |
| location | No | Override PARA location |

## Process

### Step 1: Search for Existing Docs

**Critical:** Must complete before any creation.

```
Use Task tool to invoke vault-search-agent:
"Search for existing documentation about [topic]"
```

Or use vault-search command:
```bash
/vault-search [topic keywords]
```

Review results for:
- Exact matches (update instead of create?)
- Similar docs (link to these)
- Related docs (cross-link candidates)

### Step 2: Query Available Tags

```
Use Task tool to invoke vault-search-agent:
"Show tags matching [relevant-categories]"
```

Or use command:
```bash
/vault-search --tags [category]
```

From results:
- Identify existing tags that apply
- Note any new tags needed (validate hierarchy)

### Step 3: Determine PARA Location

Use decision tree from `references/para-decision-tree.md`:

1. Is it part of an active project? -> Projects/
2. Is it an ongoing area? -> Areas/
3. Is it timeless reference? -> Resources/
4. Is it historical? -> Archive/

Typical locations:
- How-tos -> Resources/{domain}/guides/
- References -> Resources/{domain}/references/
- Project docs -> Projects/{project}/

### Step 4: Present Confirmation

Show user the plan before writing:

```markdown
## Ready to Create Documentation

**Title**: [Document title]
**Location**: [Full PARA path]
**Type**: [how-to | reference | concept | etc.]

**Tags** (validated against vault):
- [existing-tag-1] (used in N files)
- [existing-tag-2] (used in N files)
- [NEW: proposed-new-tag] (will create)

**Search Results** (potential duplicates):
- [Existing Doc 1] - [similarity reason]
- [Existing Doc 2] - [similarity reason]

**Cross-Links** (from vault-search):
- [[Related Note 1]] - Connection explanation
- [[Related Note 2]] - Connection explanation

**Content Summary**:
- [Section 1]
- [Section 2]
- ...

Proceed? (yes/no/modify)
```

### Step 5: Write File

On approval, use Write tool:

```
Write:
  file_path: $VAULT_PATH/[PARA]/[Subcategory]/[Title].md
  content: |
    ---
    tags:
      - [tag1]
      - [tag2]
    date: [YYYY-MM-DD HH:MM:SS]
    type: [document-type]
    ---

    # [Title]

    [Description paragraph]

    ## [Section 1]

    ...

    ## Related Notes

    - [[Related Note 1]] - Connection explanation
    - [[Related Note 2]] - Connection explanation
```

### Step 6: Suggest Reindex

After successful creation:

```markdown
Documentation created at: [path]

Run `/vault-reindex` to update the index with this new file.
```

## Output

- Created file at specified path
- Confirmation message with path
- Reminder to reindex

## Example

**Input:**
```
topic: Kubernetes Deployment Guide
type: how-to
```

**Process:**
1. Search: `/vault-search kubernetes deployment`
   - Found: 3 related docs
2. Tags: `/vault-search --tags infrastructure kubernetes`
   - Found: infrastructure/kubernetes (28 files)
3. Location: Resources/DevOps/Kubernetes/
4. Confirmation shown
5. File written

**Output:**
```
Created: Resources/DevOps/Kubernetes/Kubernetes Deployment Guide.md

Cross-linked to:
- [[Kubernetes Setup Guide]]
- [[Flux GitOps Configuration]]

Run /vault-reindex to update the index.
```
