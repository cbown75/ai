# PARA Placement Decision Tree

Determine the correct location for documentation using the PARA methodology.

## Quick Decision

```
Is it part of an active project with a timeline?
+-- Yes -> Projects/{project}/
+-- No
    Is it an ongoing area of responsibility?
    +-- Yes -> Areas/{area}/
    +-- No
        Is it timeless reference material?
        +-- Yes -> Resources/{domain}/
        +-- No
            Is it historical/inactive?
            +-- Yes -> Archive/{original-location}/
```

## Projects/

**Criteria:**
- Has a defined goal or deliverable
- Has a timeline or deadline
- Will eventually be complete

**Structure:**
```
Projects/{Project Name}/
+-- README.md           # Project overview
+-- resources/          # Supporting materials
+-- notes/              # Working notes
+-- {phase}/            # Phase-specific docs
```

**Examples:**
- `Projects/Observability Stack/`
- `Projects/Infrastructure Migration/`
- `Projects/API Redesign/`

**On Completion:** Move to Archive/

## Areas/

**Criteria:**
- No end date or completion state
- Maintained over time
- Requires consistent attention

**Structure:**
```
Areas/{Area Name}/
+-- README.md           # Area overview
+-- {topic}/            # Topic-specific docs
+-- {process}/          # Process documentation
```

**Examples:**
<!-- CUSTOMIZE: Replace with your own areas -->
- `Areas/Home Lab Operations/`
- `Areas/Work ({{YOUR_COMPANY}})/`
- `Areas/Health and Fitness/`

## Resources/

**Criteria:**
- Timeless information
- Domain-organized knowledge
- No project or area affiliation

**Structure:**
```
Resources/{Domain}/
+-- {Sub-domain}/
|   +-- guides/         # How-to documentation
|   +-- references/     # Reference material
|   +-- concepts/       # Conceptual explanations
+-- README.md           # Domain overview
```

**Examples:**
- `Resources/DevOps/Kubernetes/`
- `Resources/Programming/Python/`
- `Resources/Claude Code/`

## Archive/

**Criteria:**
- Completed projects
- Outdated information
- Historical reference only

**Structure:** Mirror original location under Archive/

**Examples:**
- `Archive/Projects/Old Migration/`
- `Archive/Areas/Previous Job/`

## Decision Examples

### "Kubernetes deployment guide"
- Is it project-specific? -> If yes, Projects/
- Is it general reference? -> Resources/DevOps/Kubernetes/

### "Grafana alerting configuration"
- Part of observability project? -> Projects/Observability Stack/
- General reference? -> Resources/DevOps/Grafana/

### "Home lab network documentation"
- Ongoing maintenance? -> Areas/Home Lab Operations/
- Timeless reference? -> Resources/Infrastructure/Networking/

### "Work meeting notes"
- Part of active project? -> Projects/{project}/notes/
<!-- CUSTOMIZE: Replace with your work area -->
- Ongoing work area? -> Areas/Work ({{YOUR_COMPANY}})/

## Common Paths

| Content Type | Typical Location |
|-------------|------------------|
| Kubernetes how-tos | Resources/DevOps/Kubernetes/ |
| Monitoring guides | Resources/DevOps/Monitoring/ |
| Claude Code docs | Resources/Claude Code/ |
| Home lab configs | Areas/Home Lab Operations/ |
| Work documentation | Areas/Work ({{YOUR_COMPANY}})/ |
| Active projects | Projects/{name}/ |
| Completed projects | Archive/Projects/{name}/ |

## When Unsure

1. Ask: "Will this be complete at some point?"
   - Yes -> Projects/
   - No -> Continue

2. Ask: "Is this an ongoing responsibility I maintain?"
   - Yes -> Areas/
   - No -> Continue

3. Ask: "Is this timeless knowledge anyone could use?"
   - Yes -> Resources/
   - No -> Consider if it belongs in vault

4. Ask: "Is this historical/inactive?"
   - Yes -> Archive/
