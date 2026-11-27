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
