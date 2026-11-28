import { type PointerEvent, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type * as Geometry from '../../types/geometry.types';
import type * as Gesture from '../../types/gesture.types';

/**
 * Tracks one primary-button pointer drag on an element and reports it in client
 * coordinates. It knows nothing about what is being dragged, so creating, moving
 * and resizing notes can all build on it.
 *
 * The element captures the pointer on press, so moves and the release keep
 * arriving even when the pointer leaves it. The gesture ends with `onCancel` on a
 * `pointercancel`, when the element loses capture while the button is still held,
 * when the window loses focus mid-drag (Alt/Cmd-Tab; a mouse gets no
 * `pointercancel` then, only a `pointerup` after the `blur`), or on Esc, heard on
 * `window` because the pressed element usually has no keyboard focus. After a
 * cancel the press is spent: moves and the release are ignored until a fresh press.
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
  const windowListenersAbortRef = useRef<AbortController | null>(null);
  // The window listeners are added during the press, but bring-to-front hands this
  // hook new callbacks right after it; reading through a ref avoids a stale one.
  const onCancelRef = useRef(onCancel);

  useLayoutEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(
    () => () => {
      windowListenersAbortRef.current?.abort();
    },
    []
  );

  return useMemo(() => {
    const isActivePointer = (event: PointerEvent) => activePointerIdRef.current === event.pointerId;

    const finishGesture = () => {
      activePointerIdRef.current = null;
      windowListenersAbortRef.current?.abort();
      windowListenersAbortRef.current = null;
    };

    const cancelGesture = () => {
      finishGesture();
      onCancelRef.current();
    };

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelGesture();
    };

    const handleCancel = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;
      cancelGesture();
    };

    // HACK: Chrome sometimes fires `lostpointercapture` before `pointerup`. With no
    // button held the user has already let go, so the drag ends where the pointer
    // last was instead of being cancelled; the late `pointerup` is then ignored.
    const handleLostCapture = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;
      if (event.buttons !== 0) {
        cancelGesture();
        return;
      }
      finishGesture();
      onEnd(lastPointRef.current);
    };

    return {
      onPointerDown: (event) => {
        const isPrimaryPress = event.isPrimary && event.button === 0;
        const isGestureActive = activePointerIdRef.current !== null;
        if (!isPrimaryPress || isGestureActive) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        activePointerIdRef.current = event.pointerId;
        const { signal } = (windowListenersAbortRef.current = new AbortController());
        window.addEventListener('blur', cancelGesture, { signal });
        window.addEventListener('keydown', handleWindowKeyDown, { signal });
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
        finishGesture();
        onEnd(getClientPoint(event));
      },
      onPointerCancel: handleCancel,
      onLostPointerCapture: handleLostCapture,
    };
  }, [onStart, onMove, onEnd]);
};

const getClientPoint = (event: PointerEvent): Geometry.Point2d => ({
  x: event.clientX,
  y: event.clientY,
});
