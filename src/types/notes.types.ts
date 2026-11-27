import type { Ref, RefObject } from 'react';

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
  onDelete: (id: string) => void;
  trashRef: RefObject<HTMLElement | null>;
}

export interface BoardProps {
  notes: readonly Note[];
  onCreateNote: (rect: Geometry.Rect) => void;
  onMoveNote: (id: string, position: Geometry.Point2d) => void;
  onResizeNote: (id: string, size: Geometry.Size) => void;
  onDeleteNote: (id: string) => void;
}

export interface TrashZoneProps {
  ref: Ref<HTMLDivElement>;
}

/** Which drag a note is going through; styled through the note's `data-gesture` attribute. */
export type NoteGesture = 'move' | 'resize';

/** Turns the note's rect at press time and the pointer's movement since then into the rect to show. */
export type NoteRectTransform = (start: Geometry.Rect, delta: Geometry.Point2d) => Geometry.Rect;

/**
 * A moving note's drop state, written to its `data-drop`: `ready` once the drag
 * is under way, `armed` while a release would delete it.
 */
export type NoteDropState = 'ready' | 'armed';

/** An element a dragged note can be released over, and what happens to the note then. */
export interface NoteDropTarget {
  ref: RefObject<HTMLElement | null>;
  onDrop: (id: string) => void;
}

export interface DragNoteOptions {
  note: Note;
  elementRef: RefObject<HTMLElement | null>;
  gesture: NoteGesture;
  getNextRect: NoteRectTransform;
  onCommit: (id: string, rect: Geometry.Rect) => void;
  dropTarget?: NoteDropTarget;
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

interface DeleteNote {
  type: 'deleteNote';
  id: string;
}

export type NotesAction = CreateNote | MoveNote | ResizeNote | DeleteNote;

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
  deleteNote: (id: string) => void;
}
