import { memo, useRef } from 'react';

import * as GeometryUtils from '../helpers/geometry.helpers';
import { useDragNote } from '../hooks/notes/drag-note.hook';
import { BOARD_SIZE } from '../lib/board.constants';
import type * as Notes from '../types/notes.types';
import './note-card.css';

const getMovedNoteRect: Notes.NoteRectTransform = (start, delta) =>
  GeometryUtils.getMovedRect(start, delta, BOARD_SIZE);

const NoteCardView = ({ note, onMove }: Notes.NoteCardProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const moveHandlers = useDragNote({
    note,
    elementRef,
    gesture: 'move',
    getNextRect: getMovedNoteRect,
    onCommit: onMove,
  });

  return (
    <div
      ref={elementRef}
      className="note-card"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
      {...moveHandlers}
    />
  );
};

/**
 * A sticky note placed at its position and size on the board; drag it to move
 * it. Memoised: the reducer keeps untouched notes as the same objects and the
 * callbacks are stable, so a change to one note renders only that card.
 */
export const NoteCard = memo(NoteCardView);
