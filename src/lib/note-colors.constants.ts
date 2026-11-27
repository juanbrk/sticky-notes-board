// The palette's ids; `Notes.NoteColor` is derived from this list. The hex
// values live in `index.css`, so the styling has one source too.
export const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'orange'] as const;

// Business rule: a new note is classic post-it yellow (F1's look).
export const DEFAULT_NOTE_COLOR = 'yellow' satisfies (typeof NOTE_COLORS)[number];

/** The accessible name of each color's swatch. */
export const NOTE_COLOR_LABELS = {
  yellow: 'Yellow',
  pink: 'Pink',
  blue: 'Blue',
  green: 'Green',
  orange: 'Orange',
} as const satisfies Record<(typeof NOTE_COLORS)[number], string>;
