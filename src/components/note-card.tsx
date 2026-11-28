import {
  type ChangeEvent,
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import * as GeometryUtils from '../helpers/geometry.helpers';
import { useDragNote } from '../hooks/notes/drag-note.hook';
import { BOARD_SIZE, MIN_NOTE_SIZE } from '../lib/board.constants';
import type * as Notes from '../types/notes.types';
import './note-card.css';
import { NoteColorPicker } from './note-color-picker';

const TEXT_HINT = 'Double-click to write';

const getMovedNoteRect: Notes.NoteRectTransform = (start, delta) =>
  GeometryUtils.getMovedRect(start, delta, BOARD_SIZE);

const getResizedNoteRect: Notes.NoteRectTransform = (start, delta) =>
  GeometryUtils.getResizedRect(start, delta, MIN_NOTE_SIZE, BOARD_SIZE);

// While editing, a press in the text selects text: if it reached the note, the
// note would start a move, and the board would start drawing a new note (N6).
const handleTextPointerDown = (event: PointerEvent) => {
  event.stopPropagation();
};

// Enter and Esc both finish by blurring, so every way out goes through `onBlur`.
// Shift+Enter keeps its native new line; during IME composition Enter picks a candidate.
const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  const isFinishKey = (event.key === 'Enter' && !event.shiftKey) || event.key === 'Escape';
  if (!isFinishKey || event.nativeEvent.isComposing) return;
  event.preventDefault();
  event.currentTarget.blur();
};

const NoteCardView = ({
  note,
  onMove,
  onResize,
  onDelete,
  trashRef,
  onColorChange,
  onBringToFront,
  isEditing,
  onStartEditing,
  onStopEditing,
  onTextChange,
}: Notes.NoteCardProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const moveHandlers = useDragNote({
    note,
    elementRef,
    gesture: 'move',
    getNextRect: getMovedNoteRect,
    onCommit: onMove,
    dropTarget: { ref: trashRef, onDrop: onDelete },
  });

  const resizeHandlers = useDragNote({
    note,
    elementRef,
    gesture: 'resize',
    getNextRect: getResizedNoteRect,
    onCommit: onResize,
  });

  // Only a double-click on the note's own body: one on a swatch or the resize
  // grip has that child as its target and is ignored.
  const handleDoubleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onStartEditing(note.id);
    },
    [note.id, onStartEditing]
  );

  // Tab reaches the read-only text too, and focusing it starts editing. No
  // press raises a note reached by Tab, so focus brings it to the front itself.
  const handleTextFocus = useCallback(() => {
    onBringToFront(note.id);
    onStartEditing(note.id);
  }, [note.id, onBringToFront, onStartEditing]);

  const handleTextBlur = useCallback(() => {
    onStopEditing(note.id);
  }, [note.id, onStopEditing]);

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onTextChange(note.id, event.target.value);
    },
    [note.id, onTextChange]
  );

  // Entering edit mode focuses the text with the caret at the end (`autoFocus`
  // is banned by lint and would only run on mount). Leaving it scrolls back to
  // the top, since read mode shows the start of a long text.
  useEffect(() => {
    const textArea = textRef.current;
    if (!textArea) return;
    if (!isEditing) {
      textArea.scrollTop = 0;
      return;
    }
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }, [isEditing]);

  return (
    <div
      ref={elementRef}
      className="note-card"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.z,
      }}
      data-note-color={note.color}
      data-editing={isEditing || undefined}
      onDoubleClick={handleDoubleClick}
      // Capture phase: runs before the move, resize, swatch and text handlers stop the press.
      onPointerDownCapture={() => {
        onBringToFront(note.id);
      }}
      {...moveHandlers}
    >
      <textarea
        ref={textRef}
        className="note-card__text"
        aria-label="Note text"
        value={note.text}
        placeholder={isEditing ? undefined : TEXT_HINT}
        readOnly={!isEditing}
        onPointerDown={handleTextPointerDown}
        onKeyDown={handleTextKeyDown}
        onFocus={handleTextFocus}
        onBlur={handleTextBlur}
        onChange={handleTextChange}
      />
      <NoteColorPicker noteId={note.id} color={note.color} onColorChange={onColorChange} />
      <div className="note-card__resize-handle" aria-hidden {...resizeHandlers} />
    </div>
  );
};

/**
 * A sticky note placed at its position and size on the board; drag it to move
 * it, drop it on the trash to delete it, drag its bottom-right corner to
 * resize it, or pick a swatch to recolor it. Only the move can delete, so a
 * resize never does. Any press on it brings it to the front first, so the drag
 * it starts happens on top.
 *
 * Its text is a `<textarea>` that is always mounted. In read mode it is
 * read-only and lets the pointer through, so a press on the note still moves
 * it. A double-click on the note, or Tab reaching the text, enters edit mode;
 * Enter, Esc, Tab or a click outside leave it. Every keystroke updates the
 * store, so leaving only switches the mode.
 *
 * Memoised: the reducer keeps untouched notes as the same objects and the
 * callbacks are stable, so a change to one note renders only that card.
 */
export const NoteCard = memo(NoteCardView);
