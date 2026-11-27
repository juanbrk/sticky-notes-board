import { useCallback, useRef } from 'react';

import * as GeometryUtils from '../helpers/geometry.helpers';
import { useDragGesture } from '../hooks/gestures/drag-gesture.hook';
import type * as Geometry from '../types/geometry.types';
import type * as Notes from '../types/notes.types';
import './board.css';
import { NoteCard } from './note-card';

// Business rule: a press that moves this far or less is a click and creates nothing.
const DRAG_THRESHOLD_PX = 4;

/**
 * Fixed-size board where dragging on empty space creates a note. The live
 * preview is written straight to the DOM through a ref, so a drag costs no
 * React renders; the board state changes once, on release.
 */
export const Board = ({ notes, onCreateNote }: Notes.BoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const boardOriginRef = useRef<Geometry.Point2d>({ x: 0, y: 0 });
  const dragStartRef = useRef<Geometry.Point2d>({ x: 0, y: 0 });

  const getDraftRect = useCallback((clientPoint: Geometry.Point2d): Geometry.Rect | null => {
    const current = GeometryUtils.getLocalPoint(clientPoint, boardOriginRef.current);
    const isDrag = GeometryUtils.isBeyondDragThreshold(
      dragStartRef.current,
      current,
      DRAG_THRESHOLD_PX
    );
    return isDrag ? GeometryUtils.getRectFromPoints(dragStartRef.current, current) : null;
  }, []);

  const setPreviewRect = useCallback((rect: Geometry.Rect | null) => {
    const preview = previewRef.current;
    if (!preview) return;
    preview.hidden = rect === null;
    if (rect === null) return;
    preview.style.left = `${rect.x}px`;
    preview.style.top = `${rect.y}px`;
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;
  }, []);

  const handleDragStart = useCallback((clientOrigin: Geometry.Point2d) => {
    const board = boardRef.current;
    if (!board) return;
    // Measured once per gesture. Notes are positioned inside the padding box,
    // so the border width is added to the border-box corner.
    const bounds = board.getBoundingClientRect();
    boardOriginRef.current = { x: bounds.left + board.clientLeft, y: bounds.top + board.clientTop };
    dragStartRef.current = GeometryUtils.getLocalPoint(clientOrigin, boardOriginRef.current);
  }, []);

  const handleDragMove = useCallback(
    (clientPoint: Geometry.Point2d) => {
      setPreviewRect(getDraftRect(clientPoint));
    },
    [getDraftRect, setPreviewRect]
  );

  const handleDragEnd = useCallback(
    (clientPoint: Geometry.Point2d) => {
      setPreviewRect(null);
      const rect = getDraftRect(clientPoint);
      if (rect) onCreateNote(rect);
    },
    [getDraftRect, onCreateNote, setPreviewRect]
  );

  const handleDragCancel = useCallback(() => {
    setPreviewRect(null);
  }, [setPreviewRect]);

  const dragHandlers = useDragGesture({
    onStart: handleDragStart,
    onMove: handleDragMove,
    onEnd: handleDragEnd,
    onCancel: handleDragCancel,
  });

  return (
    <div ref={boardRef} className="board" {...dragHandlers}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
      <div ref={previewRef} className="board__preview" aria-hidden hidden />
    </div>
  );
};
