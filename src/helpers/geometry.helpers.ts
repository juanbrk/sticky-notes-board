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

/**
 * Pulls a point inside `bounds`, edges included.
 *
 * @param point - A point in the area's coordinates
 * @param bounds - The size of the area, whose top-left corner is the origin
 * @returns The closest point inside the area
 *
 * @example
 * clampPoint({ x: 1200, y: -30 }, { width: 960, height: 640 });
 * // { x: 960, y: 0 }
 */
export const clampPoint = (point: Geometry.Point2d, bounds: Geometry.Size): Geometry.Point2d => ({
  x: Math.min(Math.max(point.x, 0), bounds.width),
  y: Math.min(Math.max(point.y, 0), bounds.height),
});

/**
 * Tells whether two rectangles have the same position and size.
 *
 * @param a - A rectangle
 * @param b - Another rectangle
 * @returns `true` when every coordinate matches
 */
export const isSameRect = (a: Geometry.Rect, b: Geometry.Rect): boolean =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/**
 * Moves a rectangle by `delta`, keeping its size, without letting it go past
 * the edges of `bounds`. A rectangle that already overflows an edge is not
 * pulled back inside; it only cannot move further out.
 *
 * @param start - The rectangle when the move began
 * @param delta - How far the pointer has moved since then
 * @param bounds - The size of the area the rectangle lives in
 * @returns The moved rectangle
 *
 * @example
 * getMovedRect({ x: 10, y: 10, width: 100, height: 80 }, { x: -50, y: 20 }, { width: 960, height: 640 });
 * // { x: 0, y: 30, width: 100, height: 80 }
 */
export const getMovedRect = (
  start: Geometry.Rect,
  delta: Geometry.Point2d,
  bounds: Geometry.Size
): Geometry.Rect => ({
  ...start,
  x: clampFromStart(start.x + delta.x, start.x, 0, bounds.width - start.width),
  y: clampFromStart(start.y + delta.y, start.y, 0, bounds.height - start.height),
});

/**
 * Resizes a rectangle from its bottom-right corner by `delta`, keeping its
 * top-left corner fixed. The size stays between `minSize` and the edges of
 * `bounds`; a rectangle that already breaks a limit is not snapped to it, it
 * only cannot go further past it.
 *
 * @param start - The rectangle when the resize began
 * @param delta - How far the pointer has moved since then
 * @param minSize - The smallest size the resize may reach
 * @param bounds - The size of the area the rectangle lives in
 * @returns The resized rectangle
 *
 * @example
 * getResizedRect({ x: 900, y: 0, width: 40, height: 40 }, { x: 100, y: -20 }, { width: 40, height: 40 }, { width: 960, height: 640 });
 * // { x: 900, y: 0, width: 60, height: 40 }
 */
export const getResizedRect = (
  start: Geometry.Rect,
  delta: Geometry.Point2d,
  minSize: Geometry.Size,
  bounds: Geometry.Size
): Geometry.Rect => ({
  ...start,
  width: clampFromStart(start.width + delta.x, start.width, minSize.width, bounds.width - start.x),
  height: clampFromStart(
    start.height + delta.y,
    start.height,
    minSize.height,
    bounds.height - start.y
  ),
});

/**
 * Clamps `value` between `min` and `max`, with the range widened to include
 * `start`, so a value that started outside a limit is never pulled in to it.
 */
const clampFromStart = (value: number, start: number, min: number, max: number): number =>
  Math.min(Math.max(value, Math.min(min, start)), Math.max(max, start));
