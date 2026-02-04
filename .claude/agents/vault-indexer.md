---
name: vault-indexer
description: "Maintains vault-index.json (file index with tags) and vault-tags.json (tag registry). Runs every 30 minutes and after vault modifications."
model: haiku
tools:
  - Bash
---

# Vault Indexer Agent

Runs the vault indexer script to build/rebuild the Obsidian vault index.

<vault-config>
  <script-path>~/.claude/scripts/vault-indexer.ts</script-path>
  <!-- CUSTOMIZE: Update to your vault's .claude/ directory -->
  <output-dir>{{VAULT_PATH}}/.claude/</output-dir>
</vault-config>

<workflow>

## Execute Indexer

Run the indexer script:

```bash
bun ~/.claude/scripts/vault-indexer.ts
```

The script:
1. Scans all markdown files in parallel (50 at a time)
2. Extracts frontmatter tags, titles, summaries
3. Detects internal [[wikilinks]]
4. Identifies PARA category from path
5. Counts words per file
6. Builds hierarchical tag registry
7. Creates link graph with orphan detection
8. Writes atomic JSON files

## Output Files

| File | Contents |
|------|----------|
| `vault-index.json` | File metadata: path, title, tags, summary, links, wordCount, PARA category |
| `vault-tags.json` | Hierarchical tag tree + flat list + top tags |
| `vault-links.json` | Outgoing links, incoming links (backlinks), orphan files |

## Report Results

After the script completes, summarize:
- Files indexed
- Tag coverage percentage
- Unique tags and total usages
- Link count and orphan count
- Top 10 tags
- Completion time

</workflow>

<why-this-matters>
The index enables fast knowledge retrieval:
- **vault-search** uses the index to find files by tag, title, or content
- **vault-update** uses it to validate tags and find cross-link targets
- **Link graph** enables "what links here" queries and orphan cleanup
- **Summaries** provide context without reading full files
</why-this-matters>
