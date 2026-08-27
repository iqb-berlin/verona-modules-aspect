/**
 * Reading and setting what the reader has selected in the page, in the two forms the unit needs it:
 * the browser's own `Range`, and a pair of character offsets into an element's text -- the form a
 * marking is stored in.
 */
export class RangeSelectionService {
  /** The first range of the current selection, or `null` if nothing is selected. A caret without
      extent still counts as a range here. */
  static getRange(): Range | null {
    const selection = window.getSelection() as Selection;
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  }

  /** Whether both ends of the range lie within the element -- the check a text element makes before it
      accepts a selection as its own. */
  static isRangeInside(range: Range, element: HTMLElement): boolean {
    return (RangeSelectionService.isDescendantOf(range.startContainer, element) &&
      RangeSelectionService.isDescendantOf(range.endContainer, element));
  }

  /**
   * Whether the node sits anywhere below the element. The element itself is not below itself: a range
   * whose end is the element node rather than a node inside it counts as outside.
   */
  static isDescendantOf(node: Node | null, element: HTMLElement): boolean {
    if (!node || node === document) {
      return false;
    }
    if (node.parentElement === element) {
      return true;
    }
    return RangeSelectionService.isDescendantOf(node.parentNode, element);
  }

  /**
   * The range as character offsets into the element's text, counting through every text node and
   * ignoring the tags between them -- which is what makes an offset survive a re-render.
   *
   * A range that is not inside the element yields `{start: 0, end: 0}`, the same answer as a caret at
   * the very beginning; the caller has to tell the two apart itself.
   */
  static getSelectionRange(range: Range, inputElement: HTMLElement): { start: number; end: number } {
    let start = 0;
    let end = 0;

    if (!inputElement.contains(range.commonAncestorContainer)) {
      return { start, end };
    }

    const calculateOffsets = (node: Node): number => {
      let offset = 0;
      const walker = document.createTreeWalker(inputElement, NodeFilter.SHOW_TEXT, null);
      let currentNode: Node | null = walker.nextNode();

      while (currentNode) {
        if (currentNode === node) {
          break;
        }
        offset += currentNode.textContent?.length || 0;
        currentNode = walker.nextNode();
      }
      return offset;
    };

    start = calculateOffsets(range.startContainer) + range.startOffset;
    end = calculateOffsets(range.endContainer) + range.endOffset;

    return { start, end };
  }

  /** Selects a whole element, replacing whatever was selected before. */
  static setRange(element: HTMLElement) {
    const range = document.createRange();
    range.selectNode(element);
    RangeSelectionService.addRange(range);
  }

  /** Makes this range the selection -- everything selected before is dropped, so there is never more
      than the one range. */
  static addRange(range: Range, selection: Selection | null = window.getSelection()) {
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  /**
   * Selects the text between two character offsets, the counterpart of `getSelectionRange` -- how a
   * cursor position is restored after the text has been rebuilt.
   *
   * Offsets past the end of the text raise nothing, and nothing useful happens either: an end past the
   * text leaves a collapsed caret at the start offset, and a start past it leaves the selection
   * collapsed outside the element. A text that has grown shorter since the offsets were taken therefore
   * loses the selection rather than getting a shortened one.
   */
  static setSelectionRange(
    inputElement: HTMLElement,
    start: number,
    end: number
  ): void {
    const range = new Range();
    const selection = window.getSelection();
    if (!selection) return;

    let charCount = 0;

    const setRangeOffsets = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;

        if (start >= charCount && start <= charCount + textLength) {
          range.setStart(node, start - charCount);
        }

        if (end >= charCount && end <= charCount + textLength) {
          range.setEnd(node, end - charCount);
          return true;
        }

        charCount += textLength;
      } else {
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
          if (setRangeOffsets(childNodes[i])) {
            return true;
          }
        }
      }

      return false;
    };

    setRangeOffsets(inputElement);
    RangeSelectionService.addRange(range, selection);
  }
}
