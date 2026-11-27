---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# Shared Code Regression Check

## Changing a shared type

When a field of a shared type changes (a new required field, a narrowed union, `string` → `NoteColor`), TypeScript only protects the consumers it can see. Before the change:

1. **Enumerate all consumers first**:
   ```bash
   grep -rn "\.fieldName" src/
   ```
   Review every access: destructuring, optional chain, direct property access, and the places that build the type (reducer, repository, type guard, DTO mapper).

2. **Plan the update for each consumer.** A persisted shape also needs its guard and its version handled: stored data written by the old shape must still load or be rejected cleanly.

3. **Make the change**: with every site accounted for, `npm run type-check` should pass in a single round.

## Extending a union

Adding a member to a discriminated union (a reducer action, a note color) must break the build wherever it is not handled. Keep `switch` statements exhaustive (`@typescript-eslint/switch-exhaustiveness-check`) so the compiler, not a review, finds the missed case.
