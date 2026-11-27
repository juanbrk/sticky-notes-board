import type * as Geometry from './geometry.types';

// 1. Entities

export interface Note extends Geometry.Rect {
  id: string;
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
