---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# Project Structure & Organization

```
/src/
├── types/                 # Centralized type definitions, one file per domain
│   ├── notes.types.ts            # Note entity, DTO, props, reducer actions, state
│   ├── geometry.types.ts         # Point2d, Size, Rect
│   └── storage.types.ts          # NotesRepository contract, sync status
├── components/            # React components (.tsx)
├── hooks/                 # Custom React hooks (domain-organized)
│   └── [domain]/[action]-[entity].hook.ts
├── providers/             # React Context providers
├── helpers/               # Pure functions: [domain].helpers.ts, imported as *Utils
└── lib/                   # Reusable abstractions (pointer tracking, repositories)
```

Folders are created when the first file needs them, not before.

## Key Principles

- **Domain-driven organization**: files grouped by feature/domain.
- **Centralized types**: every shared type lives in `src/types/`.
- **No barrels**: there is no `index.ts` anywhere. Import the file that defines the thing; namespace-import types (`import type * as Notes from ...`) and helpers (`import * as GeometryUtils from ...`).
- **One hook per file**: `/src/hooks/[domain]/[action]-[entity].hook.ts`.
- **Pure logic is separate from React**: reducer, geometry and serialization have no React imports, so they are unit-testable in plain Node.
- **The UI does not know the storage**: components depend on the `NotesRepository` contract, never on `localStorage` or a mock URL.
