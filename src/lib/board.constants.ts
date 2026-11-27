import type * as Geometry from '../types/geometry.types';

// Business rule: the board has a fixed size; a resizable board is nice-to-have N8.
export const BOARD_SIZE = { width: 960, height: 640 } as const satisfies Geometry.Size;

// Business rule: the smallest a resize can make a note. A starting value, to tune in browser QA.
export const MIN_NOTE_SIZE = { width: 40, height: 40 } as const satisfies Geometry.Size;

// Business rule: a press that moves this far or less is a click and changes nothing.
export const DRAG_THRESHOLD_PX = 4;
