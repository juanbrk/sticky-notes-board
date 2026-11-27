---
paths:
  - 'src/components/**/*.tsx'
  - 'src/hooks/**/*.ts'
  - 'src/lib/**/*.ts'
---

# Async Patterns

Persistence goes through an asynchronous `NotesRepository` (localStorage-backed and a mock REST API with simulated latency). Two ESLint rules constrain how promises are handled:

- **`no-void`** (`allowAsStatement: true`): `void promise;` as a statement is allowed; `void` inside an expression (`() => void fn()`) is an error.
- **`@typescript-eslint/no-floating-promises`**: a promise must be awaited, returned, `void`-ed as a statement, or end with `.catch()`.

When the result does not matter, `void promise;` as its own statement is the accepted marker, provided the promise cannot reject unhandled: the callee catches, or you append `.catch`.

When the result matters, use `.then(handler).catch(fallback)`, and always include the `.catch` so the failure path is explicit.

```typescript
// ✅ Result matters, satisfies both rules
repository
  .save(notes)
  .then(() => { setStatus('saved'); })
  .catch(() => { setStatus('error'); });

// ❌ void inside an expression is banned by no-void
onClick={() => void repository.save(notes)}

// ❌ unhandled rejection
void repository.save(notes);
```

## Ordering and races

- Saves are **serialized** through a promise queue so a slow earlier save can never land after a later one.
- Only the latest save's outcome updates the visible status (a ticket counter), so a stale result never overwrites a fresh one.
- Effects that start async work return a cleanup that ignores the result once the component is gone or the dependency changed (`let isCancelled = false`).

## Trust boundary

Anything a repository returns is `unknown` until a type guard validates it. A corrupt payload degrades to an empty board; it never throws into the render.
