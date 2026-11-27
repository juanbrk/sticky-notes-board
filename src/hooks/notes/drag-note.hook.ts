import { useCallback, useMemo, useRef } from 'react';

import * as GeometryUtils from '../../helpers/geometry.helpers';
import { DRAG_THRESHOLD_PX } from '../../lib/board.constants';
import { getElementClientRect, setElementRect } from '../../lib/element-rect';
import type * as Geometry from '../../types/geometry.types';
import type * as Gesture from '../../types/gesture.types';
import type * as Notes from '../../types/notes.types';
import { useDragGesture } from '../gestures/drag-gesture.hook';

// Stands in when there is no drop target: the React Compiler cannot track an optional ref.
const NO_DROP_TARGET_REF: Notes.NoteDropTarget['ref'] = { current: null };

/**
 * Drags an existing note to change its rect: moving it or resizing it,
 * depending on `getNextRect`. While the pointer moves, the rect is written
 * straight to the note's element; the store changes once, on release, and only
 * if the rect changed. A press that never moves past the drag threshold, or a
 * cancel, puts the element back where the note is, since React will not: its
 * props did not change. Once past the threshold the drag stays a drag, so the
 * note can come back to within a few pixels of where it started.
 *
 * With a `dropTarget`, releasing the pointer over it calls `onDrop` instead of
 * committing the rect. The target is measured once, at drag start.
 *
 * During the drag the element carries `data-gesture`, and with a `dropTarget`
 * also `data-drop` (`Notes.NoteDropState`), so CSS can style the note and the
 * target without a render.
 *
 * @param options - The note, its element, the gesture name, how the rect follows the pointer, where to commit it, and an optional drop target
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
  dropTarget,
}: Notes.DragNoteOptions): Gesture.DragGestureHandlers => {
  // Unpacked so a caller may build `dropTarget` inline without breaking the memoised handlers.
  const dropTargetRef = dropTarget?.ref ?? NO_DROP_TARGET_REF;
  const onDrop = dropTarget?.onDrop;

  const pressPointRef = useRef<Geometry.Point2d>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dropAreaRef = useRef<Geometry.Rect | null>(null);
  const dropStateRef = useRef<Notes.NoteDropState | null>(null);

  const updateIsDragging = useCallback((clientPoint: Geometry.Point2d) => {
    if (isDraggingRef.current) return;
    isDraggingRef.current = GeometryUtils.isBeyondDragThreshold(
      pressPointRef.current,
      clientPoint,
      DRAG_THRESHOLD_PX
    );
  }, []);

  const getDraggedRect = useCallback(
    (clientPoint: Geometry.Point2d): Geometry.Rect => {
      if (!isDraggingRef.current) return note;
      const pressPoint = pressPointRef.current;
      const delta = { x: clientPoint.x - pressPoint.x, y: clientPoint.y - pressPoint.y };
      return getNextRect(note, delta);
    },
    [note, getNextRect]
  );

  const getDropState = useCallback((clientPoint: Geometry.Point2d): Notes.NoteDropState | null => {
    const dropArea = dropAreaRef.current;
    if (!dropArea || !isDraggingRef.current) return null;
    return GeometryUtils.isPointInRect(clientPoint, dropArea) ? 'armed' : 'ready';
  }, []);

  const showRect = useCallback(
    (rect: Geometry.Rect) => {
      if (elementRef.current) setElementRect(elementRef.current, rect);
    },
    [elementRef]
  );

  const showDropState = useCallback(
    (dropState: Notes.NoteDropState | null) => {
      if (dropStateRef.current === dropState) return;
      dropStateRef.current = dropState;
      if (dropState) elementRef.current?.setAttribute('data-drop', dropState);
      else elementRef.current?.removeAttribute('data-drop');
    },
    [elementRef]
  );

  const clearGesture = useCallback(() => {
    elementRef.current?.removeAttribute('data-gesture');
    showDropState(null);
  }, [elementRef, showDropState]);

  const handleDragStart = useCallback(
    (clientOrigin: Geometry.Point2d) => {
      pressPointRef.current = clientOrigin;
      isDraggingRef.current = false;
      const dropTargetElement = dropTargetRef.current;
      dropAreaRef.current = dropTargetElement ? getDropArea(dropTargetElement) : null;
      elementRef.current?.setAttribute('data-gesture', gesture);
    },
    [dropTargetRef, elementRef, gesture]
  );

  const handleDragMove = useCallback(
    (clientPoint: Geometry.Point2d) => {
      updateIsDragging(clientPoint);
      showRect(getDraggedRect(clientPoint));
      showDropState(getDropState(clientPoint));
    },
    [getDraggedRect, getDropState, showDropState, showRect, updateIsDragging]
  );

  const handleDragEnd = useCallback(
    (clientPoint: Geometry.Point2d) => {
      updateIsDragging(clientPoint);
      const isDropped = getDropState(clientPoint) === 'armed';
      clearGesture();
      // The note unmounts once the drop is handled, so there is no rect to show or commit.
      if (isDropped && onDrop) {
        onDrop(note.id);
        return;
      }
      const rect = getDraggedRect(clientPoint);
      showRect(rect);
      if (!GeometryUtils.isSameRect(rect, note)) onCommit(note.id, rect);
    },
    [clearGesture, getDraggedRect, getDropState, note, onCommit, onDrop, showRect, updateIsDragging]
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

/**
 * Business rule: the drop area runs from the target's top-left corner to
 * infinity right and down, not just the target's own box. A note is clamped at
 * the board's right and bottom edges while the pointer keeps going, so with
 * the bare box a small note pushed into the corner could come to rest hidden
 * under the trash, where no press can reach it.
 */
const getDropArea = (element: Element): Geometry.Rect => ({
  ...getElementClientRect(element),
  width: Infinity,
  height: Infinity,
});
