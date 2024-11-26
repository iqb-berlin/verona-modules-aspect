export class RangeSelectionService {
  static getRange(): Range | null {
    const selection = window.getSelection() as Selection;
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  }

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

    selection.removeAllRanges();
    selection.addRange(range);
  }
}
