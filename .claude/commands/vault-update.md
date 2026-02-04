---
description: Create or update infrastructure/technical documentation in Obsidian vault
argument-hint: "[topic] | --analyze [file] | --edit [path]"
---

<objective>
Create or update documentation in the Obsidian vault using the vault-update-agent: $ARGUMENTS

This command performs search-first validation, tag querying, and PARA placement automatically.
</objective>

<process>
1. Launch the vault-update-agent using the Task tool
2. Agent searches for existing docs on the topic first
3. Agent validates tags against vault registry
4. Agent determines correct PARA location
5. Agent confirms plan before writing
6. Agent creates/updates using filesystem tools (not MCP)
</process>

<argument_parsing>
| Pattern | Action |
|---------|--------|
| `[topic]` | Create new documentation on topic |
| `--analyze PATH` | Analyze file and create documentation from it |
| `--edit PATH` | Update existing documentation |
| `--type TYPE` | Document type: how-to, reference, concept, project, runbook |
| `--location PATH` | Override PARA location |
</argument_parsing>

<scope>
**In scope:** Infrastructure docs, technical references, how-to guides, config documentation

**Out of scope (use dedicated agents):**
- Daily work logs -> `obsidian-work-logger`
- RCA documentation -> `obsidian-rca-logger`
- Session notes -> `session-documentation-agent`
- Zettelkasten notes -> `zettelkasten-agent`
</scope>

<agent_invocation>
Use Task tool with:
- subagent_type: vault-update-agent
- prompt: "Create/update documentation for: $ARGUMENTS"
</agent_invocation>
