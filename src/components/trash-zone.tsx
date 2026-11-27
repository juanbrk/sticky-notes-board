import type { PointerEventHandler } from 'react';

import type * as Notes from '../types/notes.types';
import './trash-zone.css';

// Business rule: a press on the trash never reaches the board, so it cannot start a new note.
const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
  event.stopPropagation();
};

/**
 * The fixed drop zone in the board's bottom-right corner, drawn above the notes.
 * A moved note released over it is deleted; the element is exposed through
 * `ref` so the move drag can measure it once at drag start.
 */
export const TrashZone = ({ ref }: Notes.TrashZoneProps) => (
  <div ref={ref} className="trash-zone" onPointerDown={handlePointerDown}>
    <svg className="trash-zone__icon" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />
    </svg>
    <span>Drop here to delete</span>
  </div>
);
