import { RangeSelectionService } from 'common/services/range-selection.service';

/**
 * How a line break typed on the player's own keyboard shows in an editable text -- the text parts of a
 * formula area. Those keys change the text through the form value, so nothing of what the browser does for
 * a physical Enter takes place (#1011):
 *
 * - A line break at the very end of a formula area gets no line of its own while nothing follows it. The
 *   new line appeared only with the next key, and a second Return looked necessary. For a physical Enter
 *   Chrome writes a second line break as a placeholder, which `keyToInsert` does as well. Before a formula
 *   the formula itself opens the line, and a placeholder would add an empty one.
 * - A caret right after a line break, in the same text node, is drawn by Firefox at the end of the line
 *   before. At the start of a text node of its own it is drawn on the new line -- where Chrome puts it after
 *   a physical Enter, and where `moveCaretToNextLine` puts it.
 */
export class EditableLineBreak {
  /** What a key inserts at the caret: a line break with nothing after it in the whole area is doubled, the
      second one keeping the new line open until something is typed into it. */
  static keyToInsert(key: string, isAtEndOfArea: boolean): string {
    return key === '\n' && isAtEndOfArea ? '\n\n' : key;
  }

  /** The text of the area's last part without a line break at its very end that shows nothing: one after
      text, or one that is all the part holds. Only a second one keeps an empty last line open
      (`keyToInsert`). Left in place, Backspace after Return kept one in the answer that nobody could see,
      and the keyboard could not delete either, as the caret stops in front of it (`lastCaretOffset`). */
  static withoutHiddenLineBreak(text: string): string {
    return text.endsWith('\n') && !text.endsWith('\n\n') ? text.slice(0, -1) : text;
  }

  /** Whether nothing follows the text part in its formula area -- neither a formula nor more text. A text
      that is no part of a formula area has nothing after it either. */
  static isLastPart(editable: HTMLElement): boolean {
    return !editable.closest('aspect-text-area-math-segment')?.nextElementSibling;
  }

  /** The last offset a caret can show at in the area's last text part: in front of a line break that ends
      it. Behind such a line break there is no line -- it is the placeholder, also once something has been
      typed in front of it -- and the next character would open one more. */
  static lastCaretOffset(text: string): number {
    return text.endsWith('\n') ? text.length - 1 : text.length;
  }

  /**
   * Moves a caret that follows a line break to the start of a text node of its own, splitting the node it
   * is in. A caret already there, one after anything else, a selection with extent and a selection outside
   * the element stay as they are.
   *
   * Firefox's own Enter ends the text with a `<br>` and leaves the caret between the line break and the
   * `<br>`, where it is drawn at the end of the line before as well. That `<br>` becomes the line break of
   * text Chrome writes in its place, so the caret has a text node to start the line in. The text then holds
   * the second line break the player's keyboard writes too (`keyToInsert`). Firefox's undo can no longer
   * take back that Enter, as its step refers to the `<br>`; that is the price of the caret on the new line.
   */
  static moveCaretToNextLine(editable: HTMLElement): void {
    const range = RangeSelectionService.getRange();
    if (!range || !range.collapsed || !editable.contains(range.startContainer)) return;
    const lineStart = EditableLineBreak.takeLineStart(range.startContainer, range.startOffset);
    if (!lineStart) return;
    const caret = document.createRange();
    caret.setStart(lineStart, 0);
    caret.collapse(true);
    RangeSelectionService.addRange(caret);
  }

  /** The text node the line after the position starts with, made one where it is not yet: `null` if the
      position does not follow a line break or nothing follows it. */
  private static takeLineStart(container: Node, offset: number): Text | null {
    let next: Node | null;
    if (container instanceof Text) {
      if (container.data[offset - 1] !== '\n') return null;
      if (offset < container.length) return container.splitText(offset);
      next = container.nextSibling;
    } else {
      const previous = container.childNodes[offset - 1];
      if (!(previous instanceof Text) || !previous.data.endsWith('\n')) return null;
      next = container.childNodes[offset] ?? null;
    }
    if (next instanceof HTMLBRElement) {
      const lineBreak = document.createTextNode('\n');
      next.replaceWith(lineBreak);
      return lineBreak;
    }
    return next instanceof Text ? next : null;
  }
}
