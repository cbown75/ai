/**
 * hook-utils.ts
 *
 * Shared utilities for Claude Code hooks.
 * Provides consistent patterns for:
 * - Reading stdin input
 * - Subagent detection
 * - JSON parsing
 * - Error handling (fail-open)
 * - JSONL file operations
 *
 * Usage:
 *   import { readHookInput, isSubagent, failOpen, appendJsonLine } from './lib/hook-utils';
 *
 *   failOpen(async () => {
 *     if (isSubagent()) return;
 *     const input = await readHookInput<MyInputType>();
 *     if (!input) return;
 *     // ... hook logic
 *   });
 */

import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// ============================================================================
// Common Hook Input Types
// ============================================================================

/** Base hook input - all hooks receive at least these fields */
export interface BaseHookInput {
  session_id: string;
  hook_event_name: string;
  transcript_path?: string;
  cwd?: string;
}

/** PreToolUse / PostToolUse hook input */
export interface ToolHookInput extends BaseHookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response?: unknown;
  tool_use_id?: string;
}

/** UserPromptSubmit hook input */
export interface PromptHookInput extends BaseHookInput {
  prompt: string;
}

/** SessionStart / SessionEnd hook input */
export interface SessionHookInput extends BaseHookInput {
  // Session hooks may have minimal input
}

// ============================================================================
// Subagent Detection
// ============================================================================

/**
 * Check if running in a subagent context.
 * Subagents should typically skip most hook logic to avoid duplication.
 */
export function isSubagent(): boolean {
  const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
  return (
    claudeProjectDir.includes('/.claude/agents/') ||
    process.env.CLAUDE_AGENT_TYPE !== undefined
  );
}

/**
 * Exit immediately if running in a subagent context.
 * Use at the start of hooks that shouldn't run for subagents.
 */
export function exitIfSubagent(): void {
  if (isSubagent()) {
    process.exit(0);
  }
}

// ============================================================================
// JSON Parsing
// ============================================================================

/**
 * Safely parse JSON, returning null on failure.
 */
export function parseJsonSafe<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

// ============================================================================
// Stdin Reading
// ============================================================================

/**
 * Read all stdin input with a timeout.
 * Returns empty string if no input or timeout.
 */
export async function readStdin(timeoutMs: number = 5000): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    const decoder = new TextDecoder();
    const reader = Bun.stdin.stream().getReader();

    const timer = setTimeout(() => {
      reader.cancel().catch(() => {});
      resolve(data);
    }, timeoutMs);

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          data += decoder.decode(value, { stream: true });
        }
      } catch {
        // Ignore read errors
      } finally {
        clearTimeout(timer);
        resolve(data);
      }
    })();
  });
}

/**
 * Read and parse hook input from stdin.
 * Returns null if no input, parse failure, or timeout.
 *
 * @param timeoutMs - Maximum time to wait for input (default: 5000ms)
 */
export async function readHookInput<T extends BaseHookInput>(
  timeoutMs: number = 5000
): Promise<T | null> {
  const input = await readStdin(timeoutMs);
  if (!input.trim()) return null;
  return parseJsonSafe<T>(input);
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Wrap hook logic to ensure it never blocks Claude Code.
 * On any error, logs to stderr and exits with code 0 (allow).
 *
 * Usage:
 *   failOpen(async () => {
 *     // hook logic here
 *   });
 */
export async function failOpen(fn: () => Promise<void>): Promise<never> {
  try {
    await fn();
    process.exit(0);
  } catch (error) {
    console.error('Hook error (failing open):', error);
    process.exit(0);
  }
}

/**
 * Wrap hook logic that may need to block (exit code 2).
 * On unexpected errors, fails open.
 *
 * Usage:
 *   runHook(async () => {
 *     if (shouldBlock) {
 *       console.log('Blocked because...');
 *       return { block: true };
 *     }
 *     return { block: false };
 *   });
 */
export async function runHook(
  fn: () => Promise<{ block: boolean; message?: string }>
): Promise<never> {
  try {
    const result = await fn();
    if (result.block) {
      if (result.message) {
        console.log(result.message);
      }
      process.exit(2); // Block
    }
    process.exit(0); // Allow
  } catch (error) {
    console.error('Hook error (failing open):', error);
    process.exit(0);
  }
}

// ============================================================================
// Content Extraction
// ============================================================================

/**
 * Extract text from Claude message content.
 * Handles both string and array-of-blocks formats.
 */
export function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => {
        if (typeof c === 'string') return c;
        if (c?.text) return c.text;
        if (c?.content) return String(c.content);
        return '';
      })
      .join(' ')
      .trim();
  }
  return '';
}

// ============================================================================
// Truncation
// ============================================================================

/**
 * Truncate a value if it exceeds max size.
 * Returns the (possibly truncated) value and whether truncation occurred.
 */
export function truncateIfNeeded(
  value: unknown,
  maxSize: number
): { value: unknown; truncated: boolean } {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (str && str.length > maxSize) {
    return {
      value: str.slice(0, maxSize) + `... [truncated ${str.length - maxSize} chars]`,
      truncated: true,
    };
  }
  return { value, truncated: false };
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// Filename Helpers
// ============================================================================

/**
 * Sanitize a string for use in filenames
 */
export function sanitizeFilename(name: string, maxLength: number = 50): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

// ============================================================================
// JSONL File Operations
// ============================================================================

/**
 * Append a JSON object as a line to a JSONL file.
 * Creates parent directories if they don't exist.
 */
export function appendJsonLine(filePath: string, data: unknown): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  appendFileSync(filePath, JSON.stringify(data) + '\n');
}

/**
 * Parse JSONL content into array of objects
 */
export function parseJsonLines<T = unknown>(content: string): T[] {
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => parseJsonSafe<T>(line))
    .filter((item): item is T => item !== null);
}
