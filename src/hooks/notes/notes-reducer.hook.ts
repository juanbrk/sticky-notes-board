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

  // The id is made here, outside the reducer, so the reducer stays pure and
  // the caller learns which note it just created.
  const createNote = useCallback((rect: Geometry.Rect) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'createNote', id, rect });
    return id;
  }, []);

  const moveNote = useCallback((id: string, position: Geometry.Point2d) => {
    dispatch({ type: 'moveNote', id, position });
  }, []);

  const resizeNote = useCallback((id: string, size: Geometry.Size) => {
    dispatch({ type: 'resizeNote', id, size });
  }, []);

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: 'deleteNote', id });
  }, []);

  const setNoteColor = useCallback((id: string, color: Notes.NoteColor) => {
    dispatch({ type: 'setNoteColor', id, color });
  }, []);

  const bringNoteToFront = useCallback((id: string) => {
    dispatch({ type: 'bringNoteToFront', id });
  }, []);

  const setNoteText = useCallback((id: string, text: string) => {
    dispatch({ type: 'setNoteText', id, text });
  }, []);

  const loadNotes = useCallback((notes: readonly Notes.Note[]) => {
    dispatch({ type: 'loadNotes', notes });
  }, []);

  return {
    notes: state.notes,
    createNote,
    moveNote,
    resizeNote,
    deleteNote,
    setNoteColor,
    bringNoteToFront,
    setNoteText,
    loadNotes,
  };
};
