import { RangeSelectionService } from 'common/services/range-selection.service';

/**
 * Keeps the caret of an editable text in sight while the player's keyboard or keypad types into it. Those
 * keys change the text through the form value, so the browser does not follow the caret as it does for a
 * physical keyboard, and a long text left the scroll area of a formula area (#936).
 *
 * A temporary marker at the caret is scrolled into view with `block: 'nearest'`: each surrounding scroll
 * area -- the field's own and the page's -- moves only when the line is not completely visible, and only as
 * far as it has to. Aligning the caret to the bottom after every key pulled the page back at the first key,
 * away from the position the keyboard had scrolled the field to, and left the field below the visible part
 * (#1661). The marker is one line of text high, which a line holding a formula, or the first line of a
 * formula area, exceeds. So it is scrolled to three times: aligned to the bottom of the line, to its top, and
 * last on the baseline, where it covers the text around the caret. A line that fits comes into view whole;
 * of a line higher than the area, at least the caret does. One em high on the baseline and scrolled to once,
 * as it was, the marker left the lower part of the line beyond the edge.
 */
export class CaretScroller {
  static scrollIntoView(range: Range): void {
    const marker = CaretScroller.createMarker();
    try {
      const caret = range.cloneRange();
      caret.collapse(true);
      caret.insertNode(marker);
      ['bottom', 'top', 'baseline'].forEach(alignment => {
        marker.style.verticalAlign = alignment;
        marker.scrollIntoView({ block: 'nearest' });
      });
      marker.remove();
      RangeSelectionService.addRange(range);
    } catch {
      // A boundary the marker cannot be inserted at leaves the scroll position as it is
      marker.remove();
    }
  }

  private static createMarker(): HTMLElement {
    const marker = document.createElement('span');
    marker.textContent = '\u200b'; // Zero-width space
    marker.style.display = 'inline-block';
    marker.style.width = '1px';
    marker.style.pointerEvents = 'none';
    return marker;
  }
}
