# MCP Server Reference

Available MCP integrations. **Remember: CLI-first.** Only use MCP when CLI cannot accomplish the task.

---

## Configured Servers

<!-- CUSTOMIZE: List your actual MCP servers -->

| Server | Purpose | Why MCP (not CLI) |
|--------|---------|-------------------|
| grafana | Prometheus/Loki queries, dashboards, alerts | No CLI equivalent for query APIs |
| obsidian | Vault append/create operations | Cleaner than heredocs for content operations |

<!-- CUSTOMIZE: Add more servers as needed. Examples:
| home-assistant | Smart home control | No CLI equivalent |
| unifi-network | Network management | No CLI equivalent |
| n8n-mcp | Workflow automation | No CLI equivalent |
| atlassian | Jira tickets, Confluence pages | API complexity |
-->

---

## CLI Alternatives (Prefer These)

| Task | Use This | NOT This |
|------|----------|----------|
| Kubernetes ops | `kubectl` | MCP |
| GitHub ops | `gh` | MCP |
| Vault search | Read `vault-index.json` directly | `mcp__obsidian__search` |
| Vault read | `Read` tool on vault path | `mcp__obsidian__get_file_contents` |
| Flux status | `flux` | MCP |

---

## Vault Access Hierarchy

Exhaust higher options before falling to MCP:

1. **Commands first:** `/vault-search`, `/vault-update`, `/vault-reindex`
2. **Skills second:** `vault-search`, `vault-update`, `obsidian-vault`
3. **Agents third:** `vault-search-agent`, `vault-update-agent`
4. **Filesystem tools:** Read/Write/Glob/Grep on vault directly
5. **MCP last resort:** `mcp__obsidian__*` only when above cannot work

---

## When Each MCP is Appropriate

### grafana
- Prometheus queries (`query_prometheus`)
- Loki log queries (`query_loki_logs`)
- Dashboard operations
- Alert rule management

### obsidian
- `obsidian_append_content` - appending to existing files
- `obsidian_patch_content` - inserting at specific locations
- **NOT** for reading (use Read tool)
- **NOT** for searching (use vault-index.json)
