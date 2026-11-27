import type * as Geometry from './geometry.types';

// 1. Entities

export interface Note extends Geometry.Rect {
  id: string;
}

// 3. Props

export interface NoteCardProps {
  note: Note;
}

export interface BoardProps {
  notes: readonly Note[];
  onCreateNote: (rect: Geometry.Rect) => void;
}

// 4. Reducer actions

interface CreateNote {
  type: 'createNote';
  id: string;
  rect: Geometry.Rect;
}

export type NotesAction = CreateNote;

// 5. State

export interface NotesState {
  readonly notes: readonly Note[];
}

/** What `useNotesReducer` exposes: the notes and stable commands that change them. */
export interface NotesStore {
  notes: readonly Note[];
  createNote: (rect: Geometry.Rect) => void;
}
