import { describe, expect, it } from 'vitest';

import type * as Notes from '../types/notes.types';
import { INITIAL_NOTES_STATE, notesReducer } from './notes-reducer';

const createNote = (id: string, x = 0, y = 0): Notes.NotesAction => ({
  type: 'createNote',
  id,
  rect: { x, y, width: 120, height: 80 },
});

const bringNoteToFront = (id: string): Notes.NotesAction => ({ type: 'bringNoteToFront', id });

describe('notesReducer', () => {
  describe('createNote', () => {
    it('adds a note with the given id, position and size', () => {
      const nextState = notesReducer(INITIAL_NOTES_STATE, createNote('a', 10, 20));

      expect(nextState.notes).toEqual([
        { id: 'a', x: 10, y: 20, width: 120, height: 80, z: 1, color: 'yellow', text: '' },
      ]);
    });

    it('puts the new note on top of the existing ones', () => {
      const withOne = notesReducer(INITIAL_NOTES_STATE, createNote('a'));
      const raisedA = notesReducer(notesReducer(withOne, createNote('b')), bringNoteToFront('a'));

      const withThree = notesReducer(raisedA, createNote('c'));

      expect(withThree.notes.map((note) => note.z)).toEqual([3, 2, 4]);
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

const twoNotes = (): Notes.NotesState =>
  [createNote('a', 10, 20), createNote('b', 300, 200)].reduce(notesReducer, INITIAL_NOTES_STATE);

describe('notesReducer', () => {
  describe('moveNote', () => {
    it('moves only the target note and keeps its size', () => {
      const state = twoNotes();

      const nextState = notesReducer(state, {
        type: 'moveNote',
        id: 'a',
        position: { x: 50, y: 60 },
      });

      expect(nextState.notes[0]).toEqual({
        id: 'a',
        x: 50,
        y: 60,
        width: 120,
        height: 80,
        z: 1,
        color: 'yellow',
        text: '',
      });
      expect(nextState.notes[1]).toBe(state.notes[1]);
    });

    it('takes only the position, even when given a whole rect', () => {
      const rect = { x: 50, y: 60, width: 999, height: 999 };

      const nextState = notesReducer(twoNotes(), { type: 'moveNote', id: 'a', position: rect });

      expect(nextState.notes[0]).toMatchObject({ width: 120, height: 80 });
    });

    it('does not mutate the previous state', () => {
      const state = twoNotes();
      const movedNote = state.notes[0];

      notesReducer(state, { type: 'moveNote', id: 'a', position: { x: 50, y: 60 } });

      expect(state.notes[0]).toBe(movedNote);
      expect(movedNote).toMatchObject({ x: 10, y: 20 });
    });

    it('returns the same state for an unknown id', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'moveNote', id: 'zz', position: { x: 1, y: 1 } })).toBe(
        state
      );
    });

    it('returns the same state when the position did not change', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'moveNote', id: 'a', position: { x: 10, y: 20 } })).toBe(
        state
      );
    });
  });

  describe('resizeNote', () => {
    it('resizes only the target note and keeps its position', () => {
      const state = twoNotes();

      const nextState = notesReducer(state, {
        type: 'resizeNote',
        id: 'b',
        size: { width: 200, height: 150 },
      });

      expect(nextState.notes[1]).toEqual({
        id: 'b',
        x: 300,
        y: 200,
        width: 200,
        height: 150,
        z: 2,
        color: 'yellow',
        text: '',
      });
      expect(nextState.notes[0]).toBe(state.notes[0]);
    });

    it('takes only the size, even when given a whole rect', () => {
      const rect = { x: 0, y: 0, width: 200, height: 150 };

      const nextState = notesReducer(twoNotes(), { type: 'resizeNote', id: 'b', size: rect });

      expect(nextState.notes[1]).toMatchObject({ x: 300, y: 200 });
    });

    it('returns the same state for an unknown id', () => {
      const state = twoNotes();

      expect(
        notesReducer(state, { type: 'resizeNote', id: 'zz', size: { width: 50, height: 50 } })
      ).toBe(state);
    });

    it('returns the same state when the size did not change', () => {
      const state = twoNotes();

      expect(
        notesReducer(state, { type: 'resizeNote', id: 'b', size: { width: 120, height: 80 } })
      ).toBe(state);
    });
  });

  describe('setNoteColor', () => {
    it('recolors only the target note and keeps its rect', () => {
      const state = twoNotes();

      const nextState = notesReducer(state, { type: 'setNoteColor', id: 'b', color: 'pink' });

      expect(nextState.notes[1]).toEqual({ ...state.notes[1], color: 'pink' });
      expect(nextState.notes[0]).toBe(state.notes[0]);
    });

    it('does not mutate the previous state', () => {
      const state = twoNotes();
      const recoloredNote = state.notes[1];

      notesReducer(state, { type: 'setNoteColor', id: 'b', color: 'pink' });

      expect(state.notes[1]).toBe(recoloredNote);
      expect(recoloredNote).toMatchObject({ color: 'yellow' });
    });

    it('returns the same state for an unknown id', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'setNoteColor', id: 'zz', color: 'pink' })).toBe(state);
    });

    it('returns the same state when the color did not change', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'setNoteColor', id: 'b', color: 'yellow' })).toBe(state);
    });
  });

  describe('setNoteText', () => {
    it('changes only the target note and keeps its rect and color', () => {
      const state = twoNotes();

      const nextState = notesReducer(state, {
        type: 'setNoteText',
        id: 'b',
        text: 'Buy milk\nEggs',
      });

      expect(nextState.notes[1]).toEqual({ ...state.notes[1], text: 'Buy milk\nEggs' });
      expect(nextState.notes[0]).toBe(state.notes[0]);
    });

    it('does not mutate the previous state', () => {
      const state = twoNotes();
      const editedNote = state.notes[1];

      notesReducer(state, { type: 'setNoteText', id: 'b', text: 'Buy milk' });

      expect(state.notes[1]).toBe(editedNote);
      expect(editedNote).toMatchObject({ text: '' });
    });

    it('returns the same state for an unknown id', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'setNoteText', id: 'zz', text: 'Buy milk' })).toBe(state);
    });

    it('returns the same state when the text did not change', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'setNoteText', id: 'b', text: '' })).toBe(state);
    });

    it('keeps the text when the note is later moved', () => {
      const withText = notesReducer(twoNotes(), { type: 'setNoteText', id: 'a', text: 'Hi' });

      const moved = notesReducer(withText, { type: 'moveNote', id: 'a', position: { x: 5, y: 5 } });

      expect(moved.notes[0]).toMatchObject({ text: 'Hi' });
    });
  });

  describe('deleteNote', () => {
    it('removes only the target note and keeps the references of the others', () => {
      const state = twoNotes();

      const nextState = notesReducer(state, { type: 'deleteNote', id: 'a' });

      expect(nextState.notes).toHaveLength(1);
      expect(nextState.notes[0]).toBe(state.notes[1]);
    });

    it('does not mutate the previous state', () => {
      const state = twoNotes();
      const previousNotes = state.notes;

      notesReducer(state, { type: 'deleteNote', id: 'a' });

      expect(state.notes).toBe(previousNotes);
      expect(state.notes.map((note) => note.id)).toEqual(['a', 'b']);
    });

    it('returns the same state for an unknown id', () => {
      const state = twoNotes();

      expect(notesReducer(state, { type: 'deleteNote', id: 'zz' })).toBe(state);
    });

    it('leaves an empty board after deleting the last note', () => {
      const withOne = notesReducer(INITIAL_NOTES_STATE, createNote('a'));

      expect(notesReducer(withOne, { type: 'deleteNote', id: 'a' }).notes).toEqual([]);
    });
  });

  describe('bringNoteToFront', () => {
    const threeNotes = (): Notes.NotesState =>
      [createNote('a'), createNote('b'), createNote('c')].reduce(notesReducer, INITIAL_NOTES_STATE);

    it('raises only the target above every other note', () => {
      const state = threeNotes();

      const nextState = notesReducer(state, bringNoteToFront('a'));

      expect(nextState.notes[0]).toEqual({ ...state.notes[0], z: 4 });
      expect(nextState.notes[1]).toBe(state.notes[1]);
      expect(nextState.notes[2]).toBe(state.notes[2]);
    });

    it('keeps the array order, so the pressed note is never moved in the DOM', () => {
      const nextState = notesReducer(threeNotes(), bringNoteToFront('a'));

      expect(nextState.notes.map((note) => note.id)).toEqual(['a', 'b', 'c']);
    });

    it('keeps the other notes in the same order among themselves', () => {
      const nextState = notesReducer(threeNotes(), bringNoteToFront('b'));

      expect(nextState.notes.map((note) => note.z)).toEqual([1, 4, 3]);
    });

    it('returns the same state for the note already on top', () => {
      const state = threeNotes();

      expect(notesReducer(state, bringNoteToFront('c'))).toBe(state);
    });

    it('returns the same state for an unknown id', () => {
      const state = threeNotes();

      expect(notesReducer(state, bringNoteToFront('zz'))).toBe(state);
    });

    it('still raises above every note after the top one was deleted', () => {
      const withoutTop = notesReducer(threeNotes(), { type: 'deleteNote', id: 'c' });

      const nextState = notesReducer(withoutTop, bringNoteToFront('a'));

      expect(nextState.notes.map((note) => note.z)).toEqual([3, 2]);
    });

    it('does not mutate the previous state', () => {
      const state = threeNotes();
      const raisedNote = state.notes[0];

      notesReducer(state, bringNoteToFront('a'));

      expect(state.notes[0]).toBe(raisedNote);
      expect(raisedNote).toMatchObject({ z: 1 });
    });
  });
});
