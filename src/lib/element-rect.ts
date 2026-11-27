import type * as Geometry from '../types/geometry.types';

/**
 * Places an absolutely positioned element at `rect`, writing its inline style
 * directly. Used for live drag feedback, which must not cost a React render.
 *
 * @param element - The element to place
 * @param rect - Its position and size, in px, inside its containing block
 */
export const setElementRect = (element: HTMLElement, rect: Geometry.Rect): void => {
  element.style.setProperty('left', `${rect.x}px`);
  element.style.setProperty('top', `${rect.y}px`);
  element.style.setProperty('width', `${rect.width}px`);
  element.style.setProperty('height', `${rect.height}px`);
};
