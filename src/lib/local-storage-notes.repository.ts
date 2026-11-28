import * as NotesStorageUtils from '../helpers/notes-storage.helpers';
import type * as Notes from '../types/notes.types';
import type * as Storage from '../types/storage.types';

export const NOTES_STORAGE_KEY = 'sticky-notes';

/**
 * Keeps the whole board in one localStorage key. localStorage is synchronous;
 * each call runs inside a promise so the repository meets the async contract,
 * and so storage that throws (blocked, or full on save) rejects instead of
 * throwing at the caller. Reading `window.localStorage` itself can throw when
 * storage is blocked, which is why it is only touched inside those promises.
 *
 * @param key - The localStorage key that holds the board
 * @returns A repository for `usePersistNotes`
 *
 * @example
 * const notesRepository = createLocalStorageNotesRepository();
 * const notes = await notesRepository.load();
 */
export const createLocalStorageNotesRepository = (
  key = NOTES_STORAGE_KEY
): Storage.NotesRepository => ({
  load: () => Promise.resolve().then(() => readSavedNotes(key)),
  save: (notes) =>
    Promise.resolve().then(() => {
      window.localStorage.setItem(key, NotesStorageUtils.writeNotesPayload(notes));
    }),
});

/** A payload that cannot be used degrades to an empty board with one warning; it never throws. */
const readSavedNotes = (key: string): readonly Notes.Note[] => {
  const result = NotesStorageUtils.readNotesPayload(window.localStorage.getItem(key));
  switch (result.status) {
    case 'empty':
      return [];
    case 'valid':
      if (result.droppedCount > 0) {
        console.warn(`Dropped ${result.droppedCount} invalid saved note(s); the rest loaded.`);
      }
      return result.notes;
    case 'invalid':
      console.warn(`Ignored the saved notes (invalid ${result.issue}); opening an empty board.`);
      return [];
  }
};
