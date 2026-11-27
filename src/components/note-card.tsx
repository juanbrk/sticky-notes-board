import { memo, useRef } from 'react';

import * as GeometryUtils from '../helpers/geometry.helpers';
import { useDragNote } from '../hooks/notes/drag-note.hook';
import { BOARD_SIZE, MIN_NOTE_SIZE } from '../lib/board.constants';
import type * as Notes from '../types/notes.types';
import './note-card.css';

const getMovedNoteRect: Notes.NoteRectTransform = (start, delta) =>
  GeometryUtils.getMovedRect(start, delta, BOARD_SIZE);

const getResizedNoteRect: Notes.NoteRectTransform = (start, delta) =>
  GeometryUtils.getResizedRect(start, delta, MIN_NOTE_SIZE, BOARD_SIZE);

const NoteCardView = ({ note, onMove, onResize, onDelete, trashRef }: Notes.NoteCardProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={elementRef}
      className="note-card"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
      {...moveHandlers}
    >
      <div className="note-card__resize-handle" aria-hidden {...resizeHandlers} />
    </div>
  );
};

/**
 * A sticky note placed at its position and size on the board; drag it to move
 * it, drop it on the trash to delete it, or drag its bottom-right corner to
 * resize it. Only the move can delete, so a resize never does. Memoised: the
 * reducer keeps untouched notes as the same objects and the callbacks are
 * stable, so a change to one note renders only that card.
 */
export const NoteCard = memo(NoteCardView);
