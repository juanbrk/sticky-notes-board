---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# Code Documentation

Philosophy and practices for documenting code. Comments must be in English; the brief also asks to leave only comments that considerably help reading the code.

## Core Philosophy

**Documentation explains WHY, not WHAT.** Code should be self-documenting through clear naming and structure. Comments are reserved for:

- Complex business logic that isn't obvious from the code
- Non-obvious architectural decisions or workarounds
- Public API documentation (JSDoc)
- TODO/FIXME markers for technical debt

## Never Comment

```typescript
// Bad: restating the obvious
counter++; // Increment counter

// Bad: explaining what the code does (names should do this)
// Clamp the note inside the board
const nextRect = clampPosition(rect, bounds);

// Bad: changelog in comments
// Modified on 2026-11-28

// Bad: commented-out code (use git instead)
// const oldImplementation = () => {};
```

## When to Document

| Situation                              | Documentation Type                          |
| -------------------------------------- | ------------------------------------------- |
| Public API / exported function         | JSDoc with `@param`, `@returns`, `@example` |
| Complex algorithm or non-obvious logic | JSDoc explaining approach (not inline)      |
| Business rule                          | Comment explaining rule and source          |
| Workaround / hack                      | `// HACK:` explaining why it's necessary    |
| Technical debt                         | `// TODO:` or `// FIXME:` with context      |
| Self-evident code                      | No comment needed                           |

## JSDoc Example

```typescript
/**
 * Clamps a rectangle so it stays fully inside the board, keeping its size.
 *
 * @param rect - The rectangle to place
 * @param bounds - The board's inner size
 * @returns A rectangle with the same size and a position inside `bounds`
 *
 * @example
 * clampPosition({ x: -10, y: 5, width: 100, height: 80 }, { width: 800, height: 600 });
 * // { x: 0, y: 5, width: 100, height: 80 }
 */
export const clampPosition = (rect: Geometry.Rect, bounds: Geometry.Size) => {};
```

## Naming as Documentation

The best documentation is clear, intent-revealing names.

- Variables: `isOverTrash` instead of `over`
- Functions: `getVisibleNotes()` instead of `getNotes(true)`
- Constants: `MIN_NOTE_WIDTH` instead of `120`

**Rule: if an inline comment explains what the code does, rename instead.**

## Acceptable Inline Comments

```typescript
// Business rule: a click without drag creates a default-size note at the cursor.
const isClick = Math.hypot(dx, dy) < CLICK_THRESHOLD_PX;

// HACK: Firefox does not fire pointerup after Escape cancels a captured gesture.
// Release capture manually.
```
