import { memo, type PointerEvent } from 'react';

import { NOTE_COLOR_LABELS, NOTE_COLORS } from '../lib/note-colors.constants';
import type * as Notes from '../types/notes.types';
import './note-color-picker.css';

// The press ends here: if it reached the note, the note would capture the
// pointer for a move and the swatch would never get its click (N6).
const handlePointerDown = (event: PointerEvent) => {
  event.stopPropagation();
};

const NoteColorPickerView = ({ noteId, color, onColorChange }: Notes.NoteColorPickerProps) => (
  <div
    className="note-color-picker"
    role="group"
    aria-label="Note color"
    onPointerDown={handlePointerDown}
  >
    {NOTE_COLORS.map((swatchColor) => (
      <button
        key={swatchColor}
        type="button"
        className="note-color-picker__swatch"
        data-note-color={swatchColor}
        aria-label={NOTE_COLOR_LABELS[swatchColor]}
        aria-pressed={swatchColor === color}
        onClick={() => {
          onColorChange(noteId, swatchColor);
        }}
      />
    ))}
  </div>
);

/**
 * A row of one swatch per palette color; the note's current color is the
 * pressed one. Memoised, so moving or resizing the note does not re-render it.
 */
export const NoteColorPicker = memo(NoteColorPickerView);
