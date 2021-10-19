import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarkingService {
  private static readonly MARKING_TAG = 'MARKED';

  applySelection(range: Range, selection: Selection, clear: boolean, color: string):void {
    if (range.startContainer === range.endContainer) {
      if (clear) {
        this.clearMarkingFromNode(range);
      } else {
        this.markNode(range, color);
      }
    } else {
      const nodes: Node[] = [];
      this.findNodes(range.commonAncestorContainer.childNodes, nodes, selection);
      if (clear) {
        this.clearMarkingFromNodes(nodes, range);
      } else {
        this.markNodes(nodes, range, color);
      }
    }
  }

  private clearMarkingFromNode(range: Range): void {
    if (range.startContainer.parentElement?.tagName?.toUpperCase() === MarkingService.MARKING_TAG) {
      const previousText = range.startContainer.nodeValue?.substring(0, range.startOffset) || '';
      const text = range.startContainer.nodeValue?.substring(range.startOffset, range.endOffset) || '';
      const nextText = range.startContainer.nodeValue?.substring(range.endOffset) || '';
      if (text) {
        this.clearMarking(range.startContainer, text, previousText, nextText, range);
      }
    }
  }

  private clearMarkingFromNodes(nodes: Node[], range: Range): void {
    nodes.forEach((node, index) => {
      if (node.parentElement?.tagName.toUpperCase() === MarkingService.MARKING_TAG) {
        const nodeValues = this.getNodeValues(node, nodes, index, range);
        if (nodeValues.text) {
          this.clearMarking(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText, range);
        }
      }
    });
  }

  private clearMarking(node: Node, text: string, previousText: string, nextText: string, range: Range) {
    const textElement = document.createTextNode(text as string);
    if (node.parentNode) {
      const color = node.parentElement?.style.backgroundColor || 'none';
      node.parentNode.parentNode?.replaceChild(textElement, node.parentNode);
      if (previousText) {
        const prev = this.createMarkedElement(color);
        prev.append(document.createTextNode(previousText));
        range.startContainer.insertBefore(prev, textElement);
      }
      if (nextText) {
        const end = this.createMarkedElement(color);
        end.append(document.createTextNode(nextText));
        range.endContainer.insertBefore(end, textElement.nextSibling);
      }
    }
  }

  private mark(
    node: Node, text: string, previousText: string, nextText: string, color: string
  ): void {
    const markedElement: HTMLElement = this.createMarkedElement(color);
    markedElement.append(document.createTextNode(text));
    // important!
    const { parentNode } = node;
    parentNode?.replaceChild(markedElement, node);
    if (previousText) {
      const prevDOM = document.createTextNode(previousText);
      parentNode?.insertBefore(prevDOM, markedElement);
    }
    if (nextText) {
      const nextDOM = document.createTextNode(nextText);
      parentNode?.insertBefore(nextDOM, markedElement.nextSibling);
    }
  }

  private getNodeValues = (node: Node, nodes: Node[], index: number, range: Range): {
    text: string, previousText: string, nextText: string
  } => {
    const start = Math.min(range.startOffset, range.endOffset);
    const end = Math.max(range.startOffset, range.endOffset);
    let text: string; let previousText = ''; let nextText = '';
    if (index === 0) {
      previousText = node.nodeValue?.substring(0, start) || '';
      text = node.nodeValue?.substring(start) || '';
    } else if (index === nodes.length - 1) {
      text = node.nodeValue?.substring(0, end) || '';
      nextText = node.nodeValue?.substring(end) || '';
    } else {
      text = node.nodeValue || '';
    }
    return { text, previousText, nextText };
  };

  private markNode(range: Range, color: string): void {
    if (range.startContainer.parentElement?.tagName.toUpperCase() !== MarkingService.MARKING_TAG) {
      const markedElement: HTMLElement = this.createMarkedElement(color);
      range.surroundContents(markedElement);
    }
  }

  private markNodes(nodes: Node[], range: Range, color: string): void {
    nodes.forEach((node, index) => {
      const nodeValues = this.getNodeValues(node, nodes, index, range);
      if (nodeValues.text && node.parentElement?.tagName.toUpperCase() !== MarkingService.MARKING_TAG) {
        this.mark(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText, color);
      }
    });
  }

  private createMarkedElement = (color: string): HTMLElement => {
    const markedElement = document.createElement(MarkingService.MARKING_TAG);
    markedElement.style.backgroundColor = color;
    return markedElement;
  };

  private findNodes(childList: Node[] | NodeListOf<ChildNode>, nodes: Node[], selection: Selection): void {
    childList.forEach((node: Node) => {
      if (selection.containsNode(node, true)) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          nodes.push(node);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.childNodes) {
            this.findNodes(node.childNodes, nodes, selection);
          }
        }
      }
    });
  }
}
