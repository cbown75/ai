---
name: git-conventions
description: |
  Git conventions using conventional commits for all repositories. Enforces commit format, branch hygiene, stale branch detection, attribution rules, and PR workflow. Use for all git formatting - ticket-prefix overrides are handled by the dev-workflow skill.
---

<objective>
Enforce consistent Git conventions using conventional commits. Handles commit message format, branch naming, stale branch detection, attribution rules, and PR creation. This is the base git skill - the dev-workflow skill can override commit format with ticket prefixes for work repositories.
</objective>

<commit_format>
## Conventional Commits

All commits use conventional commit format:

**Format:** `{type}({scope}): {message}`

The scope is optional. The message should be lowercase, imperative mood, no period at end.

**Types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no code change) |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies, maintenance |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `build` | Build system changes |

**Examples:**
```
feat: add user authentication
fix: resolve memory leak in worker pool
docs: update API documentation for v2 endpoints
refactor: simplify error handling in middleware
chore(deps): update dependencies to latest
feat(auth): add OAuth2 support
ci: add GitHub Actions workflow for linting
```

**Breaking changes:** Add `!` after type or scope:
```
feat!: remove deprecated API endpoints
feat(auth)!: change token format to JWT
```
</commit_format>

<branch_naming>
## Branch Naming

**Format:** `{type}/{description}`

Use the same types as commits. Description should be lowercase with hyphens.

**Examples:**
```
feat/user-authentication
fix/memory-leak-worker
docs/api-v2-endpoints
refactor/error-handling
chore/update-dependencies
```

**Always create a feature branch.** Never commit directly to `main` or `master`.

```bash
# Create and switch to new branch
git checkout -b feat/your-feature-name
```
</branch_naming>

<!-- CUSTOMIZE: Set your attribution preferences -->
<attribution_rules>
## Attribution Rules

**Never include in commit messages:**
- `Co-Authored-By: Claude <noreply@anthropic.com>`
- Any mention of Claude or AI assistance

<!-- CUSTOMIZE: If you WANT Claude attribution in some repos, remove this section
     and let Claude Code's default attribution behavior apply -->

**Commit message template:**
```bash
git commit -m "$(cat <<'EOF'
feat: your commit message here
EOF
)"
```

Note: No trailing `Co-Authored-By` line. Claude Code may try to add this automatically - the tool-governance hook or this skill should catch and remove it.
</attribution_rules>

<workflow>
## Complete Git Commit Workflow

1. **Create branch (if not already on one):**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Check for stale branch (merged PR):**
   ```bash
   BRANCH=$(git branch --show-current)
   PR_STATE=$(gh pr list --head "$BRANCH" --state merged --json state -q '.[0].state' 2>/dev/null)
   if [[ "$PR_STATE" == "MERGED" ]]; then
     echo "ERROR: Branch '$BRANCH' has a merged PR! Create a new branch."
     exit 1
   fi
   ```

3. **Stage specific files:**
   ```bash
   git add <specific-files>  # Never use git add . or git add -A
   ```

4. **Commit with conventional format:**
   ```bash
   git commit -m "$(cat <<'EOF'
   feat: description of changes
   EOF
   )"
   ```

5. **Push:**
   ```bash
   git push -u origin "$BRANCH"
   ```
</workflow>

<stale_branch_check>
## Stale Branch Detection

**CRITICAL: Before pushing to ANY branch, check if it has a merged PR:**

```bash
BRANCH=$(git branch --show-current)

# Skip check for main/master
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
  PR_STATE=$(gh pr list --head "$BRANCH" --state merged --json number,state -q '.[0].state' 2>/dev/null)

  if [[ "$PR_STATE" == "MERGED" ]]; then
    echo "ERROR: Branch '$BRANCH' has a merged PR!"
    echo "You should NOT push to this branch."
    echo ""
    echo "To fix:"
    echo "  1. git checkout main && git pull"
    echo "  2. git checkout -b NEW-BRANCH-NAME"
    echo "  3. Cherry-pick or recreate your changes"
    echo "  4. Push to the new branch"
    exit 1
  fi
fi
```

**Why this matters:**
- Pushing to a branch with a merged PR creates orphaned commits
- The changes won't be included in any PR
- CI/CD pipelines may not trigger correctly
</stale_branch_check>

<pr_workflow>
## Pull Request Creation

1. **Push branch:**
   ```bash
   git push -u origin "$(git branch --show-current)"
   ```

2. **Create PR with gh CLI:**
   ```bash
   gh pr create --title "feat: description" --body "$(cat <<'EOF'
   ## Summary
   - Change 1
   - Change 2

   ## Test plan
   - [ ] Tests pass
   - [ ] Manual verification
   EOF
   )"
   ```

3. **Open PR in browser:**
   ```bash
   gh pr view --web
   ```

**Complete command (create + open):**
```bash
gh pr create --title "feat: description" --body "Summary of changes" && gh pr view --web
```

**PR title format:** Use the same conventional commit format as commits.
</pr_workflow>

<validation>
## Pre-Commit Checklist

- [ ] On a feature branch (not main/master)
- [ ] Commit message uses conventional format (`type: message`)
- [ ] No Claude attribution in commit message
- [ ] Only specific files staged (not `git add .`)
- [ ] Branch does NOT have a merged PR

## Pre-Push Checklist

- [ ] Stale branch check passed
- [ ] Branch is up to date with remote
- [ ] Not pushing directly to main/master
</validation>

<success_criteria>
This skill is working correctly when:
- All commits use `type: message` conventional format
- No commits contain unwanted attribution
- Branches follow `type/description` naming
- Stale branches (with merged PRs) are detected before pushing
- PRs are created with conventional commit titles
- No commits land directly on main/master
</success_criteria>
