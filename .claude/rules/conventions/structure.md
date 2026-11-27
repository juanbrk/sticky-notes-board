---
paths:
  - 'src/components/**/*.tsx'
  - 'src/providers/**/*.tsx'
  - 'src/hooks/**/*.ts'
---

# File Structure Conventions

## Within a Component File (order matters)

```typescript
// 1. Imports: builtin, then external packages (react included) sorted alphabetically,
//    then internal/parent, then siblings. Enforced by perfectionist/sort-imports;
//    run lint --fix.
import { memo, useCallback, useRef } from 'react';

import { useBoardContext } from '../providers/board.provider';
import type * as Notes from '../types/notes.types';

// 2. No inline types: props/state interfaces live in src/types/<domain>.types.ts
//    and are used through the namespace (here `Notes.NoteCardProps`).
//    Exception: a provider's `({ children }: { children: ReactNode })`.

// 3. Constants
const KEYBOARD_STEP_PX = 10;

// 4. Component
export const NoteCard = memo(({ note, onMove }: Notes.NoteCardProps) => {
  // 4a. Hooks (external first)
  const board = useBoardContext();

  // 4b. State / refs
  const elementRef = useRef<HTMLDivElement>(null);

  // 4c. Derived values / memoization
  const isEmpty = note.text.length === 0;

  // 4d. Callbacks
  const handleKeyDown = useCallback(() => {}, []);

  // 4e. Effects

  // 4f. Render helpers (if complex)
  const renderResizeHandle = () => <div className="note__resize" data-no-drag />;

  // 4g. Main render
  return (
    <div ref={elementRef} onKeyDown={handleKeyDown}>
      {isEmpty ? null : note.text}
      {renderResizeHandle()}
    </div>
  );
});

// 5. Helper components at the bottom, constants and private subcomponents only.
//    Pure helper functions go to src/helpers/<domain>.helpers.ts
```

## Hook File Structure

```typescript
// src/hooks/[domain]/[action]-[entity].hook.ts, one hook per file

import { useEffect, useState } from 'react';

import type * as Storage from '../../types/storage.types';

/**
 * Loads the persisted notes once and exposes the sync status.
 *
 * @param repository - Where notes are read from and written to
 * @returns The notes, their sync status and a retry callback
 */
export const usePersistedNotes = (repository: Storage.NotesRepository) => {
  // ...
};
```

**Helper extraction threshold**: a single private utility function may live at the bottom of the hook file it serves. Once there are 2 or more utility functions, or the logic is reusable across hooks, move them to `src/helpers/[domain].helpers.ts` and import them as `* as [Domain]Utils` (e.g. `GeometryUtils.clampPosition`).

## Type File Structure

```typescript
// src/types/notes.types.ts, in this order:
// 1. Entities  2. DTOs  3. Props  4. Reducer actions  5. State
```

## Performance conventions

- Per-frame work (a drag, a resize) never goes through React state: write to the DOM element through a ref during the gesture and commit one state change on release.
- Components that render many items are wrapped in `memo`, and the props they receive are referentially stable (`useCallback`, a stable `dispatch`).
- Do not call `getBoundingClientRect()` on every pointer move; measure once at gesture start.
