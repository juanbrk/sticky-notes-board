# Sticky Notes (Tempo take-home)

Single-page sticky-notes board: React + TypeScript, **no stock components**, desktop only (min 1024x768; latest Chrome, Firefox and Edge). Built as a hiring take-home assessment; what is judged is architecture and design, performance, code quality, accuracy of static typing and usability. The assignment brief is `docs/assessment-brief.md`.

## Quick Reference

- **Styling**: plain CSS (the brief asks to avoid ready-made solutions).
- **State**: `useReducer` with typed actions; no state library.
- **Dev server**: `npm run dev`.
- **Base branch**: `main`. Every feature is built in its own worktree (`/worktree`), never on `main`.

## Before answering

Before answering any request, first list what you would need to know that the User has not told you (missing facts, open decisions, assumptions you would otherwise make). Do this every time, then answer or ask.

## After editing

Always run `npm run lint` and `npm run type-check`. `npm run format:check` and `npm test` are part of `/audit-pr`.

## Rules (`.claude/rules/`)

- **Every session**: `core/hard-walls.md`, `core/workflow.md`.
- **By file path** (`paths:` frontmatter, loads when a matching `src/` file is read or edited): `conventions/*`. `core/dependencies.md` loads on `package.json` or the lockfile.
- **Tracking files** (gitignored, not auto-loaded): `roadmap.md` (whole-assessment roadmap), `.claude/memory/memory-decisions.md`, `.claude/memory/memory-sessions.md`.
- **Branch review**: `/audit-pr` (`.claude/skills/audit-pr/`) runs the mechanical checks and the rules per changed file.

## Feature flow (per ticket; the User picks which ticket to start)

`/feature` (ticket) → plan approved by the User → `/worktree` → implement phase by phase (stop after each phase for the User's go) → `/audit-pr` → `/commit` (prepares the message) → the **User** commits and pushes; conflicts are resolved on GitHub.

`technician-check` is not part of this flow: leave that checkpoint unchecked.

## Auto-Update Memory

Update the tracking files **as you work**, not at the end of the session.

| Trigger                    | Action                                                 |
| -------------------------- | ------------------------------------------------------ |
| Decision is made           | → `memory-decisions.md`, with date and the _why_       |
| Substantive work completed | → `memory-sessions.md`                                 |
| A feature changes status   | → `roadmap.md`                                         |
| Fix or workaround found    | → update the relevant rule file (ask first, see walls) |

Update the memory files and `roadmap.md` without asking: the one exception to the approval rule in `rules/core/hard-walls.md`.

**Why they exist:** the User will defend every decision in a later interview. Write each entry so it answers "why this and not the alternative?". Keep them concise: one final entry per implemented feature (`/audit-pr` compacts it on APPROVE).

---

**`.claude/rules/core/hard-walls.md` is always on. All work follows the permissions outlined there.**
