import { describe, expect, it } from 'vitest';

import * as GeometryUtils from './geometry.helpers';

describe('getRectFromPoints', () => {
  const origin = { x: 100, y: 100 };

  it.each([
    ['down-right', { x: 160, y: 140 }, { x: 100, y: 100, width: 60, height: 40 }],
    ['down-left', { x: 40, y: 140 }, { x: 40, y: 100, width: 60, height: 40 }],
    ['up-right', { x: 160, y: 60 }, { x: 100, y: 60, width: 60, height: 40 }],
    ['up-left', { x: 40, y: 60 }, { x: 40, y: 60, width: 60, height: 40 }],
  ])('normalises a %s drag to a top-left rectangle', (_direction, end, expected) => {
    expect(GeometryUtils.getRectFromPoints(origin, end)).toEqual(expected);
  });

  it('returns a zero-size rectangle when both points coincide', () => {
    expect(GeometryUtils.getRectFromPoints(origin, origin)).toEqual({
      x: 100,
      y: 100,
      width: 0,
      height: 0,
    });
  });
});

describe('isBeyondDragThreshold', () => {
  const start = { x: 0, y: 0 };

  it('treats a movement equal to the threshold as a click', () => {
    expect(GeometryUtils.isBeyondDragThreshold(start, { x: 3, y: 4 }, 5)).toBe(false);
  });

  it('treats a movement just past the threshold as a drag', () => {
    expect(GeometryUtils.isBeyondDragThreshold(start, { x: 3, y: 4.1 }, 5)).toBe(true);
  });

  it('measures the distance in any direction', () => {
    expect(GeometryUtils.isBeyondDragThreshold(start, { x: -6, y: 0 }, 5)).toBe(true);
  });
});

describe('getLocalPoint', () => {
  it('offsets a viewport point by the element origin', () => {
    expect(GeometryUtils.getLocalPoint({ x: 250, y: 130 }, { x: 32, y: 64 })).toEqual({
      x: 218,
      y: 66,
    });
  });
});

describe('clampPoint', () => {
  const bounds = { width: 960, height: 640 };

  it('keeps a point that is already inside', () => {
    expect(GeometryUtils.clampPoint({ x: 100, y: 200 }, bounds)).toEqual({ x: 100, y: 200 });
  });

  it.each([
    ['left', { x: -40, y: 200 }, { x: 0, y: 200 }],
    ['top', { x: 100, y: -40 }, { x: 100, y: 0 }],
    ['right', { x: 1200, y: 200 }, { x: 960, y: 200 }],
    ['bottom', { x: 100, y: 900 }, { x: 100, y: 640 }],
    ['top-left corner', { x: -5, y: -5 }, { x: 0, y: 0 }],
    ['bottom-right corner', { x: 2000, y: 2000 }, { x: 960, y: 640 }],
  ])('pulls a point past the %s back onto the edge', (_edge, point, expected) => {
    expect(GeometryUtils.clampPoint(point, bounds)).toEqual(expected);
  });

  it('keeps a point that sits exactly on an edge', () => {
    expect(GeometryUtils.clampPoint({ x: 960, y: 0 }, bounds)).toEqual({ x: 960, y: 0 });
  });
});

describe('isPointInRect', () => {
  const rect = { x: 100, y: 50, width: 80, height: 40 };

  it('is true for a point inside', () => {
    expect(GeometryUtils.isPointInRect({ x: 140, y: 70 }, rect)).toBe(true);
  });

  it.each([
    ['left', { x: 100, y: 70 }],
    ['right', { x: 180, y: 70 }],
    ['top', { x: 140, y: 50 }],
    ['bottom', { x: 140, y: 90 }],
  ])('is true for a point on the %s edge', (_edge, point) => {
    expect(GeometryUtils.isPointInRect(point, rect)).toBe(true);
  });

  it.each([
    ['left', { x: 99, y: 70 }],
    ['right', { x: 181, y: 70 }],
    ['top', { x: 140, y: 49 }],
    ['bottom', { x: 140, y: 91 }],
  ])('is false for a point 1px past the %s edge', (_edge, point) => {
    expect(GeometryUtils.isPointInRect(point, rect)).toBe(false);
  });

  describe('a rect that reaches without end to the right and down', () => {
    const corner = { x: 100, y: 50, width: Infinity, height: Infinity };

    it('is true for a point far past its corner', () => {
      expect(GeometryUtils.isPointInRect({ x: 1e6, y: 1e6 }, corner)).toBe(true);
    });

    it('is still false above or to the left of its corner', () => {
      expect(GeometryUtils.isPointInRect({ x: 99, y: 1e6 }, corner)).toBe(false);
      expect(GeometryUtils.isPointInRect({ x: 1e6, y: 49 }, corner)).toBe(false);
    });
  });
});

describe('isSameRect', () => {
  const rect = { x: 1, y: 2, width: 3, height: 4 };

  it('is true when position and size match', () => {
    expect(GeometryUtils.isSameRect(rect, { ...rect })).toBe(true);
  });

  it.each([['x'], ['y'], ['width'], ['height']] as const)('is false when %s differs', (key) => {
    expect(GeometryUtils.isSameRect(rect, { ...rect, [key]: rect[key] + 1 })).toBe(false);
  });
});

describe('getMovedRect', () => {
  const bounds = { width: 960, height: 640 };
  const start = { x: 100, y: 100, width: 120, height: 80 };

  it('moves by the delta and keeps the size', () => {
    expect(GeometryUtils.getMovedRect(start, { x: 30, y: -20 }, bounds)).toEqual({
      x: 130,
      y: 80,
      width: 120,
      height: 80,
    });
  });

  it.each([
    ['left', { x: -500, y: 0 }, { x: 0, y: 100 }],
    ['top', { x: 0, y: -500 }, { x: 100, y: 0 }],
    ['right', { x: 5000, y: 0 }, { x: 840, y: 100 }],
    ['bottom', { x: 0, y: 5000 }, { x: 100, y: 560 }],
  ])('stops at the %s edge of the bounds', (_edge, delta, expected) => {
    expect(GeometryUtils.getMovedRect(start, delta, bounds)).toMatchObject(expected);
  });

  describe('a rect that already overflows', () => {
    const overflowing = { x: 900, y: -10, width: 120, height: 80 };

    it('does not jump back inside when barely moved', () => {
      expect(GeometryUtils.getMovedRect(overflowing, { x: 0, y: 0 }, bounds)).toEqual(overflowing);
    });

    it('cannot move further out', () => {
      expect(GeometryUtils.getMovedRect(overflowing, { x: 50, y: -50 }, bounds)).toMatchObject({
        x: 900,
        y: -10,
      });
    });

    it('can move back inside', () => {
      expect(GeometryUtils.getMovedRect(overflowing, { x: -100, y: 30 }, bounds)).toMatchObject({
        x: 800,
        y: 20,
      });
    });
  });
});

describe('getResizedRect', () => {
  const bounds = { width: 960, height: 640 };
  const minSize = { width: 40, height: 40 };
  const start = { x: 100, y: 100, width: 120, height: 80 };

  it('grows by the delta and keeps the top-left corner fixed', () => {
    expect(GeometryUtils.getResizedRect(start, { x: 30, y: 20 }, minSize, bounds)).toEqual({
      x: 100,
      y: 100,
      width: 150,
      height: 100,
    });
  });

  it('stops at the minimum size', () => {
    expect(
      GeometryUtils.getResizedRect(start, { x: -500, y: -500 }, minSize, bounds)
    ).toMatchObject({ width: 40, height: 40 });
  });

  it('stops at the right and bottom edges of the bounds', () => {
    expect(
      GeometryUtils.getResizedRect(start, { x: 5000, y: 5000 }, minSize, bounds)
    ).toMatchObject({ width: 860, height: 540 });
  });

  describe('a rect already under the minimum', () => {
    const tiny = { x: 100, y: 100, width: 20, height: 10 };

    it('starts from its current size instead of snapping to the minimum', () => {
      expect(GeometryUtils.getResizedRect(tiny, { x: 0, y: 0 }, minSize, bounds)).toEqual(tiny);
    });

    it('cannot shrink further', () => {
      expect(GeometryUtils.getResizedRect(tiny, { x: -10, y: -5 }, minSize, bounds)).toMatchObject({
        width: 20,
        height: 10,
      });
    });

    it('can grow', () => {
      expect(GeometryUtils.getResizedRect(tiny, { x: 50, y: 50 }, minSize, bounds)).toMatchObject({
        width: 70,
        height: 60,
      });
    });
  });

  it('does not snap a rect that already overflows the bounds, and cannot grow it further', () => {
    const overflowing = { x: 900, y: 600, width: 120, height: 80 };

    expect(
      GeometryUtils.getResizedRect(overflowing, { x: 10, y: 10 }, minSize, bounds)
    ).toMatchObject({ width: 120, height: 80 });
  });
});
