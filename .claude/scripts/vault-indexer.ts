#!/usr/bin/env bun
/**
 * vault-indexer.ts
 *
 * High-performance Obsidian vault indexer optimized for Claude Code content retrieval.
 * Runs as a single command with no interactive prompts.
 *
 * Usage: bun ~/.claude/scripts/vault-indexer.ts [--full|--incremental]
 *
 * Outputs:
 *   - vault-index.json: File metadata, tags, titles, summaries, links
 *   - vault-tags.json: Hierarchical tag registry with counts
 *   - vault-links.json: Link graph for relationship queries
 */

import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { homedir } from 'os';

// ============================================================================
// Configuration
// ============================================================================

// CUSTOMIZE: Set your Obsidian vault path here
// For iCloud: join(homedir(), 'Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName')
// For local:  join(homedir(), 'Documents/Obsidian')
const VAULT_PATH = join(homedir(), 'Library/Mobile Documents/iCloud~md~obsidian/Documents/YourVaultName');
const OUTPUT_DIR = join(VAULT_PATH, '.claude');

const EXCLUDED_DIRS = new Set(['.git', '.obsidian', '.claude', '.smart-connections', '.trash', 'node_modules']);
const EXCLUDED_PREFIXES = ['.smart-', '.DS_Store'];

// ============================================================================
// Types
// ============================================================================

interface FileEntry {
  path: string;
  title: string;
  modified: number;
  size: number;
  tags: string[];
  para: string | null;
  summary: string | null;
  links: string[];
  wordCount: number;
}

interface VaultIndex {
  version: string;
  lastUpdated: string;
  vaultPath: string;
  stats: {
    totalFiles: number;
    totalSizeBytes: number;
    filesWithTags: number;
    uniqueTags: number;
    totalLinks: number;
    avgWordsPerFile: number;
  };
  files: FileEntry[];
}

interface TagNode {
  count: number;
  files: string[];
  children?: Record<string, TagNode>;
}

interface TagRegistry {
  version: string;
  lastUpdated: string;
  stats: {
    totalTags: number;
    totalUsages: number;
  };
  tags: Record<string, TagNode>;
  flatList: string[];
  topTags: Array<{ tag: string; count: number }>;
}

interface LinkGraph {
  version: string;
  lastUpdated: string;
  stats: {
    totalLinks: number;
    filesWithOutgoingLinks: number;
    filesWithIncomingLinks: number;
    orphanFiles: number;
  };
  outgoing: Record<string, string[]>;
  incoming: Record<string, string[]>;
  orphans: string[];
}

// ============================================================================
// Parsing Functions
// ============================================================================

function extractFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, any> = {};

  // Simple YAML parser for frontmatter
  let currentKey: string | null = null;
  let inArray = false;
  let arrayItems: string[] = [];

  for (const line of yaml.split('\n')) {
    if (line.match(/^[a-zA-Z_-]+:/)) {
      // Save previous array if any
      if (currentKey && inArray) {
        result[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }

      const colonIdx = line.indexOf(':');
      currentKey = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      if (value === '' || value === '[]') {
        inArray = true;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        result[currentKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, '');
      }
    } else if (line.match(/^\s+-\s+/) && currentKey) {
      inArray = true;
      arrayItems.push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''));
    }
  }

  // Save final array if any
  if (currentKey && inArray) {
    result[currentKey] = arrayItems;
  }

  return result;
}

function extractTitle(content: string, filename: string): string {
  // Try H1 first
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // Fall back to filename without extension
  return basename(filename, '.md');
}

function extractSummary(content: string): string | null {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n?/, '');

  // Find first paragraph (skip headings, empty lines, and metadata)
  const lines = withoutFrontmatter.split('\n');
  let summary = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('```')) break;
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) continue;
    if (trimmed.startsWith('|')) continue;

    summary = trimmed;
    break;
  }

  if (!summary || summary.length < 20) return null;

  // Truncate to ~200 chars
  if (summary.length > 200) {
    summary = summary.slice(0, 197) + '...';
  }

  return summary;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];

  // Wiki-style links: [[link]] or [[link|alias]]
  const wikiLinks = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
  for (const match of wikiLinks) {
    const link = match[1].trim();
    // Normalize: remove .md extension if present, handle paths
    const normalized = link.replace(/\.md$/, '');
    if (!links.includes(normalized)) {
      links.push(normalized);
    }
  }

  return links;
}

function detectPARA(path: string): string | null {
  const parts = path.toLowerCase().split('/');
  const paraFolders = ['projects', 'areas', 'resources', 'archives'];

  for (const folder of paraFolders) {
    if (parts.includes(folder)) {
      return folder.charAt(0).toUpperCase() + folder.slice(1);
    }
  }

  return null;
}

function countWords(content: string): number {
  // Remove frontmatter and code blocks
  const cleaned = content
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');

  const words = cleaned.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

// ============================================================================
// File System Functions
// ============================================================================

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    if (EXCLUDED_PREFIXES.some(p => entry.name.startsWith(p))) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield fullPath;
    }
  }
}

async function processFile(filePath: string): Promise<FileEntry | null> {
  try {
    const [content, stats] = await Promise.all([
      readFile(filePath, 'utf-8'),
      stat(filePath)
    ]);

    const relPath = relative(VAULT_PATH, filePath);
    const frontmatter = extractFrontmatter(content);

    // Extract tags (handle both array and string formats)
    let tags: string[] = [];
    if (Array.isArray(frontmatter.tags)) {
      tags = frontmatter.tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof frontmatter.tags === 'string') {
      tags = [frontmatter.tags.trim()];
    }

    return {
      path: relPath,
      title: extractTitle(content, filePath),
      modified: Math.floor(stats.mtimeMs),
      size: stats.size,
      tags,
      para: detectPARA(relPath),
      summary: extractSummary(content),
      links: extractLinks(content),
      wordCount: countWords(content)
    };
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return null;
  }
}

// ============================================================================
// Index Building
// ============================================================================

async function buildIndex(): Promise<{ index: VaultIndex; tags: TagRegistry; links: LinkGraph }> {
  console.log('Scanning vault...');

  // Collect all file paths first
  const filePaths: string[] = [];
  for await (const path of walkDirectory(VAULT_PATH)) {
    filePaths.push(path);
  }

  console.log(`Found ${filePaths.length} markdown files`);

  // Process files in parallel batches
  const BATCH_SIZE = 50;
  const files: FileEntry[] = [];

  for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
    const batch = filePaths.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(processFile));

    for (const result of results) {
      if (result) files.push(result);
    }

    // Progress indicator
    process.stdout.write(`\rProcessed ${Math.min(i + BATCH_SIZE, filePaths.length)}/${filePaths.length} files`);
  }

  console.log('\nBuilding indices...');

  // Build tag registry
  const tagCounts: Map<string, { count: number; files: string[] }> = new Map();
  for (const file of files) {
    for (const tag of file.tags) {
      const existing = tagCounts.get(tag) || { count: 0, files: [] };
      existing.count++;
      existing.files.push(file.path);
      tagCounts.set(tag, existing);
    }
  }

  // Build hierarchical tag structure
  const tagTree: Record<string, TagNode> = {};
  for (const [tag, data] of tagCounts) {
    const parts = tag.split('/');
    let current = tagTree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { count: 0, files: [], children: {} };
      }
      current[part].count += data.count;
      if (i === parts.length - 1) {
        current[part].files = data.files;
      }
      current = current[part].children!;
    }
  }

  // Build link graph
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};
  const filePathSet = new Set(files.map(f => f.path.replace(/\.md$/, '')));

  for (const file of files) {
    const sourcePath = file.path.replace(/\.md$/, '');
    outgoing[sourcePath] = [];

    for (const link of file.links) {
      // Resolve relative links
      let targetPath = link;
      if (!link.includes('/')) {
        // Could be in same directory or anywhere - check both
        const sameDirPath = join(dirname(file.path), link).replace(/\.md$/, '');
        if (filePathSet.has(sameDirPath)) {
          targetPath = sameDirPath;
        }
      }

      outgoing[sourcePath].push(targetPath);

      if (!incoming[targetPath]) {
        incoming[targetPath] = [];
      }
      incoming[targetPath].push(sourcePath);
    }
  }

  // Find orphans (files with no incoming links)
  const orphans = files
    .filter(f => {
      const path = f.path.replace(/\.md$/, '');
      return !incoming[path] || incoming[path].length === 0;
    })
    .map(f => f.path);

  // Calculate stats
  const totalWords = files.reduce((sum, f) => sum + f.wordCount, 0);
  const totalLinks = files.reduce((sum, f) => sum + f.links.length, 0);

  const now = new Date().toISOString();

  const index: VaultIndex = {
    version: '3.0',
    lastUpdated: now,
    vaultPath: VAULT_PATH,
    stats: {
      totalFiles: files.length,
      totalSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
      filesWithTags: files.filter(f => f.tags.length > 0).length,
      uniqueTags: tagCounts.size,
      totalLinks,
      avgWordsPerFile: Math.round(totalWords / files.length)
    },
    files
  };

  const flatList = Array.from(tagCounts.keys()).sort();
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([tag, data]) => ({ tag, count: data.count }));

  const tags: TagRegistry = {
    version: '2.0',
    lastUpdated: now,
    stats: {
      totalTags: tagCounts.size,
      totalUsages: Array.from(tagCounts.values()).reduce((sum, d) => sum + d.count, 0)
    },
    tags: tagTree,
    flatList,
    topTags
  };

  const linkGraph: LinkGraph = {
    version: '1.0',
    lastUpdated: now,
    stats: {
      totalLinks,
      filesWithOutgoingLinks: Object.values(outgoing).filter(l => l.length > 0).length,
      filesWithIncomingLinks: Object.keys(incoming).length,
      orphanFiles: orphans.length
    },
    outgoing,
    incoming,
    orphans
  };

  return { index, tags, links: linkGraph };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const startTime = Date.now();

  console.log('Vault Indexer v3.0');
  console.log('==================\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const { index, tags, links } = await buildIndex();

  // Write files atomically
  console.log('Writing index files...');

  await Promise.all([
    writeFile(join(OUTPUT_DIR, 'vault-index.json'), JSON.stringify(index, null, 2)),
    writeFile(join(OUTPUT_DIR, 'vault-tags.json'), JSON.stringify(tags, null, 2)),
    writeFile(join(OUTPUT_DIR, 'vault-links.json'), JSON.stringify(links, null, 2))
  ]);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Report results
  console.log('\n==================');
  console.log(`Completed in ${duration}s\n`);

  console.log('File Index:');
  console.log(`  Files: ${index.stats.totalFiles}`);
  console.log(`  Size: ${(index.stats.totalSizeBytes / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  With tags: ${index.stats.filesWithTags} (${Math.round(100 * index.stats.filesWithTags / index.stats.totalFiles)}%)`);
  console.log(`  Avg words/file: ${index.stats.avgWordsPerFile}`);

  console.log('\nTag Registry:');
  console.log(`  Unique tags: ${tags.stats.totalTags}`);
  console.log(`  Total usages: ${tags.stats.totalUsages}`);

  console.log('\nLink Graph:');
  console.log(`  Total links: ${links.stats.totalLinks}`);
  console.log(`  Orphan files: ${links.stats.orphanFiles}`);

  console.log('\nTop 10 Tags:');
  for (const { tag, count } of tags.topTags.slice(0, 10)) {
    console.log(`  ${tag}: ${count}`);
  }

  console.log('\nOutput files:');
  console.log(`  ${join(OUTPUT_DIR, 'vault-index.json')}`);
  console.log(`  ${join(OUTPUT_DIR, 'vault-tags.json')}`);
  console.log(`  ${join(OUTPUT_DIR, 'vault-links.json')}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
