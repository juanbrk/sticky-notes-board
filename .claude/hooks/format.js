#!/usr/bin/env node
/**
 * PostToolUse hook: Run ESLint --fix, then Prettier, on edited TypeScript files.
 *
 * Fires after Write, Edit, or MultiEdit tool calls. If the modified file
 * is a .ts or .tsx file inside src/, runs `npx eslint --fix` on that file
 * and then `npx prettier --write` on it (ESLint no longer runs Prettier since
 * eslint-plugin-prettier was removed). Prettier runs even when ESLint exits
 * non-zero, because ESLint still applies its fixes in that case.
 * Any errors that remain after auto-fix are surfaced back to Claude.
 *
 * Exit codes:
 *   0 - always (PostToolUse hooks cannot block; we communicate via stdout)
 */

import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const TS_EXTENSIONS = new Set(['.ts', '.tsx']);

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

  if (!filePath) {
    process.exit(0);
  }

  const resolvedPath = path.resolve(filePath);
  const ext = path.extname(filePath);

  // Only run for .ts/.tsx files inside src/
  if (!resolvedPath.startsWith(SRC_DIR) || !TS_EXTENSIONS.has(ext)) {
    process.exit(0);
  }

  try {
    execSync(`npx eslint --fix "${resolvedPath}"`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stdin, stdout, and stderr
    });
    // Silent on success
  } catch (error) {
    // ESLint exits non-zero when unfixable errors remain
    const stdout = error.stdout || '';
    const stderr = error.stderr || '';
    const output = [stdout, stderr].filter(Boolean).join('\n').trim();

    if (output) {
      process.stdout.write(
        `⚠️ ESLint errors remain in ${path.relative(PROJECT_ROOT, resolvedPath)} after auto-fix:\n\n${output}\n`
      );
    }
  }

  // Prettier runs regardless of the ESLint exit code: ESLint exits non-zero on
  // unfixable errors but still writes its fixes, so the file is ready to format.
  try {
    execSync(`npx prettier --write "${resolvedPath}"`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    // Silent on success
  } catch (error) {
    const detail = (error.stderr || error.stdout || error.message || '').toString().trim();
    process.stdout.write(
      `⚠️ Prettier could not format ${path.relative(PROJECT_ROOT, resolvedPath)}${detail ? `: ${detail.split('\n')[0]}` : ''}\n`
    );
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
