---
paths:
  - 'package.json'
  - 'package-lock.json'
---

# Dependencies

npm only. Use `npm ci` in a fresh worktree (what `new-worktree.sh` runs) and plain `npm install <pkg>` only after the User approves the package.

The runtime surface is deliberately tiny: `react` and `react-dom`. Everything else is a devDependency (build, lint, format, types, tests). A new runtime dependency needs a stated reason and the User's go, because the brief evaluates how the problem is engineered, not which library solves it.

Ask before installing; prefer well-maintained packages with no transitive bloat.
