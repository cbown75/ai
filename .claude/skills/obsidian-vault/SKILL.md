---
name: obsidian-vault
description: |
  Use this skill whenever working with the Obsidian vault, including:
  - Writing, creating, or saving notes to Obsidian
  - Searching for documentation or knowledge
  - Finding information in the vault
  - Documenting configurations, guides, or references
  - Creating how-tos, runbooks, or technical documentation
  - Capturing knowledge from conversations
  - Any operation involving the knowledge base

  Trigger phrases: "write to Obsidian", "save to vault", "create note",
  "document in Obsidian", "search vault", "find in Obsidian", "knowledge base"
---

# Obsidian Vault Skill

This skill defines mandatory behaviors and standards for ALL Obsidian vault operations.

<vault-config>
  <!-- CUSTOMIZE: Update path to your Obsidian vault location -->
  <!-- See README for iCloud hosting instructions -->
  <path>{{VAULT_PATH}}</path>
  <search-command>/search-obsidian-vault</search-command>
  <index-command>/reindex-obsidian-vault</index-command>
</vault-config>

<mandatory-behaviors>

<behavior name="search-first" priority="critical">
  <description>Before ANY vault operation, search for existing notes with relevant keywords.</description>
  <applies-to>
    <operation>Creating new notes</operation>
    <operation>Finding information</operation>
    <operation>Updating content</operation>
    <operation>Cross-linking</operation>
  </applies-to>
  <workflow>
    <step>Search vault for relevant keywords</step>
    <step>Review results for duplicates and related notes</step>
    <step>Proceed only after reviewing search results</step>
  </workflow>
</behavior>

<behavior name="duplicate-check" priority="high">
  <description>Before creating ANY new note, search for existing notes on the same topic.</description>
  <workflow>
    <step>Search for existing notes on the topic</step>
    <step>If similar note exists: Update it or link to it</step>
    <step>If no match: Proceed with creation</step>
    <step>Report findings to user</step>
  </workflow>
</behavior>

<behavior name="auto-cross-link" priority="high">
  <description>When creating or updating notes, identify and include related notes.</description>
  <requirements>
    <requirement>Use search results to identify related notes</requirement>
    <requirement>Include minimum 2-3 cross-links with explanations</requirement>
    <requirement>Consider bidirectional linking</requirement>
    <requirement>Never create orphaned notes</requirement>
  </requirements>
</behavior>

<behavior name="tag-validation" priority="high">
  <description>Validate all tags against existing vault taxonomy before applying.</description>
  <requirements>
    <requirement>Check existing vault taxonomy via search</requirement>
    <requirement>Use hierarchical format: category/subcategory/specific</requirement>
    <requirement>Prefer existing tags over creating new ones</requirement>
    <requirement>Validate against standard categories</requirement>
  </requirements>
</behavior>

<behavior name="para-placement" priority="high">
  <description>Confirm correct PARA location before writing any file.</description>
  <workflow>
    <step>Determine correct PARA location using decision tree</step>
    <step>Confirm with user if ambiguous</step>
    <step>Follow PARA methodology strictly</step>
  </workflow>
</behavior>

</mandatory-behaviors>

<workflow-enforcement>
  <phase name="search-first" order="1">
    <action>Search vault for relevant keywords</action>
    <action>Review results for duplicates and related notes</action>
  </phase>
  <phase name="validate-before-writing" order="2">
    <action>Check for duplicate content</action>
    <action>Identify notes to cross-link</action>
    <action>Validate proposed tags</action>
    <action>Confirm PARA placement</action>
  </phase>
  <phase name="write-with-standards" order="3">
    <action>Apply all documentation standards</action>
    <action>Include proper frontmatter</action>
    <action>Use hierarchical tags</action>
    <action>Add cross-links with explanations</action>
  </phase>
  <phase name="verify-after-writing" order="4">
    <action>Confirm file created at correct path</action>
    <action>Verify links resolve</action>
    <action>Report status to user</action>
  </phase>
</workflow-enforcement>

<documentation-standards>

<frontmatter-requirements>
  <required-fields>
    <field name="tags" type="list">
      <description>2-8 hierarchical tags</description>
      <format>category/subcategory/specific</format>
    </field>
    <field name="date" type="datetime">
      <description>ISO 8601 timestamp of creation</description>
      <format>YYYY-MM-DD HH:MM:SS</format>
    </field>
    <field name="type" type="enum">
      <description>Document classification</description>
      <values>
        <value name="how-to">Step-by-step instructions</value>
        <value name="reference">Technical reference material</value>
        <value name="concept">Conceptual explanation</value>
        <value name="project">Project documentation</value>
        <value name="runbook">Operational procedures</value>
      </values>
    </field>
  </required-fields>
  <optional-fields>
    <field name="context" type="enum">
      <values>work, personal, shared</values>
    </field>
    <field name="status" type="enum">
      <values>active, complete, archived, draft</values>
    </field>
    <field name="related" type="list">
      <description>Wiki-style links to related notes</description>
    </field>
  </optional-fields>
  <example>
```yaml
---
tags:
  - infrastructure/kubernetes
  - documentation/guides/deployment
date: 2025-11-10 14:00:00
type: how-to
context: work
status: active
---
```
  </example>
</frontmatter-requirements>

<tag-conventions>
  <philosophy>Tags should be hierarchical (category/subcategory/specific) rather than flat single words.</philosophy>
  <rules>
    <rule>Use lowercase only</rule>
    <rule>Use hyphens for multi-word terms</rule>
    <rule>Maximum 3 hierarchy levels</rule>
    <rule>Minimum 2 tags per document</rule>
    <rule>Maximum 8 tags per document</rule>
    <rule>Each tag should serve a purpose</rule>
  </rules>
  <standard-categories>
    <!-- CUSTOMIZE: Adjust these categories to match your domains -->
    <category name="infrastructure">
      <subcategories>aws, azure, gcp, kubernetes, networking</subcategories>
    </category>
    <category name="homelab">
      <subcategories>monitoring, storage</subcategories>
    </category>
    <category name="programming">
      <subcategories>python, javascript, go, git</subcategories>
    </category>
    <category name="devops">
      <subcategories>cicd, gitops, kubernetes, helm</subcategories>
    </category>
    <category name="ai">
      <subcategories>claude, prompts</subcategories>
    </category>
    <category name="work">
      <!-- CUSTOMIZE: Replace with your work-specific subcategories -->
      <subcategories>{{YOUR_COMPANY}}, {{YOUR_PLATFORM}}</subcategories>
    </category>
    <category name="documentation">
      <subcategories>guides, reference</subcategories>
    </category>
    <category name="operations">
      <subcategories>runbooks, checklists, auto-generated</subcategories>
    </category>
    <category name="architecture">
      <subcategories>{system}/{aspect}</subcategories>
    </category>
  </standard-categories>
  <flat-to-hierarchical-mappings>
    <mapping flat="reference" hierarchical="documentation/reference/{topic}"/>
    <mapping flat="runbook" hierarchical="operations/runbooks/{service}"/>
    <mapping flat="how-to" hierarchical="documentation/guides/{topic}"/>
    <mapping flat="architecture" hierarchical="architecture/{system}/{aspect}"/>
    <mapping flat="checklist" hierarchical="operations/checklists/{process}"/>
    <mapping flat="auto-generated" hierarchical="operations/auto-generated"/>
  </flat-to-hierarchical-mappings>
  <examples>
    <good-example>
```yaml
tags:
  - infrastructure/kubernetes
  - homelab/monitoring/prometheus
  - devops/kubernetes/helm
```
    </good-example>
    <bad-example reason="Not lowercase, not hierarchical, spaces not allowed">
```yaml
tags:
  - Prometheus
  - reference
  - monitoring prometheus
```
    </bad-example>
  </examples>
</tag-conventions>

<para-methodology>
  <description>All documentation must be placed according to PARA (Projects, Areas, Resources, Archive).</description>

  <location name="Projects" path="Projects/">
    <criteria>
      <criterion>Has a defined goal or deliverable</criterion>
      <criterion>Has a timeline or deadline</criterion>
      <criterion>Will eventually be complete</criterion>
    </criteria>
    <structure>
      Projects/{Project Name}/
        README.md
        resources/
        notes/
    </structure>
    <on-complete>Move to Archive/</on-complete>
  </location>

  <location name="Areas" path="Areas/">
    <criteria>
      <criterion>No end date or completion state</criterion>
      <criterion>Maintained over time</criterion>
      <criterion>Requires consistent attention</criterion>
    </criteria>
    <examples>Home Lab Operations, Work Platform, Health and Fitness</examples>
  </location>

  <location name="Resources" path="Resources/">
    <criteria>
      <criterion>Timeless information</criterion>
      <criterion>Domain-organized knowledge</criterion>
      <criterion>No project or area affiliation</criterion>
    </criteria>
    <structure>
      Resources/{Domain}/{Sub-domain}/
        guides/
        references/
        concepts/
    </structure>
    <examples>Resources/DevOps/Kubernetes/, Resources/Programming/Python/</examples>
  </location>

  <location name="Archive" path="Archive/">
    <criteria>
      <criterion>Completed projects</criterion>
      <criterion>Outdated information</criterion>
      <criterion>Historical reference only</criterion>
    </criteria>
  </location>

  <decision-tree>
    <question order="1">Is this part of an active project with a timeline?</question>
    <answer-yes>Projects/{project}/</answer-yes>
    <answer-no>Continue to question 2</answer-no>

    <question order="2">Is this an ongoing area of responsibility?</question>
    <answer-yes>Areas/{area}/</answer-yes>
    <answer-no>Continue to question 3</answer-no>

    <question order="3">Is this timeless reference material?</question>
    <answer-yes>Resources/{domain}/</answer-yes>
    <answer-no>Consider if it belongs in the vault</answer-no>

    <question order="4">Is this historical/inactive?</question>
    <answer-yes>Archive/{original-location}/</answer-yes>
  </decision-tree>
</para-methodology>

<cross-linking-requirements>
  <minimum-requirements>
    <requirement>Link to parent or hub note (if exists)</requirement>
    <requirement>Link to at least 2-3 related concepts/documents</requirement>
  </minimum-requirements>
  <link-format>
    <wiki-link>[[Note Title]]</wiki-link>
    <wiki-link-display>[[Note Title|Display Text]]</wiki-link-display>
  </link-format>
  <required-section>
```markdown
## Related Notes

- [[Parent Hub]] - Broader context for this topic
- [[Related Concept 1]] - Explanation of connection
- [[Related Concept 2]] - Explanation of connection
```
  </required-section>
  <rule name="always-explain-relationship">
    <good-example>[[Prometheus]] - Core metrics backend that AlertManager depends on</good-example>
    <bad-example>[[Prometheus]] (no explanation)</bad-example>
  </rule>
</cross-linking-requirements>

<content-formatting>
  <heading-rules>
    <rule>Start with H1 (single #) for document title</rule>
    <rule>Use hierarchical progression: H1 -> H2 -> H3</rule>
    <rule>Never skip heading levels</rule>
    <rule>H1 should match filename (without extension)</rule>
  </heading-rules>
  <code-blocks>
    <rule>Always specify language for code blocks</rule>
    <supported-languages>bash, shell, yaml, json, python, javascript, go, promql, logql, markdown</supported-languages>
  </code-blocks>
  <lists>
    <unordered>Use - (hyphen)</unordered>
    <ordered>Use 1. numbering</ordered>
    <checklist>Use - [ ] for tasks</checklist>
  </lists>
  <emphasis>
    <bold>Important terms, keywords</bold>
    <italic>Emphasis, foreign terms</italic>
    <code>Commands, filenames, variables</code>
  </emphasis>
</content-formatting>

</documentation-standards>

<quality-checklists>

<checklist name="pre-flight" phase="before-creating">
  <item>Search for duplicates: Search vault for similar titles/topics</item>
  <item>Verify PARA placement: Confirm correct location (Projects/Areas/Resources)</item>
  <item>Identify related docs: Find documents that should be linked</item>
  <item>Check for hub notes: Look for parent/MOC notes that should link to this</item>
  <item>Review existing conventions: Check similar docs for formatting patterns</item>
</checklist>

<checklist name="creation" phase="during-writing">
  <item>Valid frontmatter: All required fields present and properly formatted</item>
  <item>Tag compliance: 2-8 hierarchical tags following conventions</item>
  <item>Heading hierarchy: Proper H1->H2->H3 progression, no skipping</item>
  <item>Code blocks: All code blocks have language specified</item>
  <item>Cross-links: Minimum 2-3 related notes linked with explanations</item>
  <item>Related Notes section: Included with connection explanations</item>
  <item>Clear title: H1 matches filename and describes content</item>
  <item>Examples included: Practical examples for how-to/runbook docs</item>
</checklist>

<checklist name="post-creation" phase="after-writing">
  <item>File created: Confirm file exists at expected path</item>
  <item>Valid YAML: Frontmatter parses without errors</item>
  <item>Links resolve: All wiki links point to existing notes</item>
  <item>No orphaned links: All referenced notes exist or are created</item>
  <item>Tag consistency: Tags match existing vault conventions</item>
  <item>Spell check: No obvious typos or grammatical errors</item>
  <item>Read for clarity: Content is clear and understandable</item>
</checklist>

</quality-checklists>

<anti-patterns>

<anti-pattern name="missing-frontmatter">
  <bad-example>
```yaml
---
tags: kubernetes
---
```
  </bad-example>
  <reason>Missing required fields (date, type), single-word tag</reason>
  <good-example>
```yaml
---
tags:
  - infrastructure/kubernetes
  - documentation/guides/deployment
date: 2025-11-10 14:00:00
type: how-to
---
```
  </good-example>
</anti-pattern>

<anti-pattern name="no-cross-links">
  <bad-example>Creating a note with no Related Notes section</bad-example>
  <reason>Orphaned document, no connections to knowledge graph</reason>
  <good-example>Always include Related Notes section with 2-3 links and explanations</good-example>
</anti-pattern>

<anti-pattern name="skipping-search">
  <bad-example>Creating a note without first searching to see if one exists</bad-example>
  <reason>May create duplicates, miss related content</reason>
  <good-example>
    1. Search vault for relevant keywords
    2. Review results
    3. Either update existing note OR create new with links
  </good-example>
</anti-pattern>

<anti-pattern name="flat-tags">
  <bad-example>
```yaml
tags:
  - kubernetes
  - troubleshooting
  - reference
```
  </bad-example>
  <reason>No context, no hierarchy, doesn't scale</reason>
  <good-example>
```yaml
tags:
  - infrastructure/kubernetes/troubleshooting
  - operations/runbooks/k8s
  - documentation/reference/kubernetes
```
  </good-example>
</anti-pattern>

</anti-patterns>
