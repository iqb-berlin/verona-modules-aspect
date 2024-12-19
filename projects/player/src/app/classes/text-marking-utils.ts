import { TextComponent } from 'common/components/text/text.component';
import { Injectable } from '@angular/core';
import { LogService } from 'player/modules/logging/services/log.service';
import { RangeSelectionService } from 'common/services/range-selection-service';

@Injectable({
  providedIn: 'root'
})
export class TextMarkingUtils {
  private static readonly MARKING_TAG = 'ASPECT-MARKED';

  static applyMarkingDataToText(
    mode: 'mark' | 'delete',
    color: string,
    textComponent: TextComponent
  ): void {
    const selection = window.getSelection();
    if (selection && TextMarkingUtils.isSelectionValid(selection) && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = textComponent.textContainerRef.nativeElement;
      if (RangeSelectionService.isRangeInside(range, element)) {
        TextMarkingUtils.applyRange(range, selection, mode === 'delete', color);
        textComponent.elementValueChanged.emit({
          id: textComponent.elementModel.id,
          value: element.innerHTML
        });
        textComponent.savedText = element.innerHTML;
      } else {
        LogService.info('Selection contains elements that are outside the text component!');
      }
      selection.removeAllRanges();
    } // nothing to do!
  }

  static isSelectionValid = (selection: Selection): boolean => selection.toString().length > 0;

  static getMarkedTextIndices = (htmlText: string): string[] => {
    const markingStartPattern =
      new RegExp(`<${TextMarkingUtils.MARKING_TAG.toLowerCase()} [a-z]+="[\\w\\d()-;:, #]+">`);
    const markingClosingTag = `</${TextMarkingUtils.MARKING_TAG.toLowerCase()}>`;
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
          markCollection.push(`${startIndex}-${endIndex}-${TextMarkingUtils.getMarkingColor(startMatch)}`);
        }
      }
    } while (matchesArray);
    return markCollection;
  };

  static restoreMarkedTextIndices(markings: string[], htmlText: string): string {
    let newHtmlText = htmlText;
    if (markings.length) {
      const markCollectionReversed = [...markings].reverse();
      const markingDataPattern = /^(\d+)-(\d+)-(.+)$/;
      const markingClosingTag = `</${TextMarkingUtils.MARKING_TAG.toLowerCase()}>`;
      markCollectionReversed.forEach(markingData => {
        const matchesArray = markingData.match(markingDataPattern);
        if (matchesArray) {
          const startIndex = Number(matchesArray[1]);
          const endIndex = Number(matchesArray[2]);
          const startMatch = TextMarkingUtils.createMarkingStartTag(matchesArray[3]);
          newHtmlText = newHtmlText.substring(0, endIndex) + markingClosingTag + newHtmlText.substring(endIndex);
          newHtmlText = newHtmlText.substring(0, startIndex) + startMatch + newHtmlText.substring(startIndex);
        }
      });
    }
    return newHtmlText;
  }

  private static getMarkingColor = (tag: string): string => {
    const colors = tag.match(/\d{1,3}, \d{1,3}, \d{1,3}/);
    return (colors) ? TextMarkingUtils.rgbToHex(colors[0].split(',').map(value => Number(value))) : 'none';
  };

  private static createMarkingStartTag(color: string): string {
    const rgb = TextMarkingUtils.hexToRgb(color);
    return `<${
      TextMarkingUtils.MARKING_TAG.toLowerCase()
    } style="background-color: rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]});">`;
  }

  private static applyRange(
    range: Range, selection: Selection, clear: boolean, color: string
  ): void {
    const nodes: Node[] = TextMarkingUtils.getSelectedNodes(range, selection);
    if ((range.startContainer === range.endContainer) && range.startContainer.nodeType === Node.TEXT_NODE) {
      if (clear) {
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          TextMarkingUtils.clearMarkingFromNode(range);
        } else {
          TextMarkingUtils.clearNodes(nodes, range);
        }
      } else {
        TextMarkingUtils.markNode(range, color);
      }
    } else if (clear) {
      TextMarkingUtils.clearNodes(nodes, range);
    } else {
      TextMarkingUtils.markNodes(nodes, range, color);
    }
  }

  private static getSelectedNodes = (range: Range, selection: Selection): Node[] => {
    let startContainerNodes: Node[] = [];
    const endContainerNodes: Node[] = [];
    const nodes: Node[] = TextMarkingUtils.findNodes(range.commonAncestorContainer.childNodes, selection);
    // The range is structured differently in FF and Chrome.
    // With the same selection startcontainer and endcontainer differ.
    // Under certain conditions, startcontainer and endcontainer are not present
    // in the list of child nodes in FF and must therefore be added here
    if (!nodes.includes(range.startContainer)) {
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        startContainerNodes.push(range.startContainer);
      } else {
        startContainerNodes = TextMarkingUtils.findNodes(range.startContainer.childNodes, selection);
      }
    }
    if (range.endOffset === 0 && !nodes.includes(range.endContainer) && !range.endContainer.childNodes.length) {
      endContainerNodes.push(range.endContainer);
    }
    return [...startContainerNodes, ...nodes, ...endContainerNodes];
  };

  private static clearMarkingFromNode(range: Range): void {
    if (range.startContainer.parentElement?.tagName?.toUpperCase() === TextMarkingUtils.MARKING_TAG) {
      const previousText = range.startContainer.nodeValue?.substring(0, range.startOffset) || '';
      const text = range.startContainer.nodeValue?.substring(range.startOffset, range.endOffset) || '';
      const nextText = range.startContainer.nodeValue?.substring(range.endOffset) || '';
      if (text) {
        TextMarkingUtils.clearMarking(range.startContainer, text, previousText, nextText);
      }
    }
  }

  private static clearMarking(node: Node, text: string, previousText: string, nextText: string) {
    const textElement = document.createTextNode(text as string);
    if (node.parentNode) {
      const { parentNode } = node.parentNode;
      const color = (node.parentNode as HTMLElement).style.backgroundColor || 'none';
      parentNode?.replaceChild(textElement, node.parentNode);
      if (previousText) {
        const prev = TextMarkingUtils.createMarkedElement(color);
        prev.append(document.createTextNode(previousText));
        parentNode?.insertBefore(prev, textElement);
      }
      if (nextText) {
        const end = TextMarkingUtils.createMarkedElement(color);
        end.append(document.createTextNode(nextText));
        parentNode?.insertBefore(end, textElement.nextSibling);
      }
    }
  }

  private static clearNodes(nodes: Node[], range: Range): void {
    nodes.forEach((node: Node) => {
      const index = nodes.findIndex(rangeNode => rangeNode === node);
      if (node.parentElement?.tagName.toUpperCase() === TextMarkingUtils.MARKING_TAG) {
        const nodeValues = TextMarkingUtils.getNodeValues(node, nodes, index, range);
        if (nodeValues.text) {
          TextMarkingUtils.clearMarking(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText);
        } else {
          LogService.warn('Cannot recreate node for text', nodeValues);
        }
      }
    });
  }

  private static mark(
    node: Node, text: string, previousText: string, nextText: string, color: string
  ): void {
    const markedElement: HTMLElement = TextMarkingUtils.createMarkedElement(color);
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

  private static getNodeValues = (node: Node, nodes: Node[], index: number, range: Range): {
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

  private static markNode(range: Range, color: string): void {
    if (range.startContainer.parentElement?.tagName.toUpperCase() !== TextMarkingUtils.MARKING_TAG) {
      const markedElement: HTMLElement = TextMarkingUtils.createMarkedElement(color);
      range.surroundContents(markedElement);
    }
  }

  private static markNodes(nodes: Node[], range: Range, color: string): void {
    nodes.forEach((node, index) => {
      const nodeValues = TextMarkingUtils.getNodeValues(node, nodes, index, range);
      if (nodeValues.text && node.parentElement?.tagName.toUpperCase() !== TextMarkingUtils.MARKING_TAG) {
        TextMarkingUtils.mark(node, nodeValues.text, nodeValues.previousText, nodeValues.nextText, color);
      }
    });
  }

  private static createMarkedElement = (color: string): HTMLElement => {
    const markedElement = document.createElement(TextMarkingUtils.MARKING_TAG);
    markedElement.style.backgroundColor = color;
    return markedElement;
  };

  private static findNodes(childList: Node[] | NodeListOf<ChildNode>, selection: Selection): Node[] {
    const nodes: Node[] = [];
    childList.forEach((node: Node) => {
      if (selection.containsNode(node, true)) {
        if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
          nodes.push(node);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.childNodes.length) {
            nodes.push(...TextMarkingUtils.findNodes(node.childNodes, selection));
          } else if (!nodes.includes(node)) {
            nodes.push(node);
          }
        }
      }
    });
    return nodes;
  }

  static rgbToHex = (rgb: number[]): string => `#${rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`;

  static hexToRgbString(hex: string): string {
    const rgb = TextMarkingUtils.hexToRgb(hex);
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  private static hexToRgb(hex: string): number[] {
    const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (normal) return normal.slice(1).map(e => parseInt(e, 16));
    const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
    return [];
  }
}
