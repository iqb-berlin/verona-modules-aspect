import { ApplicationRef, createComponent, Renderer2 } from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { Markable, MarkablesContainer } from 'player/src/app/models/markable.interface';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/elements/markables-container/markables-container.component';

export class MarkableSupport {
  private renderer: Renderer2;
  private applicationRef: ApplicationRef;
  markables: Markable[] = [];

  constructor(
    renderer: Renderer2,
    applicationRef: ApplicationRef
  ) {
    this.renderer = renderer;
    this.applicationRef = applicationRef;
  }

  createMarkables(savedMarks: string[], elementComponent: TextComponent): void {
    const nodes = MarkableSupport.findNodes(elementComponent.textContainerRef.nativeElement.childNodes);
    const markablesContainers = MarkableSupport.getMarkablesContainers(nodes, savedMarks);
    this.markables = markablesContainers
      .flatMap((markablesContainer: MarkablesContainer) => markablesContainer.markables);
    this.createComponents(markablesContainers, elementComponent);
  }

  private createComponents(markablesContainers: MarkablesContainer[], elementComponent: TextComponent): void {
    markablesContainers.forEach((markablesContainer: MarkablesContainer) => {
      const node = markablesContainer.node;
      const markableContainerElement = this.renderer.createElement('markable-container');
      node.parentNode?.replaceChild(markableContainerElement, node);
      const environmentInjector = this.applicationRef.injector;
      const componentRef = createComponent(MarkablesContainerComponent, {
        environmentInjector,
        hostElement: markableContainerElement
      });
      componentRef.instance.markables = markablesContainer.markables;
      componentRef.instance.selectedColor = elementComponent.selectedColor;
      componentRef.instance.markablesChange.subscribe(() => {
        elementComponent.elementValueChanged.emit(
          {
            id: elementComponent.elementModel.id,
            value: this.markables
          }
        );
      });
      this.applicationRef.attachView(componentRef.hostView);
    });
  }

  private static getMarkablesContainers(nodes: Node[], savedMarks: string[]): MarkablesContainer[] {
    const markablesContainers: MarkablesContainer[] = [];
    let wordsCount = 0;
    nodes.forEach((node: Node) => {
      const currentNodes = MarkableSupport.getMarkablesContainer(node, wordsCount, savedMarks);
      wordsCount += currentNodes.markables.length;
      markablesContainers.push(currentNodes);
    });
    return markablesContainers;
  }

  private static getMarkablesContainer(node: Node, wordsCount: number, savedMarks: string[]): MarkablesContainer {
    return {
      node: node,
      markables: MarkableSupport.getMarkables(node.textContent || '', wordsCount, savedMarks)
    };
  }

  private static getMarkables(text: string, startIndex: number, savedMarks: string[]): Markable[] {
    const markables: Markable[] = [];
    const wordsWithWhitespace = text?.match(/(\s*\S+\s*)|(s+\S*\s*)|(s*\S*\s+)/g);
    wordsWithWhitespace?.forEach((wordWithWhitespace: string, index: number) => {
      const prefix = wordWithWhitespace.match(/\s+(?=[^,]*\S*)/);
      const word = wordWithWhitespace.match(/\S+/);
      const suffix = wordWithWhitespace.match(/[^\S]\s*$/);
      const id = startIndex + index;
      const markedWord = MarkableSupport.getColorValueById(id, savedMarks);
      markables.push(
        {
          id: id,
          prefix: prefix ? prefix[0] : '',
          word: word ? word[0] : '',
          suffix: suffix ? suffix[0] : '',
          isActive: !!(word && word[0].length),
          color: markedWord
        }
      );
    });
    return markables;
  }

  private static findNodes(childList: Node[] | NodeListOf<ChildNode>): Node[] {
    const nodes: Node[] = [];
    childList.forEach((node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
        nodes.push(node);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length) {
          nodes.push(...MarkableSupport.findNodes(node.childNodes));
        } else if (!nodes.includes(node)) {
          nodes.push(node);
        }
      }
    });
    return nodes;
  }

  private static getColorValueById(id: number, savedMarks: string[]): string | null {
    const savedMarkById = savedMarks.map(savedMark => savedMark.split('-'))
      .find(mark => mark[0] === id.toString());
    return savedMarkById ? savedMarkById[2] : null;
  }
}
