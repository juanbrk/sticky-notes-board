import type { PointerEventHandler } from 'react';

import type * as Geometry from './geometry.types';

/** What a drag gesture reports. Every point is in viewport (client) coordinates. */
export interface DragGestureCallbacks {
  onStart: (origin: Geometry.Point2d) => void;
  onMove: (current: Geometry.Point2d) => void;
  onEnd: (current: Geometry.Point2d) => void;
  onCancel: () => void;
}

/** Pointer event props to spread on the element that owns the gesture. */
export interface DragGestureHandlers {
  onPointerDown: PointerEventHandler<Element>;
  onPointerMove: PointerEventHandler<Element>;
  onPointerUp: PointerEventHandler<Element>;
  onPointerCancel: PointerEventHandler<Element>;
  onLostPointerCapture: PointerEventHandler<Element>;
}
