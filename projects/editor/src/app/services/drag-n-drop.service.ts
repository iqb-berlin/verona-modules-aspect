import { Injectable } from '@angular/core';

/**
 * The one flag that says whether something is being dragged onto or across the editor's canvas -- a new
 * element out of the toolbox as well as one already placed.
 *
 * It has a single reader: a dynamic section switches the `pointer-events` of its children off while it
 * is set, so a drag passes through the elements and reaches the section underneath. A service rather
 * than a component field because the two ends of that arrangement do not know each other.
 */
@Injectable({
  providedIn: 'root'
})
export class DragNDropService {
  isDragInProgress = false;
}
