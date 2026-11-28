# Workflow

Dependency rules load from `dependencies.md` when `package.json` or the lockfile is touched.

## Testing and bug fixes

- Browser validation covers Chrome, Firefox and Edge: by the User with DevTools, or automated with Playwright.
- Pure logic (reducers, geometry, serialization) gets Vitest unit tests next to the code (`*.test.ts`).
- **Phased bug fixes:** after each phase that claims to fix the bug, pause for the User's browser confirmation before the next phase. Lint and type-check passing is not fix verification.
- Never combine a bug fix with a refactor in the same commit.

## Session memory

- Keep `TICKET.md` current whenever a plan or status changes; it is the source of truth across sessions.
- Update `.claude/memory/memory-sessions.md` (newest entry on top) and `memory-decisions.md` as work happens, not at the end. Keep them concise: `/audit-pr` compacts a branch's entries into one on APPROVE.
- Update `roadmap.md` whenever a feature changes status.
- Log a repeated error or manual step in `.claude/hooks-error-log.md` (create it on first use).

## Worktrees and GitHub

- Each feature lives in its own worktree and branch (`/worktree`), named `<type>/<slug>`: `feature`, `fix`, `impr`, `techDebt`.
- The gitignored tracking files are **copied** into a new worktree, so they diverge. When a feature ends, the User pushes the branch and resolves any conflict on GitHub; nothing is merged by Claude.
