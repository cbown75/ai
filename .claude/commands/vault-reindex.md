---
description: Rebuild vault index and tag registry for fast knowledge retrieval
argument-hint: "[--force]"
---

<objective>
Rebuild the Obsidian vault file index, tag registry, and link graph.

Arguments: $ARGUMENTS
</objective>

<quick-path>
For fastest execution with zero prompts, run directly:

```bash
bun ~/.claude/scripts/vault-indexer.ts
```
</quick-path>

<agent-path>
Alternatively, use the vault-indexer agent (still just runs the script):

Use Task tool with:
- subagent_type: vault-indexer
- prompt: "Build the vault file index and tag registry."
</agent-path>

<outputs>
<!-- CUSTOMIZE: Update path to your vault's .claude/ directory -->
Files created at `{{VAULT_PATH}}/.claude/`:

| File | Contents |
|------|----------|
| `vault-index.json` | File metadata: path, title, tags, summary, links, wordCount, PARA |
| `vault-tags.json` | Hierarchical tag tree + flat list + top 20 tags |
| `vault-links.json` | Outgoing links, incoming links (backlinks), orphan files |
</outputs>

<performance>
- Parallel processing (50 files at a time)
- Zero approval prompts when run directly
</performance>
