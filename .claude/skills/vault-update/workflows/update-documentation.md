# Update Documentation Workflow

Update existing documentation in the Obsidian vault.

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| file_path | Yes* | Path to existing file |
| topic | Yes* | Topic to find and update |
| changes | Yes | Description of changes to make |

*Either file_path or topic required

## Process

### Step 1: Locate File

If file_path provided:
```
Read: [file_path]
```

If topic provided, search first:
```bash
/vault-search [topic]
```

Present matches for user to select.

### Step 2: Read Existing Content

```
Read: $VAULT_PATH/[path]
```

Review:
- Current structure
- Existing tags
- Current cross-links
- What needs updating

### Step 3: Search for Related Updates

Check if related docs need updating too:

```bash
/vault-search [related-keywords]
```

Identify:
- Docs that reference this file
- Docs this file references
- Docs that might need similar updates

### Step 4: Present Update Plan

```markdown
## Ready to Update Documentation

**File**: [path]
**Current Tags**: [existing-tags]

**Changes**:
- [Change 1 description]
- [Change 2 description]

**New Cross-Links** (if any):
- [[New Link]] - Connection explanation

**Related Files** (may need review):
- [File 1] - references this document
- [File 2] - has similar content

Proceed? (yes/no/modify)
```

### Step 5: Apply Changes

Use Edit tool for targeted changes:

```
Edit:
  file_path: [full-path]
  old_string: [content to replace]
  new_string: [updated content]
```

For multiple edits, make separate Edit calls.

### Step 6: Update Metadata

If needed, update frontmatter:
- Add new tags
- Update status
- Update date (if significant change)

### Step 7: Suggest Reindex

```markdown
Documentation updated: [path]

Changes made:
- [Change 1]
- [Change 2]

Run `/vault-reindex` to update the index.
```

## Output

- Updated file at original path
- Summary of changes made
- List of potentially related updates
- Reminder to reindex

## Example

**Input:**
```
file_path: Resources/DevOps/Kubernetes/cluster-setup.md
changes: Add section about Cilium CNI configuration
```

**Process:**
1. Read existing file
2. Search for Cilium docs: `/vault-search cilium`
3. Present update plan
4. Edit file to add new section
5. Add cross-link to Cilium docs

**Output:**
```
Updated: Resources/DevOps/Kubernetes/cluster-setup.md

Changes:
- Added "Cilium CNI Configuration" section
- Added cross-link to [[Cilium Network Policy Guide]]

Run /vault-reindex to update the index.
```

## Handling Multiple Files

If update affects multiple files:

1. List all files to update
2. Show changes for each
3. Get confirmation
4. Apply changes sequentially
5. Report all changes made
