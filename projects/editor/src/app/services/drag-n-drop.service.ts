import { Injectable } from '@angular/core';

/**
 * The one flag that says whether something is being dragged onto or across the editor's canvas -- a new
 * element out of the toolbox as well as one already placed.
 *
 * It has a single reader: a dynamic section switches the `pointer-events` of its frames off while it is
 * set, so a drag passes through them and reaches the grid underneath. Everything that sets it has to
 * clear it again when the drag ends -- left standing, it keeps the frames from being clicked (#1590). A
 * service rather than a component field because the two ends of that arrangement do not know each
 * other.
 */
@Injectable({
  providedIn: 'root'
})
export class DragNDropService {
  isDragInProgress = false;
}
