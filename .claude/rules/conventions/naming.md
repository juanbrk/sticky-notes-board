---
paths:
  - 'src/components/**/*.tsx'
  - 'src/providers/**/*.tsx'
  - 'src/hooks/**/*.ts'
  - 'src/types/**/*.ts'
  - 'src/helpers/**'
  - 'src/lib/**'
---

# Naming Conventions

## Variables & Functions

| Type              | Convention                          | Examples                                       |
| ----------------- | ----------------------------------- | ---------------------------------------------- |
| Local variables   | camelCase                           | `draftRect`, `selectedNoteId`, `pointerOrigin` |
| Module constants  | UPPER_SNAKE_CASE                    | `MIN_NOTE_WIDTH`, `DEFAULT_NOTE_SIZE`          |
| Boolean variables | `is`, `has`, `can`, `should` prefix | `isDragging`, `hasMoved`, `isOverTrash`        |
| Event handlers    | `handle[Event]` or `on[Event]`      | `handlePointerDown`, `onNoteMove`              |
| Getters           | `get[Thing]`                        | `getNoteById`, `getTopZIndex`                  |
| Render helpers    | `render[Thing]`                     | `renderResizeHandle`                           |

## React-Specific

```typescript
// Components: PascalCase, noun-based
export const NoteCard = () => {};
export const TrashZone = () => {};

// Hooks: use[Action][Entity] pattern
export const useNotesReducer = () => {};
export const useDragNote = () => {};

// Context providers: [Entity]Provider
export const NotesProvider = () => {};

// Props interfaces: ComponentNameProps, declared in src/types/<domain>.types.ts
export interface NoteCardProps {
  note: Note;
  onMove: (id: string, position: Point2d) => void;
}
```

## Files

- Components: `kebab-case.tsx` (`note-card.tsx`), one exported component per file.
- Hooks: `[action]-[entity].hook.ts` (`drag-note.hook.ts`), one hook per file.
- Types: `[domain].types.ts`. Helpers: `[domain].helpers.ts`. Tests: `[name].test.ts` beside the file.
- The name of the thing is the name of the file: no `index.ts`, no `utils.ts`.

## Naming as documentation

If a name needs a comment to be understood, rename it. `isOverTrash`, not `over`; `MIN_NOTE_WIDTH`, not `120`.
