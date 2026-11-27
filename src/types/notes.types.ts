import type { RefObject } from 'react';

import type * as Geometry from './geometry.types';

// 1. Entities

export interface Note extends Geometry.Rect {
  id: string;
}

// 3. Props and hook options

export interface NoteCardProps {
  note: Note;
  onMove: (id: string, position: Geometry.Point2d) => void;
  onResize: (id: string, size: Geometry.Size) => void;
}

export interface BoardProps {
  notes: readonly Note[];
  onCreateNote: (rect: Geometry.Rect) => void;
  onMoveNote: (id: string, position: Geometry.Point2d) => void;
  onResizeNote: (id: string, size: Geometry.Size) => void;
}

/** Which drag a note is going through; styled through the note's `data-gesture` attribute. */
export type NoteGesture = 'move' | 'resize';

/** Turns the note's rect at press time and the pointer's movement since then into the rect to show. */
export type NoteRectTransform = (start: Geometry.Rect, delta: Geometry.Point2d) => Geometry.Rect;

export interface DragNoteOptions {
  note: Note;
  elementRef: RefObject<HTMLElement | null>;
  gesture: NoteGesture;
  getNextRect: NoteRectTransform;
  onCommit: (id: string, rect: Geometry.Rect) => void;
}

// 4. Reducer actions

interface CreateNote {
  type: 'createNote';
  id: string;
  rect: Geometry.Rect;
}

interface MoveNote {
  type: 'moveNote';
  id: string;
  position: Geometry.Point2d;
}

interface ResizeNote {
  type: 'resizeNote';
  id: string;
  size: Geometry.Size;
}

export type NotesAction = CreateNote | MoveNote | ResizeNote;

// 5. State

export interface NotesState {
  readonly notes: readonly Note[];
}

/** What `useNotesReducer` exposes: the notes and stable commands that change them. */
export interface NotesStore {
  notes: readonly Note[];
  createNote: (rect: Geometry.Rect) => void;
  moveNote: (id: string, position: Geometry.Point2d) => void;
  resizeNote: (id: string, size: Geometry.Size) => void;
}
