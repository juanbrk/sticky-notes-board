import type * as Geometry from '../types/geometry.types';

/**
 * Builds the rectangle spanned by two corner points, whatever the drag direction.
 *
 * @param start - Where the drag began
 * @param end - Where the pointer is now
 * @returns A rectangle whose `x`/`y` is the top-left corner and whose size is never negative
 *
 * @example
 * getRectFromPoints({ x: 100, y: 80 }, { x: 40, y: 20 });
 * // { x: 40, y: 20, width: 60, height: 60 }
 */
export const getRectFromPoints = (
  start: Geometry.Point2d,
  end: Geometry.Point2d
): Geometry.Rect => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

/**
 * Tells a drag from a click: the pointer counts as dragged once it has moved
 * strictly further than `thresholdPx` from where it was pressed.
 *
 * @param start - Where the pointer was pressed
 * @param end - Where the pointer is now
 * @param thresholdPx - Largest movement still treated as a click
 * @returns `true` when the movement is a drag
 */
export const isBeyondDragThreshold = (
  start: Geometry.Point2d,
  end: Geometry.Point2d,
  thresholdPx: number
): boolean => Math.hypot(end.x - start.x, end.y - start.y) > thresholdPx;

/**
 * Converts a viewport point into the coordinate space of an element whose
 * top-left corner sits at `origin` in the viewport.
 *
 * @param point - A point in viewport (client) coordinates
 * @param origin - The element's top-left corner in viewport coordinates
 * @returns The same point relative to the element
 */
export const getLocalPoint = (
  point: Geometry.Point2d,
  origin: Geometry.Point2d
): Geometry.Point2d => ({
  x: point.x - origin.x,
  y: point.y - origin.y,
});
