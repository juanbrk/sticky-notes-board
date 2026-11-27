import { useCallback, useMemo, useRef } from 'react';

import * as GeometryUtils from '../../helpers/geometry.helpers';
import { DRAG_THRESHOLD_PX } from '../../lib/board.constants';
import { setElementRect } from '../../lib/element-rect';
import type * as Geometry from '../../types/geometry.types';
import type * as Gesture from '../../types/gesture.types';
import type * as Notes from '../../types/notes.types';
import { useDragGesture } from '../gestures/drag-gesture.hook';

/**
 * Drags an existing note to change its rect: moving it or resizing it,
 * depending on `getNextRect`. While the pointer moves, the rect is written
 * straight to the note's element; the store changes once, on release, and only
 * if the rect changed. A release within the drag threshold, or a cancel, puts
 * the element back where the note is, since React will not: its props did not change.
 *
 * During the drag the element carries `data-gesture`, so CSS can style it
 * without a render.
 *
 * @param options - The note, its element, the gesture name, how the rect follows the pointer, and where to commit it
 * @returns Pointer event props to spread on the element that starts this drag
 *
 * @example
 * const moveHandlers = useDragNote({ note, elementRef, gesture: 'move', getNextRect, onCommit: onMove });
 * return <div ref={elementRef} {...moveHandlers} />;
 */
export const useDragNote = ({
  note,
  elementRef,
  gesture,
  getNextRect,
  onCommit,
}: Notes.DragNoteOptions): Gesture.DragGestureHandlers => {
  const pressPointRef = useRef<Geometry.Point2d>({ x: 0, y: 0 });

  const getDraggedRect = useCallback(
    (clientPoint: Geometry.Point2d): Geometry.Rect => {
      const pressPoint = pressPointRef.current;
      if (!GeometryUtils.isBeyondDragThreshold(pressPoint, clientPoint, DRAG_THRESHOLD_PX)) {
        return note;
      }
      const delta = { x: clientPoint.x - pressPoint.x, y: clientPoint.y - pressPoint.y };
      return getNextRect(note, delta);
    },
    [note, getNextRect]
  );

  const showRect = useCallback(
    (rect: Geometry.Rect) => {
      if (elementRef.current) setElementRect(elementRef.current, rect);
    },
    [elementRef]
  );

  const clearGesture = useCallback(() => {
    elementRef.current?.removeAttribute('data-gesture');
  }, [elementRef]);

  const handleDragStart = useCallback(
    (clientOrigin: Geometry.Point2d) => {
      pressPointRef.current = clientOrigin;
      elementRef.current?.setAttribute('data-gesture', gesture);
    },
    [elementRef, gesture]
  );

  const handleDragMove = useCallback(
    (clientPoint: Geometry.Point2d) => {
      showRect(getDraggedRect(clientPoint));
    },
    [getDraggedRect, showRect]
  );

  const handleDragEnd = useCallback(
    (clientPoint: Geometry.Point2d) => {
      clearGesture();
      const rect = getDraggedRect(clientPoint);
      showRect(rect);
      if (!GeometryUtils.isSameRect(rect, note)) onCommit(note.id, rect);
    },
    [clearGesture, getDraggedRect, note, onCommit, showRect]
  );

  const handleDragCancel = useCallback(() => {
    clearGesture();
    showRect(note);
  }, [clearGesture, note, showRect]);

  const dragHandlers = useDragGesture({
    onStart: handleDragStart,
    onMove: handleDragMove,
    onEnd: handleDragEnd,
    onCancel: handleDragCancel,
  });

  // The press stops here, so a parent with its own drag (the board's
  // drag-to-create, the note's move under its resize handle) never sees it.
  return useMemo(
    () => ({
      ...dragHandlers,
      onPointerDown: (event) => {
        event.stopPropagation();
        dragHandlers.onPointerDown(event);
      },
    }),
    [dragHandlers]
  );
};
