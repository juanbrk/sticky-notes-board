#!/usr/bin/env node
/**
 * PostToolUse advisory: warn when `?: any` or `: any` appears in a *.types.ts file.
 *
 * Fires after Write, Edit, or MultiEdit on any file. If the modified file
 * is a *.types.ts file, scans its content for bare `any` type annotations
 * and emits a non-blocking advisory to stderr so Claude can self-correct.
 *
 * Does NOT warn on:
 *   - Comment lines (// or *)
 *   - Type casts (as any)
 *
 * Exit code 0 always — advisory only, never blocks the tool call.
 */

import { readFileSync } from 'fs';
import path from 'path';

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

  if (!filePath.endsWith('.types.ts')) {
    process.exit(0);
  }

  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }

  const lines = content.split('\n');
  const matches = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (/\bas\s+any\b/.test(line)) return;
    if (/:\s*any\b/.test(line)) {
      matches.push(`  Line ${i + 1}: ${trimmed}`);
    }
  });

  if (matches.length > 0) {
    const rel = path.relative(process.cwd(), filePath);
    process.stderr.write(
      `\n⚠️  [warn-any-in-types] ${rel} contains bare \`any\` type annotation(s):\n` +
      matches.join('\n') +
      '\n  → Replace with a typed interface, a discriminated union, or a recursive type alias.\n' +
      '  → See .claude/rules/conventions/types.md, "Where to Place New Types".\n\n'
    );
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
