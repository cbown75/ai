---
name: vault-search
description: |
  Search the Obsidian vault using the file index and tag registry. Use this skill when:
  - Searching for documentation or knowledge
  - Finding files by topic, tag, or content
  - Querying available tags for validation
  - Finding related documents for cross-linking
  - Checking for existing documentation before creating new
  - Finding backlinks (what links to this file)
  - Finding orphan files (no incoming links)

  Trigger phrases: "search vault", "find in vault", "query tags", "what tags exist",
  "find documentation about", "search obsidian", "what links to", "orphan files"
---

# Vault Search Skill

Fast knowledge retrieval from the Obsidian vault using pre-built indices.

<vault-config>
  <!-- CUSTOMIZE: Update to your Obsidian vault path -->
  <vault-path>{{VAULT_PATH}}</vault-path>
  <index-path>.claude/vault-index.json</index-path>
  <tags-path>.claude/vault-tags.json</tags-path>
  <links-path>.claude/vault-links.json</links-path>
</vault-config>

<index-schema>
## vault-index.json (v3.0)

Each file entry contains:
```json
{
  "path": "Projects/example/note.md",
  "title": "Example Note Title",
  "modified": 1705123456789,
  "size": 2340,
  "tags": ["devops/kubernetes", "how-to"],
  "para": "Projects",
  "summary": "First paragraph preview text...",
  "links": ["Other Note", "Concepts/Topic"],
  "wordCount": 450
}
```

## vault-tags.json (v2.0)

- `tags`: Hierarchical tree with counts
- `flatList`: Sorted array of all tags
- `topTags`: Top 20 tags by usage

## vault-links.json (v1.0)

- `outgoing`: Map of file -> files it links to
- `incoming`: Map of file -> files that link to it (backlinks)
- `orphans`: Files with no incoming links
</index-schema>

<principle name="filesystem-first">
Use filesystem tools in this order:
1. **Read** - Load index/registry JSON, read file contents
2. **Grep** - Search file contents for keywords
3. **Glob** - Find files by pattern
4. **Bash** - jq queries on index, complex operations
5. **MCP obsidian tools** - Only as fallback when filesystem can't accomplish the task
</principle>

<capabilities>

## Title & Summary Search

Search using titles and summaries for better relevance:
```bash
# Search titles and summaries for keyword
jq -r '.files[] | select((.title | test("kubernetes"; "i")) or (.summary // "" | test("kubernetes"; "i"))) | "\(.path)\t\(.title)"' "$INDEX_PATH"
```

## Path-Based Search

Search file paths in the index for keywords:
- Filter by PARA location (Projects/, Areas/, Resources/, Archive/)
- Filter by directory prefix
- Case-insensitive matching

```bash
# Search paths matching "kubernetes"
jq -r '.files[] | select(.path | test("kubernetes"; "i")) | .path' "$INDEX_PATH"

# Filter by PARA category
jq -r '.files[] | select(.para == "Projects") | .path' "$INDEX_PATH"
```

## Tag Search

Query the tag registry:
```bash
# Find files with specific tag
jq -r '.files[] | select(.tags | index("infrastructure/kubernetes")) | .path' "$INDEX_PATH"

# Get all tags under a category
jq -r '.tags.infrastructure.children | keys[]' "$TAGS_PATH"

# Search tags matching pattern
jq -r '.flatList[] | select(test("kube"; "i"))' "$TAGS_PATH"

# Top tags
jq -r '.topTags[] | "\(.tag): \(.count)"' "$TAGS_PATH"
```

## Link Graph Search

Find relationships using the link graph:
```bash
# Find backlinks (what links TO a file)
jq -r '.incoming["Projects/Example"][]' "$LINKS_PATH"

# Find outgoing links (what a file links TO)
jq -r '.outgoing["Projects/Example"][]' "$LINKS_PATH"

# Find orphan files (no incoming links)
jq -r '.orphans[]' "$LINKS_PATH"

# Count incoming links per file
jq -r '.incoming | to_entries | sort_by(-.value | length) | .[:10] | .[] | "\(.key): \(.value | length)"' "$LINKS_PATH"
```

## Content Search

Search file contents using Grep tool:
```
Grep: pattern="alerting", path="$VAULT_PATH/Projects/", glob="*.md"
```

## Metadata Search

```bash
# Files modified in last N days
CUTOFF=$(($(date +%s) - 86400 * 7))
jq -r --argjson cutoff "$CUTOFF" '.files[] | select(.modified/1000 > $cutoff) | .path' "$INDEX_PATH"

# Largest files by word count
jq -r '.files | sort_by(-.wordCount)[:10] | .[] | "\(.wordCount)\t\(.path)"' "$INDEX_PATH"

# Files without tags
jq -r '.files[] | select(.tags | length == 0) | .path' "$INDEX_PATH"
```

</capabilities>

<workflows>

## search-files

General file search across the vault.

**Input:** Keywords, optional filters (path, tags, date range)
**Process:**
1. Load vault-index.json using Read tool
2. Search titles first (highest relevance)
3. Search summaries second
4. Search paths third
5. Filter by tags if specified
6. Return top matches with summaries

**Output:** Ranked list with paths, titles, summaries, tags

## search-tags

Tag discovery and lookup from the tag registry.

**Input:** Partial tag or category name
**Process:**
1. Load vault-tags.json using Read tool
2. Search flatList for matching tags
3. Get hierarchy context for matches
4. Show usage counts from topTags

**Output:** Matching tags with counts, hierarchy context

## find-related

Find documents related to a given file or topic.

**Input:** File path or topic keywords
**Process:**
1. If file path: get its tags AND its outgoing links
2. Find backlinks from vault-links.json
3. Find files with overlapping tags
4. Rank by connection strength

**Output:** Related files ranked by relevance

## find-orphans

Find files with no incoming links.

**Input:** Optional PARA filter
**Process:**
1. Load vault-links.json
2. Filter orphans by PARA category if specified
3. Show word count and tags to help prioritize

**Output:** Orphan files with metadata

</workflows>

<output-formats>

## File Search Results

```markdown
## Found: {N} documents for "{query}"

### 1. {title}
**Path:** `{relative/path/to/file.md}`
**Tags:** {tag1}, {tag2}
**Modified:** {date} | **Words:** {N}
**Summary:** {summary text}

### 2. ...

---
**Index age:** {minutes} min | **Files searched:** {N}
```

## Backlink Results

```markdown
## Backlinks to "{filename}"

### Files that link here ({N}):
1. `Projects/Example.md` - "See also [[filename]] for details"
2. `Areas/Topic.md` - "Related: [[filename]]"

### This file links to ({M}):
- `Concepts/Thing.md`
- `Resources/Reference.md`
```

## Orphan Report

```markdown
## Orphan Files ({N} with no incoming links)

| File | Words | Tags | PARA |
|------|-------|------|------|
| `Resources/Old.md` | 234 | ref | Resources |
| `Projects/Draft.md` | 1200 | wip | Projects |

Consider: linking from related docs, or archiving if obsolete.
```

</output-formats>

<index-freshness>
Check freshness before searching:
```bash
AGE_MIN=$(jq -r '((now - (.lastUpdated | fromdateiso8601)) / 60 | floor)' "$INDEX_PATH")
if [ $AGE_MIN -gt 30 ]; then
  echo "Index is $AGE_MIN minutes old. Consider running /vault-reindex"
fi
```
</index-freshness>

<relevance-ranking>
Rank results by:
1. **Exact title match** (highest)
2. **Title contains keyword**
3. **Summary contains keyword**
4. **Path component match**
5. **Has backlinks** (more connected = more relevant)
6. **Tag match**
7. **Recency** (tie-breaker)
</relevance-ranking>

<integration>

## Used By

- `/vault-search` command - Primary interface
- `vault-search-agent` - Autonomous search agent
- `vault-update` skill - Finds existing docs, queries tags before creating
- `vault-update-agent` - Uses search to prevent duplicates

## Requires

Index files created by `vault-indexer.ts`:
- `vault-index.json` - File metadata with titles, tags, summaries, links
- `vault-tags.json` - Hierarchical tag registry
- `vault-links.json` - Link graph with backlinks and orphans

Run `/vault-reindex` if index files don't exist or are stale.

</integration>
