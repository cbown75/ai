---
description: Search Obsidian vault for documentation, query tags, find related files
argument-hint: "[query] | --tags [partial] | --recent [days] | --in [path] [query]"
---

<objective>
Search the Obsidian vault using the vault-search-agent: $ARGUMENTS

This uses the pre-built vault index for fast searches. If the index doesn't exist, suggest running /vault-reindex first.
</objective>

<process>
1. Launch the vault-search-agent using the Task tool
2. Pass the search query/arguments: $ARGUMENTS
3. Return results with paths, tags, and previews
</process>

<argument_parsing>
| Pattern | Action |
|---------|--------|
| `--tags [partial]` | Query tag registry for matching tags |
| `--recent [N]` | Show files modified in last N days |
| `--in [path] [query]` | Scope search to specific directory |
| `--content [query]` | Full-text search using Grep |
| `[query]` | Default: search file paths and names |
</argument_parsing>

<agent_invocation>
Use Task tool with:
- subagent_type: vault-search-agent
- model: haiku
- prompt: "Search the vault for: $ARGUMENTS"
</agent_invocation>
