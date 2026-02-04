# Search Strategies Reference

Topic-specific search hints for effective vault queries.

## By Domain

### Kubernetes Documentation
```bash
# Path patterns
Projects/**/kubernetes/**
Resources/DevOps/Kubernetes/**
Areas/Home Lab Operations/**/k8s*

# Tags to look for
infrastructure/kubernetes/*
devops/kubernetes/*
homelab/kubernetes/*

# Content keywords
kubectl, helm, flux, pod, deployment, service
```

### Monitoring/Observability
```bash
# Path patterns
Projects/**/monitoring/**
Projects/**/observability/**
Resources/**/Grafana/**
Resources/**/Prometheus/**

# Tags
homelab/monitoring/*
infrastructure/observability/*

# Content keywords
prometheus, grafana, loki, alertmanager, metrics, dashboard
```

### Work Documentation
<!-- CUSTOMIZE: Replace with your own work-specific patterns -->
```bash
# Path patterns
Areas/Work ({{YOUR_COMPANY}})/**
Projects/**/{{YOUR_PROJECT}}/**

# Tags
work/{{your-company}}/*

# Content keywords
# Add your company/product-specific keywords here
```

### Claude Code Tooling
```bash
# Path patterns
Resources/Claude Code/**
Resources/AI/Tools/**

# Tags
ai/claude/*
reference/claude-code

# Content keywords
skill, agent, command, slash, hook, prompt
```

## Search Patterns

### Finding Duplicates
Before creating, search for:
1. Exact title match
2. Similar topic keywords
3. Same tags
4. Same PARA location

```bash
# Search for existing note on topic
/vault-search kubernetes deployment guide

# Check if tag exists
/vault-search --tags kubernetes/deployment
```

### Finding Cross-Link Candidates
For a note about "Prometheus alerting":
1. Search "prometheus" - find all prometheus docs
2. Search "alerting" - find alerting docs
3. Search --tags prometheus - find tagged docs
4. Check hierarchy - find parent/sibling docs

### Finding Related Work
```bash
# Recent work in same area
/vault-search --recent 7 --in Projects/Grafana*

# All docs with overlapping tags
/vault-search --tags infrastructure/kubernetes homelab/monitoring
```

## Query Optimization

### Fast Queries (use index)
- Path pattern matching
- Tag filtering
- Modification date filtering
- File listing

### Slower Queries (use Grep)
- Full-text content search
- Regex pattern matching
- Multi-word phrase search

### Optimization Tips
1. Start with path/tag filters to narrow candidates
2. Apply content search only to filtered set
3. Limit results with head/tail
4. Use specific keywords over generic terms
