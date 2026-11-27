#!/usr/bin/env node
/**
 * PostToolUse hook: Run TypeScript type-checker after file edits.
 *
 * Fires after Write, Edit, or MultiEdit tool calls. If the modified file
 * is inside src/, runs `npx tsc --noEmit` on the full project and feeds
 * any type errors back to Claude so it can self-correct in the same session.
 *
 * Exit codes:
 *   0 — always (PostToolUse hooks cannot block; we communicate via stdout)
 */

import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  let toolCall;
  try {
    toolCall = JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    process.exit(0);
  }

  const input = toolCall.tool_input ?? {};
  const filePath = input.file_path ?? input.path ?? '';

  // Only run for files inside src/
  if (!filePath || !path.resolve(filePath).startsWith(SRC_DIR)) {
    process.exit(0);
  }

  try {
    execSync('npx tsc --noEmit', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stdin, stdout, and stderr
    });
    // Silent on success
  } catch (error) {
    // tsc writes errors to both stdout and stderr; combine both
    const stdout = error.stdout || '';
    const stderr = error.stderr || '';
    const output = [stdout, stderr].filter(Boolean).join('\n').trim();

    if (output) {
      process.stdout.write(
        `❌ TypeScript errors detected after editing ${path.relative(PROJECT_ROOT, filePath)}:\n\n${output}\n`
      );
    }
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
