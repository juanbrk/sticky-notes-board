# /worktree: create a new worktree for one feature

Sets up an isolated git worktree ready to work in:

- Creates the branch from `main` and the worktree directory (sibling of this repo)
- Runs `npm ci`
- Copies the gitignored local files: `.claude/settings.local.json`, `roadmap.md`, `.claude/memory/memory-decisions.md`, `.claude/memory/memory-sessions.md`, and the `.claude/skills/` folder (personal tooling, never pushed)
- Opens the worktree in a new VSCode window
- Saves the ticket as `TICKET.md` in the worktree root (6-section schema)

The copies **diverge** from the main checkout's. The User pushes the branch when the feature ends and resolves conflicts on GitHub.

---

## Input

The full ticket content (or a remote branch name) is in `$ARGUMENTS`.

If `$ARGUMENTS` is empty, ask whether to start from a **new ticket** or an **existing remote branch**.

---

## Mode A: new branch from a ticket

### 1. Extract the slug

Look for the `**Name:**` field in the ticket and use its value. If absent, derive it from the first heading, normalized to kebab-case.

### 2. Ask for the branch type

`feature` (new functionality), `fix` (bug), `impr` (incremental improvement), `techDebt`.

### 3. Run the script (from the main checkout)

```bash
bash .claude/scripts/new-worktree.sh "<slug>" <type>
```

### 4. Save the ticket as TICKET.md

Once the script succeeds, write the ticket to `[WORKTREE_PATH]/TICKET.md` (the path printed after `Path:`), following `~/.claude/shared/ticket-md.md`: first line `<!-- ticket-schema: v1 lang=en -->`, all 6 sections, English headings. Map the ticket body to `## Context`, its acceptance criteria to `## Acceptance Criteria`, its actionable details to `## Pending` as `- [ ]` items. `## Done` and `## Deferred` stay empty; `## Checkpoints` has both boxes unchecked.

### 5. Report

Worktree path, branch name, TICKET.md location. Remind that implementation starts only after the User approves the plan, and proceeds phase by phase.

---

## Mode B: existing remote branch

Use the branch name from `$ARGUMENTS` (ask if missing), then:

```bash
bash .claude/scripts/new-worktree.sh --from-remote "<branch>"
```

Report the path and the branch. If the branch has no `TICKET.md`, `/audit-pr` rebuilds one from the diff.
