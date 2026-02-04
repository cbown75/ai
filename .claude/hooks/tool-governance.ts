#!/usr/bin/env bun
/**
 * tool-governance.ts
 *
 * PreToolUse hook that enforces tool usage policies and security validation.
 *
 * Two-layer protection:
 * 1. MCP Tool Blocking - Blocks MCP tools that have better CLI alternatives
 * 2. Command Security - Validates Bash commands against dangerous patterns
 *
 * Principles:
 * - CLI-first: Prefer command-line tools over MCP when both work
 * - Filesystem-first: Use index files instead of API searches
 * - Security-first: Block dangerous commands before execution
 * - Transparency: CLI commands are visible, debuggable, portable
 *
 * Usage:
 *   Runs automatically on PreToolUse for all tool invocations.
 *   Outputs blocking reason to stderr and exits with code 2 to block.
 *   Exits with code 0 to allow.
 *
 * Configuration:
 *   To register this hook, add to your ~/.claude/settings.json:
 *   {
 *     "hooks": {
 *       "PreToolUse": [
 *         {
 *           "matcher": "",
 *           "hooks": [
 *             {
 *               "type": "command",
 *               "command": "bun ~/.claude/hooks/tool-governance.ts"
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 */

import { readHookInput, ToolHookInput } from './lib/hook-utils';

// =============================================================================
// TYPES
// =============================================================================

interface BlockedTool {
  pattern: string | RegExp;
  reason: string;
  alternative: string;
}

interface SecurityTier {
  patterns: RegExp[];
  action: 'block' | 'warn' | 'log' | 'remind';
  message: string;
}

// =============================================================================
// SECURITY TIERS - Bash Command Patterns
// =============================================================================

const SECURITY_TIERS: Record<string, SecurityTier> = {
  // Tier 1: Catastrophic - Always block
  catastrophic: {
    patterns: [
      /rm\s+(-rf?|--recursive)\s+[\/~]/i,
      /rm\s+(-rf?|--recursive)\s+\*/i,
      />\s*\/dev\/sd[a-z]/i,
      /mkfs\./i,
      /dd\s+if=.*of=\/dev/i,
      /dd\s+if=\/dev\/zero/i,
      /diskutil\s+eraseDisk/i,
      /diskutil\s+zeroDisk/i,
      /diskutil\s+partitionDisk/i,
      /diskutil\s+apfs\s+deleteContainer/i,
      /diskutil\s+apfs\s+eraseVolume/i,
    ],
    action: 'block',
    message: 'BLOCKED: Catastrophic deletion/destruction detected'
  },

  // Tier 2: Reverse shells - Always block
  reverseShell: {
    patterns: [
      /bash\s+-i\s+>&\s*\/dev\/tcp/i,
      /nc\s+(-e|--exec)\s+\/bin\/(ba)?sh/i,
      /python.*socket.*connect/i,
      /perl.*socket.*connect/i,
      /ruby.*TCPSocket/i,
      /php.*fsockopen/i,
      /socat.*exec/i,
      /\|\s*\/bin\/(ba)?sh/i,
    ],
    action: 'block',
    message: 'BLOCKED: Reverse shell pattern detected'
  },

  // Tier 3: Remote code execution - Always block
  remoteCodeExec: {
    patterns: [
      /curl.*\|\s*(ba)?sh/i,
      /wget.*\|\s*(ba)?sh/i,
      /curl.*(-o|--output).*&&.*chmod.*\+x/i,
      /base64\s+-d.*\|\s*(ba)?sh/i,
    ],
    action: 'block',
    message: 'BLOCKED: Remote code execution pattern detected'
  },

  // Tier 4: Prompt injection - Block
  promptInjection: {
    patterns: [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /disregard\s+(all\s+)?prior\s+instructions/i,
      /you\s+are\s+now\s+(in\s+)?[a-z]+\s+mode/i,
      /new\s+instruction[s]?:/i,
      /system\s+prompt:/i,
      /\[INST\]/i,
      /<\|im_start\|>/i,
    ],
    action: 'block',
    message: 'BLOCKED: Prompt injection pattern detected'
  },

  // Tier 5: Data exfiltration - Block
  exfiltration: {
    patterns: [
      /curl.*(@|--upload-file)/i,
      /tar.*\|.*curl/i,
      /zip.*\|.*nc/i,
    ],
    action: 'block',
    message: 'BLOCKED: Data exfiltration pattern detected'
  },

  // Tier 6: Config bulk deletion - Block
  configBulkDelete: {
    patterns: [
      /rm\s+(-rf?|--recursive).*\.claude/i,
      /rm\s+(-rf?|--recursive).*\.kube/i,
      /rm\s+(-rf?|--recursive).*\.ssh/i,
      /rm\s+(-rf?|--recursive).*\.aws/i,
      /rm\s+(-rf?|--recursive).*\.azure/i,
      /rm.*\.claude\/settings\.json/i,
      /rm.*\.kube\/config/i,
      /rm.*\.ssh\/(id_|known_hosts|authorized)/i,
    ],
    action: 'block',
    message: 'BLOCKED: Critical configuration protection triggered'
  },

  // Tier 6.5: Config file deletion - Block with manual execution hint
  configFileDelete: {
    patterns: [
      /rm\s+[^-].*\.claude\//i,
      /rm\s+[^-].*\.kube\//i,
    ],
    action: 'block',
    message: 'BLOCKED: Config file deletion requires manual confirmation. Run this command yourself if intended.'
  },

  // Tier 7: GitHub destructive - Block
  githubDestructive: {
    patterns: [
      /gh\s+repo\s+delete/i,
      /gh\s+repo\s+edit\s+--visibility\s+public/i,
      /gh\s+release\s+delete/i,
      /gh\s+secret\s+delete/i,
      /gh\s+variable\s+delete/i,
    ],
    action: 'block',
    message: 'BLOCKED: GitHub destructive operation. Run manually if intended.'
  },

  // Tier 8: Git destructive - Block
  gitDestructive: {
    patterns: [
      /git\s+clean\s+-[a-z]*f/i,
    ],
    action: 'block',
    message: 'BLOCKED: git clean -f permanently deletes untracked files. Run manually if intended.'
  },

  // Tier 9: Kubernetes destructive - Block
  kubernetesDestructive: {
    patterns: [
      /^\s*(?:sudo\s+)?kubectl\b.*\bdelete\b/i,
      /^\s*(?:sudo\s+)?kubectl\b.*\bpatch\b/i,
    ],
    action: 'block',
    message: 'BLOCKED: kubectl delete/patch can modify or destroy resources. Run manually if intended.'
  },

  // Tier 10: Terraform/Tofu destructive - Block
  terraformDestructive: {
    patterns: [
      /^\s*(?:sudo\s+)?terraform\b.*\bdestroy\b/i,
      /^\s*(?:sudo\s+)?tofu\b.*\bdestroy\b/i,
      /^\s*(?:sudo\s+)?terraform\s+state\s+rm\b/i,
      /^\s*(?:sudo\s+)?tofu\s+state\s+rm\b/i,
      /^\s*(?:sudo\s+)?terraform\s+force-unlock\b/i,
      /^\s*(?:sudo\s+)?tofu\s+force-unlock\b/i,
    ],
    action: 'block',
    message: 'BLOCKED: terraform/tofu destroy/state rm/force-unlock can destroy infrastructure. Run manually if intended.'
  },

  // Tier 11: Helm destructive - Block
  helmDestructive: {
    patterns: [
      /^\s*(?:sudo\s+)?helm\b.*\buninstall\b/i,
      /^\s*(?:sudo\s+)?helm\b.*\bdelete\b/i,
    ],
    action: 'block',
    message: 'BLOCKED: helm uninstall removes releases. Run manually if intended.'
  },

  // Tier 12: Flux destructive - Block
  fluxDestructive: {
    patterns: [
      /^\s*(?:sudo\s+)?flux\b.*\buninstall\b/i,
      /^\s*(?:sudo\s+)?flux\b.*\bdelete\b/i,
    ],
    action: 'block',
    message: 'BLOCKED: flux uninstall/delete removes GitOps resources. Run manually if intended.'
  },

  // Tier 13: AWS destructive - Block
  awsDestructive: {
    patterns: [
      /aws\s+ec2\s+terminate-instances/i,
      /aws\s+s3\s+rm/i,
      /aws\s+s3\s+rb/i,
      /aws\s+s3api\s+delete/i,
      /aws\s+rds\s+delete/i,
      /aws\s+lambda\s+delete/i,
      /aws\s+iam\s+delete/i,
      /aws\s+eks\s+delete/i,
      /aws\s+cloudformation\s+delete/i,
      /aws\s+ecr\s+delete/i,
      /aws\s+ssm\s+delete/i,
      /aws\s+route53\s+delete/i,
    ],
    action: 'block',
    message: 'BLOCKED: AWS destructive operation. Run manually if intended.'
  },

  // Tier 14: Environment/credential access - Warn
  envManipulation: {
    patterns: [
      /export\s+(ANTHROPIC|OPENAI|AWS|AZURE)_.*KEY/i,
      /echo\s+\$\{?(ANTHROPIC|OPENAI|AWS|AZURE)_.*KEY/i,
      /env\s*\|.*KEY/i,
      /printenv.*KEY/i,
    ],
    action: 'warn',
    message: 'WARNING: Environment/credential access detected'
  },

  // Tier 15: System modification - Log only
  systemMod: {
    patterns: [
      /chmod\s+777/i,
      /chown\s+root/i,
      /sudo\s+/i,
      /systemctl\s+(stop|disable)/i,
    ],
    action: 'log',
    message: 'LOGGED: System modification command'
  },

  // CUSTOMIZE: Add your own tiers below
  // Examples of personal tiers you might add:
  //
  // Git commit signing enforcement:
  // gitUnsigned: {
  //   patterns: [/\bgit\s+commit\s+(?!.*-S).*-m\b/i],
  //   action: 'block',
  //   message: 'BLOCKED: Unsigned commit. Use: git commit -S -m "type: description"'
  // },
  //
  // Conventional commit format enforcement:
  // gitNonConventional: {
  //   patterns: [
  //     /\bgit\s+commit\s+(-S\s+)?-m\s+["'](?!(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([a-z0-9-]+\))?:)/i,
  //   ],
  //   action: 'block',
  //   message: 'BLOCKED: Non-conventional commit format. Required: type: description'
  // },
  //
  // Claude attribution blocking (for personal repos):
  // gitClaudeAttribution: {
  //   patterns: [/git\s+commit.*Co-Authored-By.*Claude/i],
  //   action: 'block',
  //   message: 'BLOCKED: Remove Claude attribution from commit message'
  // },
};

// =============================================================================
// BLOCKED MCP TOOLS
// =============================================================================

// CUSTOMIZE: Add MCP tools that you want to block in favor of CLI alternatives
const BLOCKED_TOOLS: BlockedTool[] = [
  // Obsidian MCP tools - use index files instead
  {
    pattern: 'mcp__obsidian__obsidian_simple_search',
    reason: 'Obsidian MCP search is slower than index files',
    alternative: `Use vault-index.json: cat ~/.claude/vault-index.json | jq '.files[] | select(.path | test("keyword"; "i"))'`,
  },
  {
    pattern: 'mcp__obsidian__obsidian_complex_search',
    reason: 'Obsidian MCP complex search should use index files',
    alternative: `Use vault-index.json: cat ~/.claude/vault-index.json | jq '.files[] | select(.tags | index("tag-name"))'`,
  },
  {
    pattern: 'mcp__obsidian__obsidian_list_files_in_vault',
    reason: 'Listing all vault files is expensive via MCP',
    alternative: `Use vault-index.json: cat ~/.claude/vault-index.json | jq '.files[].path'`,
  },
  {
    pattern: 'mcp__obsidian__obsidian_list_files_in_dir',
    reason: 'Listing directory files should use filesystem tools',
    alternative: `Use Bash: ls -la "$VAULT_PATH/Projects/" or Glob tool`,
  },
  // CUSTOMIZE: Add more blocked tools as needed. Examples:
  // {
  //   pattern: 'mcp__github-official__create_pull_request',
  //   reason: 'Use gh CLI for PRs - transparent, debuggable',
  //   alternative: 'Use: gh pr create --title "..." --body "..."',
  // },
];

// =============================================================================
// GIT WORKFLOW VALIDATION
// =============================================================================

interface GitContext {
  branch: string | null;
  isDotfilesRepo: boolean;
  isOnMain: boolean;
  repoName: string | null;
}

/**
 * Extract the target directory from a command that starts with cd
 * e.g., "cd ~/git/foo && git push" -> ~/git/foo expanded
 */
function extractCdDirectory(command: string): string | null {
  const cdMatch = command.match(/^cd\s+([^\s&;]+)/);
  if (!cdMatch) return null;

  let dir = cdMatch[1];
  if (dir.startsWith('~')) {
    dir = dir.replace('~', process.env.HOME || '');
  }
  return dir;
}

function getGitContext(cwd?: string): GitContext {
  try {
    const options: { stdout: 'pipe'; stderr: 'pipe'; cwd?: string } = {
      stdout: 'pipe',
      stderr: 'pipe',
    };
    if (cwd) options.cwd = cwd;

    const branchResult = Bun.spawnSync(['git', 'branch', '--show-current'], options);
    const branch = branchResult.stdout.toString().trim() || null;

    const toplevelResult = Bun.spawnSync(['git', 'rev-parse', '--show-toplevel'], options);
    const toplevel = toplevelResult.stdout.toString().trim();
    const repoName = toplevel.split('/').pop() || null;

    // CUSTOMIZE: Add your dotfiles repo names here
    const isDotfilesRepo = repoName ?
      ['dotfiles', 'dotfiles-public', '.dotfiles', '.dotfiles-public'].includes(repoName) : false;

    const isOnMain = branch === 'main' || branch === 'master';

    return { branch, isDotfilesRepo, isOnMain, repoName };
  } catch {
    return { branch: null, isDotfilesRepo: false, isOnMain: false, repoName: null };
  }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Split a command into segments by chain operators (&&, ||, ;, |)
 * Note: This is a simple split that doesn't handle quoted strings perfectly,
 * but catches the vast majority of real-world bypass attempts.
 */
function splitCommandChain(command: string): string[] {
  const segments = command.split(/\s*(?:&&|\|\||;|\|)\s*/);
  return segments.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Validate a single command segment against security tiers
 */
function validateSegment(segment: string): { allowed: boolean; tier?: string; message?: string; action?: string } {
  for (const [tierName, tier] of Object.entries(SECURITY_TIERS)) {
    for (const pattern of tier.patterns) {
      if (pattern.test(segment)) {
        return {
          allowed: tier.action !== 'block',
          tier: tierName,
          message: tier.message,
          action: tier.action
        };
      }
    }
  }
  return { allowed: true };
}

/**
 * Validate a command by checking ALL segments in a chain.
 * If any segment is dangerous, the entire command is blocked.
 */
function validateCommand(command: string): { allowed: boolean; tier?: string; message?: string; action?: string; segment?: string } {
  if (!command || command.length < 3) {
    return { allowed: true };
  }

  // CUSTOMIZE: Add pre-split checks here for patterns that break when split
  // Example: gh pr create must be followed by gh pr view --web
  // if (/\bgh\s+pr\s+create\b/i.test(command)) {
  //   if (!/\bgh\s+pr\s+create\b[\s\S]*(?:&&|;)\s*gh\s+pr\s+view\s+--web/i.test(command)) {
  //     return {
  //       allowed: false,
  //       tier: 'ghPrCreate',
  //       message: 'BLOCKED: PR must be opened in browser after creation.',
  //       segment: command.match(/gh\s+pr\s+create[^&;]*/i)?.[0] || 'gh pr create'
  //     };
  //   }
  // }

  // Split into segments and validate each
  const segments = splitCommandChain(command);

  for (const segment of segments) {
    const result = validateSegment(segment);
    if (!result.allowed) {
      return {
        ...result,
        segment: segment,
        message: `${result.message}\n\nBlocked segment: ${segment}`
      };
    }
    // Propagate warnings/logs for any segment
    if (result.action === 'warn' || result.action === 'log') {
      return { ...result, segment };
    }
  }

  return { allowed: true };
}

function isBlockedTool(toolName: string): BlockedTool | null {
  for (const blocked of BLOCKED_TOOLS) {
    if (typeof blocked.pattern === 'string') {
      if (toolName === blocked.pattern) return blocked;
    } else if (blocked.pattern.test(toolName)) {
      return blocked;
    }
  }
  return null;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  try {
    const hookData = await readHookInput<ToolHookInput>();
    if (!hookData) {
      process.exit(0);
    }

    const toolName = hookData.tool_name;

    // Layer 1: MCP Tool Blocking
    const blocked = isBlockedTool(toolName);
    if (blocked) {
      console.error(`BLOCKED: ${toolName}. ${blocked.reason} Use instead: ${blocked.alternative}`);
      process.exit(2);
    }

    // Layer 2: Bash Command Security
    if (toolName === 'Bash') {
      const command = hookData.tool_input?.command as string;

      if (command) {
        // CUSTOMIZE: Check if this is a git commit in repos that should be exempt
        const isGitCommit = /\bgit\s+commit\b/i.test(command);
        let skipGitEnforcement = false;

        if (isGitCommit) {
          const cmdCwd = extractCdDirectory(command);
          const gitContext = getGitContext(cmdCwd || undefined);

          if (gitContext.isDotfilesRepo) {
            // Dotfiles repos: exempt from strict git rules (signing, conventional format)
            skipGitEnforcement = true;
          }
        }

        const validation = validateCommand(command);

        if (!validation.allowed) {
          // Skip git signing/format enforcement for exempt repos
          const isGitEnforcementTier = ['gitUnsigned', 'gitNonConventional'].includes(validation.tier || '');

          if (skipGitEnforcement && isGitEnforcementTier) {
            // Allow - exempt repo
          } else {
            console.error(`${validation.message}`);
            process.exit(2);
          }
        }

        // Block direct push to main/master in non-dotfiles repos
        if (/git\s+push/.test(command)) {
          const explicitMainPush = /git\s+push\s+\S+\s+(main|master)\b/i.test(command);
          const barePush = /git\s+push\s*$/.test(command) || /git\s+push\s+origin\s*$/.test(command);

          if (explicitMainPush || barePush) {
            const cmdCwd = extractCdDirectory(command);
            const gitContext = getGitContext(cmdCwd || undefined);

            // Allow dotfiles repos to push to main
            if (!gitContext.isDotfilesRepo) {
              if (barePush && gitContext.isOnMain) {
                console.error(`BLOCKED: Direct push to ${gitContext.branch} not allowed. Create a feature branch, push it, then create a PR.`);
                process.exit(2);
              } else if (explicitMainPush) {
                console.error(`BLOCKED: Direct push to main/master not allowed. Create a feature branch, push it, then create a PR.`);
                process.exit(2);
              }
            }
          }
        }

        // Handle warn/log actions
        if (validation.action === 'warn') {
          console.error(`[Security] ${validation.message}`);
          console.error(`[Security] Command: ${command.substring(0, 100)}`);
        } else if (validation.action === 'log') {
          console.error(`[Security] ${validation.message}`);
        }
      }
    }

    // CUSTOMIZE: Layer 3 - Write/Edit Path Protection
    // Uncomment and adjust if you use symlinked dotfiles:
    //
    // if (toolName === 'Write' || toolName === 'Edit') {
    //   const filePath = (hookData.tool_input?.file_path as string) || '';
    //   const home = process.env.HOME || '';
    //
    //   // Allow edits to dotfiles source
    //   const dotfilesSource = `${home}/.dotfiles/.claude/`;
    //   if (filePath.startsWith(dotfilesSource)) {
    //     process.exit(0);
    //   }
    //
    //   // Block edits to the runtime symlink location
    //   const runtimeLocation = `${home}/.claude/`;
    //   if (filePath.startsWith(runtimeLocation)) {
    //     console.error('BLOCKED: Edit the source in ~/.dotfiles/.claude/ instead of the symlink ~/.claude/');
    //     process.exit(2);
    //   }
    // }

    process.exit(0);
  } catch (error) {
    console.error('Tool governance error (failing open):', error);
    process.exit(0);
  }
}

main();
