import { Injectable } from '@angular/core';
import { TextComponent } from '../../../../common/ui-elements/text/text.component';

@Injectable({
  providedIn: 'root'
})
export class MarkingService {
  private static readonly MARKING_TAG = 'MARKED';
  private static readonly UNDERLINE_TAG = 'UNDERLINED';

  applySelection(mode: 'mark' | 'underline' | 'delete',
                 color: string,
                 element: HTMLElement,
                 textComponent: TextComponent): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (this.isDescendantOf(range.startContainer, element) &&
        this.isDescendantOf(range.endContainer, element)) {
        const markMode = mode === 'mark' ? 'marked' : 'underlined';
        this.applyRange(range, selection, mode === 'delete', color, markMode);
        textComponent.elementValueChanged.emit({
          id: textComponent.elementModel.id,
          values: [textComponent.elementModel.text as string, element.innerHTML]
        });
        textComponent.elementModel.text = element.innerHTML;
      }
      selection.removeAllRanges();
    } // nothing to do!
  }

  private isDescendantOf(node: Node | null, element: HTMLElement): boolean {
    if (!node || node === document) {
      return false;
    }
    if (node.parentElement === element) {
      return true;
    }
    return this.isDescendantOf(node.parentNode, element);
  }

  private applyRange(
    range: Range, selection: Selection, clear: boolean, color: string, markMode: 'marked' | 'underlined'
  ): void {
    if (range.startContainer === range.endContainer) {
      if (clear) {
        this.clearMarkingFromNode(range);
      } else {
        this.markNode(range, color, markMode);
      }
    } else {
      const nodes: Node[] = [];
      this.findNodes(range.commonAncestorContainer.childNodes, nodes, selection);
      if (clear) {
        this.clearMarkingFromNodes(nodes, range);
      } else {
        this.markNodes(nodes, range, color, markMode);
      }
    }
  }

  private clearMarkingFromNode(range: Range): void {
    if (range.startContainer.parentElement?.tagName?.toUpperCase() === MarkingService.MARKING_TAG ||
      range.startContainer.parentElement?.tagName?.toUpperCase() === MarkingService.UNDERLINE_TAG) {
      const previousText = range.startContainer.nodeValue?.substring(0, range.startOffset) || '';
      const text = range.startContainer.nodeValue?.substring(range.startOffset, range.endOffset) || '';
      const nextText = range.startContainer.nodeValue?.substring(range.endOffset) || '';
      if (text) {
        this.clearMarking(range.startContainer, text, previousText, nextText);
      }
    }
  }

  private clearMarkingFromNodes(nodes: Node[], range: Range): void {
    const nestedMarkedNodes = nodes
      .filter(node => node.parentElement?.parentElement?.tagName.toUpperCase() === MarkingService.MARKING_TAG);
    const nestedUnderLinedNodes = nodes
      .filter(node => node.parentElement?.parentElement?.tagName.toUpperCase() === MarkingService.UNDERLINE_TAG);
    if (nestedUnderLinedNodes.length) {
      this.clearNodes(nestedUnderLinedNodes, range, nodes);
    } else if (nestedMarkedNodes.length) {
      this.clearNodes(nestedMarkedNodes, range, nodes);
    } else {
      this.clearNodes(nodes, range, nodes);
    }
  }

  private clearMarking(node: Node, text: string, previousText: string, nextText: string) {
    const textElement = document.createTextNode(text as string);
    if (node.parentNode) {
      const { parentNode } = node.parentNode;
      const markMode =
        node.parentElement?.tagName.toUpperCase() === MarkingService.MARKING_TAG ? 'marked' : 'underlined';
      const color =
        markMode === 'underlined' ? 'black' : (node.parentNode as HTMLElement).style.backgroundColor || 'none';
      parentNode?.replaceChild(textElement, node.parentNode);
      if (previousText) {
        const prev = this.createMarkedElement(color, markMode);
        prev.append(document.createTextNode(previousText));
        prev.style.textDecoration = `solid underline ${color}`;
        parentNode?.insertBefore(prev, textElement);
      }
      if (nextText) {
        const end = this.createMarkedElement(color, markMode);
        end.append(document.createTextNode(nextText));
        end.style.textDecoration = `solid underline ${color}`;
        parentNode?.insertBefore(end, textElement.nextSibling);
      }
    }
  }

  private clearNodes(nodes: Node[], range: Range, allNodes: Node[]): void {
    nodes.forEach((node: Node) => {
      const index = allNodes.findIndex(rangeNode => rangeNode === node);
      if (node.parentElement?.tagName.toUpperCase() === MarkingService.MARKING_TAG ||
        node.parentElement?.tagName.toUpperCase() === MarkingService.UNDERLINE_TAG) {
        const nodeValues = this.getNodeValues(node, nodes, index, range, allNodes.length);
        if (nodeValues.text) {
          this.clearMarking(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText);
        } else {
          // eslint-disable-next-line no-console
          console.warn('Cannot recreate node for text', nodeValues);
        }
      }
    });
  }

  private mark(
    node: Node, text: string, previousText: string, nextText: string, color: string, markMode: 'marked' | 'underlined'
  ): void {
    const markedElement: HTMLElement = this.createMarkedElement(color, markMode);
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

  private getNodeValues = (node: Node, nodes: Node[], index: number, range: Range, nodesCount: number): {
    text: string, previousText: string, nextText: string
  } => {
    let start = range.startOffset;
    let end = range.endOffset;
    // Firefox double click hack
    if (nodesCount === 1) {
      start = Math.min(range.startOffset, range.endOffset);
      end = Math.max(range.startOffset, range.endOffset);
    }
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

  private markNode(range: Range, color: string, markMode: 'marked' | 'underlined'): void {
    if (range.startContainer.parentElement?.tagName.toUpperCase() !== MarkingService.MARKING_TAG ||
      range.startContainer.parentElement?.tagName.toUpperCase() !== MarkingService.UNDERLINE_TAG) {
      const markedElement: HTMLElement = this.createMarkedElement(color, markMode);
      range.surroundContents(markedElement);
    }
  }

  private markNodes(nodes: Node[], range: Range, color: string, markMode: 'marked' | 'underlined'): void {
    nodes.forEach((node, index) => {
      const nodeValues = this.getNodeValues(node, nodes, index, range, nodes.length);
      if (nodeValues.text && node.parentElement?.tagName.toUpperCase() !== MarkingService.MARKING_TAG &&
        (nodeValues.text && node.parentElement?.tagName.toUpperCase() !== MarkingService.UNDERLINE_TAG)
      ) {
        this.mark(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText, color, markMode);
      }
    });
  }

  private createMarkedElement = (color: string, markMode: 'marked' | 'underlined'): HTMLElement => {
    let markedElement;
    if (markMode === 'marked') {
      markedElement = document.createElement(MarkingService.MARKING_TAG);
      markedElement.style.backgroundColor = color;
    } else {
      markedElement = document.createElement(MarkingService.UNDERLINE_TAG);
      markedElement.style.textDecoration = `underline solid ${color}`;
    }
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
