# Search Files Workflow

General file search across the Obsidian vault.

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| keywords | Yes | Search terms (space-separated) |
| path_filter | No | Limit to PARA location or subdirectory |
| tag_filter | No | Limit to files with specific tags |
| date_range | No | Modified within N days |
| limit | No | Max results (default: 10) |

## Process

### Step 1: Load Index

```bash
# CUSTOMIZE: Set VAULT_PATH to your vault location
VAULT_PATH="{{VAULT_PATH}}"
INDEX_PATH="$VAULT_PATH/.claude/vault-index.json"

# Use Read tool to load index
Read: $INDEX_PATH
```

### Step 2: Check Freshness

```bash
LAST_UPDATED=$(jq -r '.last_updated' "$INDEX_PATH")
LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_UPDATED" +%s 2>/dev/null)
AGE_MIN=$(( ($(date +%s) - $LAST_EPOCH) / 60 ))

if [ $AGE_MIN -gt 30 ]; then
  echo "Index is $AGE_MIN minutes old. Consider running /vault-reindex"
fi
```

### Step 3: Apply Filters

```bash
# Base query
QUERY='.files[]'

# Path filter
if [ -n "$PATH_FILTER" ]; then
  QUERY="$QUERY | select(.path | startswith(\"$PATH_FILTER\"))"
fi

# Tag filter
if [ -n "$TAG_FILTER" ]; then
  QUERY="$QUERY | select(.tags | index(\"$TAG_FILTER\"))"
fi

# Date filter
if [ -n "$DAYS" ]; then
  CUTOFF=$(($(date +%s) - 86400 * $DAYS))
  QUERY="$QUERY | select(.modified > $CUTOFF)"
fi

# Execute query
cat "$INDEX_PATH" | jq -r "$QUERY"
```

### Step 4: Search and Rank

For each keyword, score files by:
1. +10 points: Filename exact match
2. +5 points: Filename contains keyword
3. +3 points: Path contains keyword
4. +2 points: Tags contain keyword
5. +1 point: Content contains keyword (requires Grep)

### Step 5: Read Previews

For top N results:
```bash
# Read first 10 lines of each file for preview
head -10 "$VAULT_PATH/$file_path"
```

### Step 6: Format Output

```markdown
## Found: {N} documents for "{keywords}"

### 1. {Title from H1 or filename}
**Path:** `{path}`
**Tags:** {comma-separated tags}
**Modified:** {human-readable date}
**Relevance:** {explanation}
**Preview:** {first 2-3 sentences}
```

## Output

Ranked list of files with:
- File path (relative to vault)
- Tags (from index)
- Modification date
- Relevance explanation
- Content preview

## Example

**Input:**
```
keywords: kubernetes deployment
path_filter: Projects/
limit: 5
```

**Output:**
```markdown
## Found: 12 documents for "kubernetes deployment"

### 1. Kubernetes Deployment Guide
**Path:** `Projects/Observability Stack/resources/kubernetes-deployment.md`
**Tags:** infrastructure/kubernetes, devops/deployment
**Modified:** 2025-12-10 (3 days ago)
**Relevance:** Filename contains both keywords
**Preview:** This guide covers deploying applications to Kubernetes...

### 2. ...
```
