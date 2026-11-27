import { memo } from 'react';

import type * as Notes from '../types/notes.types';
import './note-card.css';

const NoteCardView = ({ note }: Notes.NoteCardProps) => (
  <div
    className="note-card"
    style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
  />
);

export const NoteCard = memo(NoteCardView);
