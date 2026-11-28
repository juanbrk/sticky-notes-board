import { describe, expect, it } from 'vitest';

import type * as Notes from '../types/notes.types';
import * as NotesStorageUtils from './notes-storage.helpers';

const NOTE: Notes.Note = {
  id: 'a',
  x: 10,
  y: 20,
  width: 120,
  height: 80,
  z: 1,
  color: 'pink',
  text: 'Buy milk',
};

const payloadOf = (notes: readonly unknown[], version: unknown = 1) =>
  JSON.stringify({ version, notes });

describe('isNoteColor', () => {
  it.each(['yellow', 'pink', 'blue', 'green', 'orange'])(
    'accepts the palette color %s',
    (color) => {
      expect(NotesStorageUtils.isNoteColor(color)).toBe(true);
    }
  );

  it.each([['red'], [''], ['Yellow'], [1], [null], [undefined]])('rejects %j', (value) => {
    expect(NotesStorageUtils.isNoteColor(value)).toBe(false);
  });
});

describe('toNote', () => {
  it('accepts a valid note', () => {
    expect(NotesStorageUtils.toNote(NOTE)).toEqual(NOTE);
  });

  it('returns a new object holding only the known fields', () => {
    const stored = { ...NOTE, isEditing: true, extra: 'x' };

    const note = NotesStorageUtils.toNote(stored);

    expect(note).toEqual(NOTE);
    expect(note).not.toBe(stored);
  });

  it('accepts empty text and a negative position', () => {
    expect(NotesStorageUtils.toNote({ ...NOTE, text: '', x: -5, y: -5 })).not.toBeNull();
  });

  it.each([
    ['an empty id', { id: '' }],
    ['a numeric id', { id: 1 }],
    ['a string x', { x: '10' }],
    ['a NaN y', { y: Number.NaN }],
    ['an infinite x', { x: Number.POSITIVE_INFINITY }],
    ['a zero width', { width: 0 }],
    ['a negative height', { height: -1 }],
    ['a string z', { z: '1' }],
    ['an unknown color', { color: 'red' }],
    ['a non-string text', { text: null }],
  ])('rejects a note with %s', (_case, override) => {
    expect(NotesStorageUtils.toNote({ ...NOTE, ...override })).toBeNull();
  });

  it.each(['id', 'x', 'y', 'width', 'height', 'z', 'color', 'text'])(
    'rejects a note without %s',
    (field) => {
      const stored: Record<string, unknown> = { ...NOTE };
      delete stored[field];

      expect(NotesStorageUtils.toNote(stored)).toBeNull();
    }
  );

  it.each([[null], ['note'], [[NOTE]], [42]])('rejects a non-object %j', (value) => {
    expect(NotesStorageUtils.toNote(value)).toBeNull();
  });
});

describe('readNotesPayload', () => {
  it('reports nothing saved for null', () => {
    expect(NotesStorageUtils.readNotesPayload(null)).toEqual({ status: 'empty' });
  });

  it('reads back what writeNotesPayload wrote', () => {
    const notes = [NOTE, { ...NOTE, id: 'b', z: 2, color: 'blue' as const }];

    const result = NotesStorageUtils.readNotesPayload(NotesStorageUtils.writeNotesPayload(notes));

    expect(result).toEqual({ status: 'valid', notes, droppedCount: 0 });
  });

  it('reads an empty board as valid', () => {
    expect(NotesStorageUtils.readNotesPayload(payloadOf([]))).toEqual({
      status: 'valid',
      notes: [],
      droppedCount: 0,
    });
  });

  it.each(['{not json', '', 'undefined'])('rejects bad JSON %j', (json) => {
    expect(NotesStorageUtils.readNotesPayload(json)).toEqual({ status: 'invalid', issue: 'json' });
  });

  it.each([[2], [0], ['1'], [null]])('rejects version %j', (version) => {
    expect(NotesStorageUtils.readNotesPayload(payloadOf([NOTE], version))).toEqual({
      status: 'invalid',
      issue: 'version',
    });
  });

  it('rejects a payload without a version', () => {
    expect(NotesStorageUtils.readNotesPayload(JSON.stringify({ notes: [NOTE] }))).toEqual({
      status: 'invalid',
      issue: 'version',
    });
  });

  it.each(['null', '[]', '"notes"', '42'])(
    'rejects a payload that is not an object: %s',
    (json) => {
      expect(NotesStorageUtils.readNotesPayload(json)).toEqual({
        status: 'invalid',
        issue: 'shape',
      });
    }
  );

  it.each([[{}], [null], ['notes']])('rejects notes that are not an array: %j', (notes) => {
    expect(NotesStorageUtils.readNotesPayload(JSON.stringify({ version: 1, notes }))).toEqual({
      status: 'invalid',
      issue: 'shape',
    });
  });

  it('drops an invalid note on its own and keeps the rest', () => {
    const valid = { ...NOTE, id: 'b' };

    const result = NotesStorageUtils.readNotesPayload(
      payloadOf([NOTE, { ...NOTE, id: 'x', color: 'red' }, valid])
    );

    expect(result).toEqual({ status: 'valid', notes: [NOTE, valid], droppedCount: 1 });
  });

  it('keeps the first note for a repeated id and drops the later one', () => {
    const result = NotesStorageUtils.readNotesPayload(
      payloadOf([NOTE, { ...NOTE, text: 'duplicate' }])
    );

    expect(result).toEqual({ status: 'valid', notes: [NOTE], droppedCount: 1 });
  });

  it('keeps the saved order and stacking', () => {
    const notes = [
      { ...NOTE, id: 'a', z: 5 },
      { ...NOTE, id: 'b', z: 2 },
      { ...NOTE, id: 'c', z: 9 },
    ];

    const result = NotesStorageUtils.readNotesPayload(payloadOf(notes));

    expect(result).toEqual({ status: 'valid', notes, droppedCount: 0 });
  });
});

describe('writeNotesPayload', () => {
  it('writes the versioned payload', () => {
    expect(JSON.parse(NotesStorageUtils.writeNotesPayload([NOTE]))).toEqual({
      version: 1,
      notes: [NOTE],
    });
  });
});
