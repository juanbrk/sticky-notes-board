import { describe, expect, it } from 'vitest';

import type * as Notes from '../types/notes.types';
import { INITIAL_NOTES_STATE, notesReducer } from './notes-reducer';

const createNote = (id: string, x = 0, y = 0): Notes.NotesAction => ({
  type: 'createNote',
  id,
  rect: { x, y, width: 120, height: 80 },
});

describe('notesReducer', () => {
  describe('createNote', () => {
    it('adds a note with the given id, position and size', () => {
      const nextState = notesReducer(INITIAL_NOTES_STATE, createNote('a', 10, 20));

      expect(nextState.notes).toEqual([{ id: 'a', x: 10, y: 20, width: 120, height: 80 }]);
    });

    it('appends after the existing notes, keeping their order', () => {
      const withOne = notesReducer(INITIAL_NOTES_STATE, createNote('a'));
      const withTwo = notesReducer(withOne, createNote('b'));

      expect(withTwo.notes.map((note) => note.id)).toEqual(['a', 'b']);
    });

    it('does not mutate the previous state', () => {
      const previousState = Object.freeze({ notes: Object.freeze([]) });

      const nextState = notesReducer(previousState, createNote('a'));

      expect(previousState.notes).toHaveLength(0);
      expect(nextState).not.toBe(previousState);
      expect(nextState.notes).not.toBe(previousState.notes);
    });

    it('keeps the references of existing notes so memoised cards skip re-rendering', () => {
      const withOne = notesReducer(INITIAL_NOTES_STATE, createNote('a'));
      const withTwo = notesReducer(withOne, createNote('b'));

      expect(withTwo.notes[0]).toBe(withOne.notes[0]);
    });

    it('copies the rect instead of keeping a reference to the action payload', () => {
      const rect = { x: 0, y: 0, width: 120, height: 80 };

      const nextState = notesReducer(INITIAL_NOTES_STATE, { type: 'createNote', id: 'a', rect });

      expect(nextState.notes[0]).not.toBe(rect);
    });
  });
});
