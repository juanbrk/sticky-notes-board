import { memo } from 'react';

import type * as Notes from '../types/notes.types';
import './note-card.css';

const NoteCardView = ({ note }: Notes.NoteCardProps) => (
  <div
    className="note-card"
    style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
  />
);

/**
 * A sticky note placed at its position and size on the board. Memoised: the
 * reducer keeps untouched notes as the same objects, so adding a note renders
 * only the new card.
 */
export const NoteCard = memo(NoteCardView);
