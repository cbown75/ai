# Stack Preferences

Detailed technology decisions and rationale. When in doubt, follow this hierarchy.

<!-- CUSTOMIZE: Update ALL sections to match your technology stack -->

---

## Infrastructure

### Infrastructure as Code

| Priority | Tool | When to Use | Rationale |
|----------|------|-------------|-----------|
| 1 | **OpenTofu** | All new IaC | Open source, Terraform compatible |
| 2 | Terraform | Existing codebases | If it's already Terraform, don't migrate for ideology |

**Anti-patterns:**
- ClickOps (manual portal changes)
- Undocumented infrastructure
- IaC that doesn't match actual state

### GitOps

| Priority | Tool | When to Use | Rationale |
|----------|------|-------------|-----------|
| 1 | **Flux** | All Kubernetes GitOps | Kustomize-native, proven |
| 2 | ArgoCD | If Flux isn't an option | More features, more complexity |

**Flux components in use:**
- source-controller (Git repositories)
- kustomize-controller (Kustomize deployments)
- helm-controller (HelmReleases when needed)
- notification-controller (Alerts and events)

### Kubernetes Manifests

| Priority | Tool | When to Use | Rationale |
|----------|------|-------------|-----------|
| 1 | **Kustomize** | All manifest management | Native to kubectl, overlays are elegant |
| 2 | Raw YAML | Simple, one-off resources | When Kustomize is overkill |
| 3 | Helm | Existing charts from vendors | Use when chart already exists |

<!-- CUSTOMIZE: Update the directory structure for your GitOps layout -->
**Kustomize patterns:**
```
infrastructure/{app}/
+-- base/                    # Common resources
|   +-- kustomization.yaml
|   +-- *.yaml
+-- overlays/
    +-- dev/                 # Environment-specific
    +-- staging/
    +-- production/
```

---

## Languages

### Priority Order

<!-- CUSTOMIZE: Reorder based on your team's languages -->

| Priority | Language | Use Case | Rationale |
|----------|----------|----------|-----------|
| 1 | **Go** | CLI tools, performance-critical, new services | Fast, single binary, great stdlib |
| 2 | **Python** | Scripts, automation, data processing | Quick to write, good libraries |
| 3 | **TypeScript** | Hooks, web tooling, when JS needed | Types make JS tolerable |
| 4 | **Rust** | Systems programming, performance-critical | When Go isn't low-level enough |

### Package Managers

| Language | Tool | Command Pattern |
|----------|------|-----------------|
| Go | go mod | `go mod tidy`, `go build` |
| Python | uv | `uv pip install`, `uv run` |
| TypeScript | bun | `bun install`, `bun run` |

---

## Observability

### The Stack

```
+--------------------------------------------------+
|                   Grafana                          |
|         (Dashboards, Alerts, Exploration)          |
+----------+----------------+----------------+------+
           |                |                |
   +-------v-------+ +-----v-----+ +--------v------+
   |  Prometheus    | |   Loki    | |    Tempo      |
   |   (Metrics)    | |  (Logs)   | |  (Traces)     |
   +----------------+ +-----------+ +---------------+
```

### Query Languages

| Signal | Language | Example |
|--------|----------|---------|
| Metrics | PromQL | `rate(http_requests_total{namespace="your-app"}[5m])` |
| Logs | LogQL | `{namespace="your-app"} \|= "error" \| json` |
| Traces | TraceQL | `{resource.service.name="your-service"}` |

### When to Use Each

**Metrics (Prometheus):**
- Performance monitoring
- Resource utilization
- Request rates and latencies
- Alerting on thresholds

**Logs (Loki):**
- Error investigation
- Debugging specific requests
- Audit trails
- Correlation with trace IDs

**Traces (Tempo):**
- Request flow analysis
- Latency breakdown
- Cross-service debugging
- Finding bottlenecks

---

## Source Control & CI/CD

### Branching Strategy

```
main (protected)
  +-- feat/description
  +-- fix/description
  +-- chore/description
```

All branches use conventional commit prefixes. See `git-conventions` skill.

### CI/CD Flow

```
PR Created -> CI (build, test, lint)
           -> Review Required
           -> Merge to main
           -> Flux detects change
           -> Reconciles to cluster
```

---

## Knowledge Management

### Obsidian Configuration

<!-- CUSTOMIZE: Update vault path -->
**Vault location:** `{{VAULT_PATH}}`

**Organization:** PARA methodology
- Projects/ - Active initiatives with deadlines
- Areas/ - Ongoing responsibilities
- Resources/ - Reference material by domain
- Archive/ - Completed/inactive

### Tagging Convention

**Format:** `category/subcategory/specific`

**Examples:**
```yaml
tags:
  - infrastructure/kubernetes
  - devops/gitops/flux
  - operations/runbooks/deployment
```

**Rules:**
- Lowercase only
- Hyphens for multi-word
- Max 3 levels deep
- 2-8 tags per document

---

## CLI vs MCP Tools

### Preference Hierarchy

| Operation | Prefer | Over | Reason |
|-----------|--------|------|--------|
| Kubernetes ops | `kubectl` | MCP | Richer output, debuggable |
| Kubernetes logs | `kubectl logs` | MCP | Tail, follow, multi-container |
| GitHub operations | `gh` CLI | MCP | Full functionality |
| Helm operations | `helm` | MCP | Full Helm functionality |
| Flux operations | `flux` | - | GitOps native |
| Prometheus queries | Grafana MCP | - | No CLI equivalent |
| Loki log queries | Grafana MCP | - | No CLI equivalent |

### When MCP is Appropriate

Use MCP tools when:
- No CLI equivalent exists (Grafana, Obsidian writes)
- MCP provides significantly cleaner interface for complex operations
- Batch operations benefit from MCP's structured responses

### Why CLI-First

**Transparency**: You see exactly what command runs - no magic.
**Debuggability**: Copy the command, run it yourself, iterate manually.
**Portability**: Works anywhere the CLI is configured, no MCP server dependency.
**Output flexibility**: JSON, YAML, jsonpath, custom columns - whatever you need.

---

## Preferences Summary

When making technology decisions:

1. **Check if a standard exists** - Don't reinvent
2. **Prefer boring over clever** - Reliability wins
3. **Use what's already deployed** - Consistency over optimization
4. **Document the decision** - Future you will thank present you
5. **Ask if unclear** - Assumptions compound into disasters
