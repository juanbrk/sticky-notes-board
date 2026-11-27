---
paths:
  - 'src/hooks/**/*.ts'
  - 'src/types/**/*.ts'
  - 'src/helpers/**'
  - 'src/lib/**'
---

# Type Definition Organization

## File Structure

All types are centralized by domain in `src/types/`. File names use the `.types.ts` suffix. **There is no `index.ts` and no barrel**: every consumer imports the specific file. The domain stays readable at the call site through a namespace import.

```typescript
// src/types/notes.types.ts, src/types/geometry.types.ts, src/types/storage.types.ts
```

## Import Patterns

```typescript
// Namespace import, type-only, straight from the domain file
import type * as Notes from '../types/notes.types';
import type * as Geometry from '../types/geometry.types';

const note: Notes.Note = ...;
const origin: Geometry.Point2d = ...;
```

Never write `export * from` or `export * as X from`, and never create a re-export file.

## Type Patterns

```typescript
// Domain entity
export interface Note extends Rect {
  id: string;
  z: number;
  color: NoteColor;
  text: string;
}

// DTOs: the shape that crosses the (mock) REST boundary, separate from the entity
export interface NoteDTO {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  color: string;
  text: string;
}

// Discriminated unions for reducer actions
type CreateNote = { type: 'createNote'; id: string; rect: Rect; color: NoteColor };
type RemoveNote = { type: 'removeNote'; id: string };
export type NotesAction = CreateNote | RemoveNote;
```

Derive literal unions from a `const` tuple when a runtime list is also needed:

```typescript
export const NOTE_COLORS = ['yellow', 'pink', 'blue'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];
```

## Where to Place New Types

Before declaring a new type or interface anywhere, verify it belongs in `src/types/`.

**Rule**: if the type models a domain entity, a DTO, a reducer action, a component's props, or a shared data structure, define it in `src/types/[domain].types.ts` first and import it as a namespace. Do NOT declare it locally in whatever file happens to need it first.

**Applies to hook files too**: hook inputs, return shapes and repository contracts are API surface; they belong in `src/types/[domain].types.ts`.

**Allowed locally**: private implementation shapes with zero reuse surface (a comparator type used inside one function) may stay in the file they serve.

```typescript
// ❌ Wrong: contract declared inside the module that needed it first
// src/lib/notes-repository.ts
export interface NotesRepository { load(): Promise<Note[]>; save(notes: Note[]): Promise<void> }

// ✅ Correct: contract in storage.types.ts, imported through the namespace
// src/types/storage.types.ts
export interface NotesRepository { load(): Promise<Note[]>; save(notes: readonly Note[]): Promise<void> }
// src/lib/local-storage-repository.ts
import type * as Storage from '../types/storage.types';
```

## No `any`

`any` has no place in a `.types.ts` file. Reach for, in order: a concrete interface, a discriminated union, a generic, `unknown` plus a type guard. The `warn-any-in-types` hook flags violations after each edit.

## Type guards at trust boundaries

Data that comes from `localStorage` or the mock API is `unknown` until a type guard (`isNote`) proves its shape. Never cast it with `as`.
