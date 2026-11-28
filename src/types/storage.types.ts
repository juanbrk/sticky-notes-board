import type * as Notes from './notes.types';

// 1. Contract

/**
 * Where the board's notes are kept. Async even when the storage is synchronous
 * (localStorage), so an implementation with real latency (the mock REST API)
 * swaps in without the UI changing. Each save is a snapshot of the whole board.
 */
export interface NotesRepository {
  /** Resolves with the saved notes, already validated; rejects only when the storage cannot be read. */
  load(): Promise<readonly Notes.Note[]>;
  /** Rejects when the storage cannot be written (full or blocked). */
  save(notes: readonly Notes.Note[]): Promise<void>;
}

// 2. Saved payload

/** The shape written to storage. `version` lets a future shape be detected instead of misread. */
export interface NotesPayload {
  version: 1;
  notes: readonly Notes.Note[];
}

/** Why a saved payload was rejected as a whole. */
export type NotesPayloadIssue = 'json' | 'version' | 'shape';

/**
 * What reading a saved payload found: nothing saved, a payload whose valid notes
 * were kept (`droppedCount` invalid or repeated ones left out), or a payload
 * unusable as a whole.
 */
export type NotesPayloadReadResult =
  | { status: 'empty' }
  | { status: 'valid'; notes: readonly Notes.Note[]; droppedCount: number }
  | { status: 'invalid'; issue: NotesPayloadIssue };

// 3. Hook options and state

/** `failed` means the storage could not be read: the board then runs in memory only and never saves. */
export type NotesLoadStatus = 'loading' | 'loaded' | 'failed';

export interface PersistNotesOptions {
  repository: NotesRepository;
  notes: readonly Notes.Note[];
  onLoad: (notes: readonly Notes.Note[]) => void;
}

/** What `usePersistNotes` exposes. */
export interface NotesPersistence {
  isLoading: boolean;
}
