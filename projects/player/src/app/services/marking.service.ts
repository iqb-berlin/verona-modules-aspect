import { Injectable } from '@angular/core';
import { TextComponent } from '../../../../common/ui-elements/text/text.component';

@Injectable({
  providedIn: 'root'
})
export class MarkingService {
  private static readonly MARKING_TAG = 'ASPECT-MARKED';

  applySelection(mode: 'mark' | 'delete',
                 color: string,
                 element: HTMLElement,
                 textComponent: TextComponent): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (this.isDescendantOf(range.startContainer, element) &&
        this.isDescendantOf(range.endContainer, element)) {
        this.applyRange(range, selection, mode === 'delete', color);
        textComponent.elementValueChanged.emit({
          id: textComponent.elementModel.id,
          values: [this.getMarkingData(textComponent.elementModel.text as string),
            this.getMarkingData(element.innerHTML)]
        });
        textComponent.elementModel.text = element.innerHTML;
      } else {
        // eslint-disable-next-line no-console
        console.warn('Selection contains elements that are outside the text component!');
      }
      selection.removeAllRanges();
    } // nothing to do!
  }

  getMarkingData = (htmlText: string): string[] => {
    const markingStartPattern =
      new RegExp(`<${MarkingService.MARKING_TAG.toLowerCase()} [a-z]+="[\\w\\d()-;:, #]+">`);
    const markingClosingTag = `</${MarkingService.MARKING_TAG.toLowerCase()}>`;
    let newHtmlText = htmlText;
    const markCollection = [];
    let matchesArray;
    do {
      matchesArray = newHtmlText.match(markingStartPattern);
      if (matchesArray) {
        const startMatch = matchesArray[0];
        matchesArray = newHtmlText.match(markingClosingTag);
        if (matchesArray) {
          const endMatch = matchesArray[0];
          // we have to escape the brackets of rgb color
          const startIndex = newHtmlText.search(startMatch.replace('(', '\\(').replace(')', '\\)'));
          newHtmlText = newHtmlText.replace(startMatch, '');
          const endIndex = newHtmlText.search(endMatch);
          newHtmlText = newHtmlText.replace(endMatch, '');
          markCollection.push(`${startIndex}-${endIndex}-${this.getMarkingColor(startMatch)}`);
        }
      }
    } while (matchesArray);
    return markCollection;
  };

  restoreMarkings(markings: string[], htmlText: string): string {
    let newHtmlText = htmlText;
    if (markings.length) {
      const markCollectionReversed = [...markings].reverse();
      const markingDataPattern = /^(\d+)-(\d+)-(.+)$/;
      const markingClosingTag = `</${MarkingService.MARKING_TAG.toLowerCase()}>`;
      markCollectionReversed.forEach(markingData => {
        const matchesArray = markingData.match(markingDataPattern);
        if (matchesArray) {
          const startIndex = Number(matchesArray[1]);
          const endIndex = Number(matchesArray[2]);
          const startMatch = this.createMarkingStartTag(matchesArray[3]);
          newHtmlText = newHtmlText.substring(0, endIndex) + markingClosingTag + newHtmlText.substr(endIndex);
          newHtmlText = newHtmlText.substring(0, startIndex) + startMatch + newHtmlText.substr(startIndex);
        }
      });
    }
    return newHtmlText;
  }

  private getMarkingColor = (tag: string): string => {
    const colors = tag.match(/\d{1,3}, \d{1,3}, \d{1,3}/);
    return (colors) ? this.rgbToHex(colors[0].split(',').map(value => Number(value))) : 'none';
  };

  private createMarkingStartTag(color: string): string {
    const rgb = this.hexToRgb(color);
    return `<${
      MarkingService.MARKING_TAG.toLowerCase()
    } style="background-color: rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]});">`;
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
    range: Range, selection: Selection, clear: boolean, color: string
  ): void {
    if (range.startContainer === range.endContainer) {
      if (clear) {
        this.clearMarkingFromNode(range);
      } else {
        this.markNode(range, color);
      }
    } else {
      // When the user finishes selecting between paragraphs and the selection happens from
      // back to front, Firefox does not consider the start container as a selected child node.
      // Therefore, it is added to the list of selected nodes at the beginning.
      const nodes: Node[] = [range.startContainer];
      this.findNodes(range.commonAncestorContainer.childNodes, nodes, selection);
      // When the user finishes selecting between paragraphs the browser does not consider the end container
      // as a selected child node. Therefore, it is added to the list of selected nodes at the end.
      if (range.endOffset === 0) {
        this.addEndContainer(nodes, range.endContainer);
      }
      if (clear) {
        this.clearNodes(nodes, range);
      } else {
        this.markNodes(nodes, range, color);
      }
    }
  }

  private addEndContainer = (nodes: Node[], endContainer: Node): void => {
    if (endContainer.nodeType === Node.ELEMENT_NODE && endContainer.childNodes.length) {
      if (!nodes.includes(endContainer.childNodes[0])) {
        nodes.push(endContainer.childNodes[0]);
      }
    } else if (endContainer.nodeType === Node.TEXT_NODE) {
      nodes.push(endContainer);
    }
  };

  private clearMarkingFromNode(range: Range): void {
    if (range.startContainer.parentElement?.tagName?.toUpperCase() === MarkingService.MARKING_TAG) {
      const previousText = range.startContainer.nodeValue?.substring(0, range.startOffset) || '';
      const text = range.startContainer.nodeValue?.substring(range.startOffset, range.endOffset) || '';
      const nextText = range.startContainer.nodeValue?.substring(range.endOffset) || '';
      if (text) {
        this.clearMarking(range.startContainer, text, previousText, nextText);
      }
    }
  }

  private clearMarking(node: Node, text: string, previousText: string, nextText: string) {
    const textElement = document.createTextNode(text as string);
    if (node.parentNode) {
      const { parentNode } = node.parentNode;
      const color = (node.parentNode as HTMLElement).style.backgroundColor || 'none';
      parentNode?.replaceChild(textElement, node.parentNode);
      if (previousText) {
        const prev = this.createMarkedElement(color);
        prev.append(document.createTextNode(previousText));
        parentNode?.insertBefore(prev, textElement);
      }
      if (nextText) {
        const end = this.createMarkedElement(color);
        end.append(document.createTextNode(nextText));
        parentNode?.insertBefore(end, textElement.nextSibling);
      }
    }
  }

  private clearNodes(nodes: Node[], range: Range): void {
    nodes.forEach((node: Node) => {
      const index = nodes.findIndex(rangeNode => rangeNode === node);
      if (node.parentElement?.tagName.toUpperCase() === MarkingService.MARKING_TAG) {
        const nodeValues = this.getNodeValues(node, nodes, index, range);
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
    const start = range.startOffset;
    const end = range.endOffset;
    let text: string;
    let previousText = '';
    let nextText = '';
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
        if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
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

  private rgbToHex = (rgb: number[]): string => `#${rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`;

  private hexToRgb = (hex: string): number[] => {
    const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (normal) return normal.slice(1).map(e => parseInt(e, 16));
    const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
    return [];
  };
}
