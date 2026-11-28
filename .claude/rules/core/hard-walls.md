# Hard Walls

Non-negotiable constraints. They are always on; no other rule overrides them.

## Approval

- **NEVER modify files without explicit approval.** Show the current file, explain what changes and why, then wait for the User's go.
- Persona handoffs and plans are not edit approval; wait for "go" / "implement".
- **One exception:** the tracking files (`.claude/memory/memory-*.md`, `roadmap.md`) may be updated without asking, as work happens.
- Work incrementally: each step isolated, testable and working before the next. Finish the current step cleanly; no half-finished features.
- **Phase by phase:** a ticket is implemented in phases. After each phase, run the checks, report, and **stop** until the User says go. Never chain phases.
- Every feature starts with a formal ticket (`/feature`, `/bug`, `/improvement`) and a plan the User approved. No implementation before both exist.
- After a new planning phase, re-read any file changed since implementation ended (linter fixes, user edits) before finalizing the plan.

## Git

- **NEVER implement on `main`.** Before editing, run `git rev-parse --abbrev-ref HEAD`; if it is `main`, stop and ask for the feature worktree path. The only exception was the initial environment bootstrap, done before the first commit existed.
- **NEVER create commits, push, or open PRs.** The User does all git operations; hand back a summary (and a message if asked). Conflicts are resolved by the User on GitHub.
- **NEVER force push** to `main` or any shared branch.
- **NEVER commit** environment files or hardcoded secrets (tokens, API keys).

## Code Standards

- **NEVER install packages without approval.** Show the package, why it is needed and the alternative of not adding it.
- **NEVER skip checks.** After editing, run `npm run lint` and `npm run type-check`; the work is not done until both pass.
- **Testing**: Vitest unit-tests pure logic (reducers, geometry, serialization). Browser checks may be automated with Playwright (User decision, 2026-11-28: the browser-automation ban was a geoto-application rule and does not apply here). Adding a test package to `package.json` still needs approval, like any package.
- **No ready-made UI.** The brief forbids stock components: no component libraries, no drag-and-drop or resize libraries. Hand-built on Pointer Events.
- No "cleanup" changes outside the scope of the current task. Complex refactors and state-management changes are discussed first.
