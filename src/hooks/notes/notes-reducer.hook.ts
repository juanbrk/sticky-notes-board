import { useCallback, useReducer } from 'react';

import { INITIAL_NOTES_STATE, notesReducer } from '../../lib/notes-reducer';
import type * as Geometry from '../../types/geometry.types';
import type * as Notes from '../../types/notes.types';

/**
 * Owns the board's notes. Commands are stable across renders, so memoised
 * components that receive them do not re-render when the notes change.
 *
 * @returns The current notes and the commands that change them
 */
export const useNotesReducer = (): Notes.NotesStore => {
  const [state, dispatch] = useReducer(notesReducer, INITIAL_NOTES_STATE);

  const createNote = useCallback((rect: Geometry.Rect) => {
    dispatch({ type: 'createNote', id: crypto.randomUUID(), rect });
  }, []);

  const moveNote = useCallback((id: string, position: Geometry.Point2d) => {
    dispatch({ type: 'moveNote', id, position });
  }, []);

  const resizeNote = useCallback((id: string, size: Geometry.Size) => {
    dispatch({ type: 'resizeNote', id, size });
  }, []);

  return { notes: state.notes, createNote, moveNote, resizeNote };
};
