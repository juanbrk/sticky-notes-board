import { NOTE_COLORS } from '../lib/note-colors.constants';
import type * as Notes from '../types/notes.types';
import type * as Storage from '../types/storage.types';

const NOTES_PAYLOAD_VERSION = 1 satisfies Storage.NotesPayload['version'];

/**
 * Tells whether a value is one of the palette's color ids.
 *
 * @param value - Anything read from storage
 * @returns `true` when `value` is in `NOTE_COLORS`
 */
export const isNoteColor = (value: unknown): value is Notes.NoteColor =>
  NOTE_COLORS.some((color) => color === value);

/**
 * Checks a value read from storage and rebuilds it as a note. The note is a new
 * object holding only the known fields, so nothing unexpected reaches the state.
 *
 * @param value - Anything read from storage
 * @returns The note, or `null` when any field is missing or invalid
 *
 * @example
 * toNote({ id: 'a', x: 0, y: 0, width: 120, height: 80, z: 1, color: 'pink', text: '' });
 * // the same note
 * toNote({ id: 'a', x: 0, y: 0, width: 0, height: 80, z: 1, color: 'pink', text: '' });
 * // null: a note needs a positive size
 */
export const toNote = (value: unknown): Notes.Note | null => {
  if (!isRecord(value)) return null;
  const { id, x, y, width, height, z, color, text } = value;
  const isValid =
    typeof id === 'string' &&
    id.length > 0 &&
    isFiniteNumber(x) &&
    isFiniteNumber(y) &&
    isPositiveNumber(width) &&
    isPositiveNumber(height) &&
    isFiniteNumber(z) &&
    isNoteColor(color) &&
    typeof text === 'string';
  return isValid ? { id, x, y, width, height, z, color, text } : null;
};

/**
 * Parses and validates what storage holds. An invalid note, or one repeating an
 * earlier id, is dropped on its own; the rest still load, because losing one
 * note beats losing the board.
 *
 * @param json - The stored string, or `null` when nothing was ever saved
 * @returns What was found: nothing, the valid notes, or why the payload is unusable
 *
 * @example
 * readNotesPayload(null); // { status: 'empty' }
 * readNotesPayload('{"version":2,"notes":[]}'); // { status: 'invalid', issue: 'version' }
 */
export const readNotesPayload = (json: string | null): Storage.NotesPayloadReadResult => {
  if (json === null) return { status: 'empty' };

  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    return { status: 'invalid', issue: 'json' };
  }

  if (!isRecord(payload)) return { status: 'invalid', issue: 'shape' };
  if (payload.version !== NOTES_PAYLOAD_VERSION) return { status: 'invalid', issue: 'version' };
  if (!Array.isArray(payload.notes)) return { status: 'invalid', issue: 'shape' };

  const candidates: readonly unknown[] = payload.notes;
  const notes: Notes.Note[] = [];
  const seenIds = new Set<string>();
  for (const candidate of candidates) {
    const note = toNote(candidate);
    if (note && !seenIds.has(note.id)) {
      seenIds.add(note.id);
      notes.push(note);
    }
  }
  return { status: 'valid', notes, droppedCount: candidates.length - notes.length };
};

/**
 * Serializes the whole board into the versioned payload `readNotesPayload` reads.
 *
 * @param notes - Every note on the board
 * @returns The string to store
 */
export const writeNotesPayload = (notes: readonly Notes.Note[]): string =>
  JSON.stringify({ version: NOTES_PAYLOAD_VERSION, notes } satisfies Storage.NotesPayload);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number => isFiniteNumber(value) && value > 0;
