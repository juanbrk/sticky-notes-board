import { type PointerEvent, useMemo, useRef } from 'react';

import type * as Geometry from '../../types/geometry.types';
import type * as Gesture from '../../types/gesture.types';

/**
 * Tracks one primary-button pointer drag on an element and reports it in client
 * coordinates. It knows nothing about what is being dragged, so creating, moving
 * and resizing notes can all build on it.
 *
 * The element captures the pointer on press, so moves and the release keep
 * arriving even when the pointer leaves it. A `pointercancel`, or the element
 * losing capture while the button is still held, ends the gesture with `onCancel`.
 *
 * Pass stable callbacks (`useCallback`): the returned handlers are memoised on them.
 *
 * @param callbacks - Called on start, on each move, on release and on cancel
 * @returns Pointer event props to spread on the element that owns the gesture
 *
 * @example
 * const dragHandlers = useDragGesture({ onStart, onMove, onEnd, onCancel });
 * return <div {...dragHandlers} />;
 */
export const useDragGesture = ({
  onStart,
  onMove,
  onEnd,
  onCancel,
}: Gesture.DragGestureCallbacks): Gesture.DragGestureHandlers => {
  const activePointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<Geometry.Point2d>({ x: 0, y: 0 });

  // TODO: cancel on window blur too. A mouse drag gets no `pointercancel` when the
  // window loses focus, so Alt/Cmd-Tab mid-drag still ends with `onEnd` (deferred bug B1).
  return useMemo(() => {
    const isActivePointer = (event: PointerEvent) => activePointerIdRef.current === event.pointerId;

    const handleCancel = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;
      activePointerIdRef.current = null;
      onCancel();
    };

    // HACK: Chrome sometimes fires `lostpointercapture` before `pointerup`. With no
    // button held the user has already let go, so the drag ends where the pointer
    // last was instead of being cancelled; the late `pointerup` is then ignored.
    const handleLostCapture = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;
      if (event.buttons !== 0) {
        handleCancel(event);
        return;
      }
      activePointerIdRef.current = null;
      onEnd(lastPointRef.current);
    };

    return {
      onPointerDown: (event) => {
        const isPrimaryPress = event.isPrimary && event.button === 0;
        const isGestureActive = activePointerIdRef.current !== null;
        if (!isPrimaryPress || isGestureActive) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        activePointerIdRef.current = event.pointerId;
        lastPointRef.current = getClientPoint(event);
        onStart(lastPointRef.current);
      },
      onPointerMove: (event) => {
        if (!isActivePointer(event)) return;
        lastPointRef.current = getClientPoint(event);
        onMove(lastPointRef.current);
      },
      onPointerUp: (event) => {
        if (!isActivePointer(event)) return;
        // Cleared before `onEnd`: browsers fire `lostpointercapture` right after
        // `pointerup`, and it must not be read as a cancel.
        activePointerIdRef.current = null;
        onEnd(getClientPoint(event));
      },
      onPointerCancel: handleCancel,
      onLostPointerCapture: handleLostCapture,
    };
  }, [onStart, onMove, onEnd, onCancel]);
};

const getClientPoint = (event: PointerEvent): Geometry.Point2d => ({
  x: event.clientX,
  y: event.clientY,
});
