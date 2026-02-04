# Analyze and Document Workflow

Analyze source files or configurations and create comprehensive documentation.

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| source_path | Yes | Path to file(s) to analyze |
| output_type | No | Document type (default: reference) |
| output_location | No | Override PARA location |

## Process

### Step 1: Read Source Files

```
Read: [source_path]
```

For directories, use Glob to find relevant files:
```
Glob: pattern="*.yaml" path=[source_path]
```

### Step 2: Analyze Content

For each source file, extract:
- Purpose and functionality
- Key configurations/settings
- Dependencies
- Usage patterns
- Important values/thresholds

### Step 3: Search for Existing Docs

```bash
/vault-search [technology/topic from source]
```

Check if:
- Documentation already exists for this
- Related docs exist to link to
- This should update existing doc vs create new

### Step 4: Query Tags

```bash
/vault-search --tags [relevant-category]
```

Identify appropriate tags based on:
- Technology (kubernetes, terraform, etc.)
- Domain (infrastructure, devops, etc.)
- Purpose (configuration, deployment, etc.)

### Step 5: Determine Location

Based on content analysis:
- Config for active project -> Projects/
- Ongoing operations config -> Areas/
- Reference implementation -> Resources/

### Step 6: Generate Documentation

Create comprehensive documentation including:

```markdown
---
tags:
  - [technology-tag]
  - [domain-tag]
date: [timestamp]
type: reference
---

# [Technology/Component Name]

[Overview of what this component does]

## Configuration

Source: `[original file path]`

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| ... | ... | ... |

### [Section by Configuration Area]

```yaml
# relevant config excerpt with comments
```

## Dependencies

- [Dependency 1] - purpose
- [Dependency 2] - purpose

## Usage

[How to use/deploy this configuration]

```bash
# example commands
```

## Notes

[Important considerations, gotchas]

## Related Notes

- [[Related Doc 1]] - Connection explanation
- [[Related Doc 2]] - Connection explanation
```

### Step 7: Present for Confirmation

```markdown
## Ready to Create Documentation from Analysis

**Source**: [source_path]
**Title**: [Generated title]
**Location**: [PARA path]

**Analyzed Content**:
- [Component 1]
- [Component 2]
- ...

**Tags**:
- [tag1]
- [tag2]

**Cross-Links**:
- [[Related Note]] - Connection

Proceed? (yes/no/modify)
```

### Step 8: Write Documentation

Use Write tool to create the documentation file.

### Step 9: Suggest Next Steps

```markdown
Documentation created from: [source_path]
   Output: [output_path]

Next steps:
- Review generated documentation for accuracy
- Add any missing context or explanations
- Run /vault-reindex to update the index
```

## Output

- Documentation file at specified location
- Summary of what was documented
- Links to related documentation
- Next steps suggestions

## Example

**Input:**
```
source_path: ~/configs/kubernetes/controlplane.yaml
output_type: reference
```

**Process:**
1. Read controlplane.yaml
2. Extract: machine config, cluster config, CNI settings
3. Search: `/vault-search kubernetes controlplane`
4. Tags: `/vault-search --tags infrastructure kubernetes`
5. Location: Resources/DevOps/Kubernetes/
6. Generate reference doc
7. Write file

**Output:**
```
Created: Resources/DevOps/Kubernetes/Control Plane Configuration.md

Documented:
- Machine configuration
- Cluster settings
- CNI configuration
- Network settings

Cross-linked to:
- [[Kubernetes Setup Guide]]
- [[CNI Configuration]]

Run /vault-reindex to update the index.
```

## Supported Source Types

| Source Type | Analysis Approach |
|-------------|-------------------|
| YAML configs | Parse structure, document settings |
| JSON configs | Parse structure, document schema |
| Shell scripts | Document purpose, flags, usage |
| Python/code | Document functions, classes, usage |
| Terraform | Document resources, variables, outputs |
| Kubernetes manifests | Document resources, settings |
| Docker/Compose | Document services, networks, volumes |
