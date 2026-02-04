# Search Tags Workflow

Tag discovery and lookup from the tag registry.

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| query | Yes | Partial tag or category name |
| show_hierarchy | No | Include hierarchy context (default: true) |
| show_files | No | Show files using each tag (default: false) |

## Process

### Step 1: Load Tag Registry

```bash
# CUSTOMIZE: Set VAULT_PATH to your vault location
VAULT_PATH="{{VAULT_PATH}}"
TAGS_PATH="$VAULT_PATH/.claude/vault-tags.json"
INDEX_PATH="$VAULT_PATH/.claude/vault-index.json"

# Use Read tool
Read: $TAGS_PATH
```

### Step 2: Search Flat List

Find tags matching the query:

```bash
# Exact prefix match
cat "$TAGS_PATH" | jq -r '.flat_list[] | select(startswith("'"$QUERY"'"))'

# Contains match (case-insensitive)
cat "$TAGS_PATH" | jq -r '.flat_list[] | select(test("'"$QUERY"'"; "i"))'
```

### Step 3: Get Hierarchy Context

For each matching tag, show its position in hierarchy:

```bash
# Parse tag into parts
TAG="infrastructure/kubernetes/flux"
PARTS=(${TAG//\// })

# Category level
cat "$TAGS_PATH" | jq -r ".tags.${PARTS[0]}"

# Subcategory level
cat "$TAGS_PATH" | jq -r ".tags.${PARTS[0]}.children.${PARTS[1]}"

# Specific level
cat "$TAGS_PATH" | jq -r ".tags.${PARTS[0]}.children.${PARTS[1]}.children.${PARTS[2]}"
```

### Step 4: Get Usage Counts

From the hierarchical structure, extract counts at each level.

### Step 5: Show Related Tags

Tags that:
- Share the same parent category
- Are siblings in the hierarchy
- Have similar names

### Step 6: Optionally Show Files

If `show_files` is true:
```bash
# Find files with this tag
cat "$INDEX_PATH" | jq -r '.files[] | select(.tags | index("'"$TAG"'")) | .path'
```

## Output Formats

### Standard Output

```markdown
## Tags matching "{query}"

### Exact matches:
- `infrastructure/kubernetes/flux` (12 files)
- `infrastructure/kubernetes/helm` (8 files)

### Related tags:
- `devops/kubernetes` (15 files)
- `homelab/kubernetes` (5 files)

### Tag hierarchy:
infrastructure/
+-- kubernetes/ (28 total)
|   +-- flux (12)
|   +-- helm (8)
|   +-- cilium (5)
+-- networking/ (7)
```

### With Files

```markdown
## Tags matching "{query}"

### `infrastructure/kubernetes/flux` (12 files)
- `Projects/GitOps Migration/README.md`
- `Resources/DevOps/Kubernetes/flux-setup.md`
- `Areas/Home Lab Operations/flux-config.md`
...

### `infrastructure/kubernetes/helm` (8 files)
- `Projects/Observability Stack/helm-charts.md`
...
```

## Use Cases

### Validate Tag Before Using

Before applying a tag to a new document:
```bash
/vault-search --tags kubernetes/deployment
```

If no exact match, see suggestions and either:
1. Use an existing similar tag
2. Create new tag following hierarchy conventions

### Discover Available Tags

When unsure what tags exist:
```bash
/vault-search --tags infrastructure
```

Shows all tags under the infrastructure category.

### Find Tag Hierarchy

Understanding tag structure:
```bash
/vault-search --tags devops
```

Shows devops/ and all children with counts.

## Example

**Input:**
```
query: kube
show_hierarchy: true
```

**Output:**
```markdown
## Tags matching "kube"

### Exact matches:
- `infrastructure/kubernetes` (28 files)
- `infrastructure/kubernetes/flux` (12 files)
- `infrastructure/kubernetes/helm` (8 files)
- `infrastructure/kubernetes/cilium` (5 files)
- `devops/kubernetes` (15 files)
- `homelab/kubernetes` (5 files)

### Tag hierarchy:
infrastructure/
+-- kubernetes/ (28 total)
    +-- flux (12)
    +-- helm (8)
    +-- cilium (5)

devops/
+-- kubernetes (15)

homelab/
+-- kubernetes (5)
```
