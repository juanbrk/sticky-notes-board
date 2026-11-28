import type { Ref, RefObject } from 'react';

import type { NOTE_COLORS } from '../lib/note-colors.constants';
import type * as Geometry from './geometry.types';

// 1. Entities

export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Note extends Geometry.Rect {
  id: string;
  /** Paint order among the notes; the highest is on top. Unique, but not contiguous. */
  z: number;
  color: NoteColor;
  text: string;
}

// 3. Props and hook options

export interface NoteCardProps {
  note: Note;
  onMove: (id: string, position: Geometry.Point2d) => void;
  onResize: (id: string, size: Geometry.Size) => void;
  onDelete: (id: string) => void;
  trashRef: RefObject<HTMLElement | null>;
  onColorChange: (id: string, color: NoteColor) => void;
  onBringToFront: (id: string) => void;
  isEditing: boolean;
  onStartEditing: (id: string) => void;
  onStopEditing: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
}

export interface NoteColorPickerProps {
  noteId: string;
  color: NoteColor;
  onColorChange: (id: string, color: NoteColor) => void;
}

export interface BoardProps {
  notes: readonly Note[];
  /** While the saved notes load, the board is disabled and shows a spinner. */
  isLoading: boolean;
  /** Returns the new note's id. */
  onCreateNote: (rect: Geometry.Rect) => string;
  onMoveNote: (id: string, position: Geometry.Point2d) => void;
  onResizeNote: (id: string, size: Geometry.Size) => void;
  onSetNoteColor: (id: string, color: NoteColor) => void;
  onDeleteNote: (id: string) => void;
  onBringNoteToFront: (id: string) => void;
  onSetNoteText: (id: string, text: string) => void;
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

interface SetNoteColor {
  type: 'setNoteColor';
  id: string;
  color: NoteColor;
}

interface BringNoteToFront {
  type: 'bringNoteToFront';
  id: string;
}

interface SetNoteText {
  type: 'setNoteText';
  id: string;
  text: string;
}

/** Replaces every note with the board read from storage. */
interface LoadNotes {
  type: 'loadNotes';
  notes: readonly Note[];
}

export type NotesAction =
  | CreateNote
  | MoveNote
  | ResizeNote
  | DeleteNote
  | SetNoteColor
  | BringNoteToFront
  | SetNoteText
  | LoadNotes;

// 5. State

export interface NotesState {
  readonly notes: readonly Note[];
}

/** What `useNotesReducer` exposes: the notes and stable commands that change them. */
export interface NotesStore {
  notes: readonly Note[];
  /** Returns the new note's id. */
  createNote: (rect: Geometry.Rect) => string;
  moveNote: (id: string, position: Geometry.Point2d) => void;
  resizeNote: (id: string, size: Geometry.Size) => void;
  deleteNote: (id: string) => void;
  setNoteColor: (id: string, color: NoteColor) => void;
  bringNoteToFront: (id: string) => void;
  setNoteText: (id: string, text: string) => void;
  loadNotes: (notes: readonly Note[]) => void;
}
