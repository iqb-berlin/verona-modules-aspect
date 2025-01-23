import { ApplicationRef, createComponent, Renderer2 } from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { Markable, MarkablesContainer } from 'player/src/app/models/markable.interface';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/markables-container/markables-container.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MarkingRange } from 'common/models/marking-data';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';

export class MarkableSupport {
  private renderer: Renderer2;
  private applicationRef: ApplicationRef;
  private markingPanelService: MarkingPanelService;
  private ngUnsubscribe = new Subject<void>();

  // eslint-disable-next-line max-len
  private static markables: RegExp = /[^\p{L}\d\-']*[\p{L}\d\-']+[^\p{L}\d\-']*|[^\p{L}\d\-']+[\p{L}\d\-']*[^\p{L}\d\-']*|[^\p{L}\d\-']*[\p{L}\d\-']*[^\p{L}\d\-']+/gu;
  private static prefix: RegExp = /[^\p{L}\d\-']+(?=[\p{L}\d\-']+)/u;
  private static word: RegExp = /[\p{L}\d\-']+/u;
  private static suffix: RegExp = /[^\p{L}\d\-']+$/u;

  constructor(
    renderer: Renderer2,
    applicationRef: ApplicationRef,
    markingPanelService: MarkingPanelService
  ) {
    this.renderer = renderer;
    this.applicationRef = applicationRef;
    this.markingPanelService = markingPanelService;
  }

  registerRangeClicks(elementComponent: TextComponent): void {
    elementComponent.markingRange?.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((markingRange: MarkingRange | null) => {
        this.markingPanelService.broadcastRangeClicks(
          {
            id: elementComponent.elementModel.id,
            markingPanels: elementComponent.elementModel.markingPanels,
            markingRange: markingRange
          }
        );
      });
  }

  createMarkables(savedMarks: string[], elementComponent: TextComponent): void {
    const nodes = MarkableSupport.getNodes(elementComponent.textContainerRef.nativeElement.childNodes);
    const markablesContainers = MarkableSupport
      .getMarkablesContainers(nodes, MarkableSupport.expandSavedMarks(savedMarks));
    const markables = markablesContainers
      .flatMap((markablesContainer: MarkablesContainer) => markablesContainer.markables);
    this.createComponents(markablesContainers, elementComponent, markables);
  }

  private static expandSavedMarks(savedMarks: string[]): string[] {
    return savedMarks.flatMap(range => {
      const [start, end, color] = range.split('-');
      const startIndex = parseInt(start, 10);
      const endIndex = parseInt(end, 10);
      return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => {
        const currentIdx = startIndex + i;
        return `${currentIdx}-${currentIdx}-${color}`;
      });
    });
  }

  private createComponents(markablesContainers: MarkablesContainer[],
                           elementComponent: TextComponent,
                           markables: Markable[]): void {
    markablesContainers.map((markablesContainer: MarkablesContainer) => this
      .createMarkablesContainer(markablesContainer, elementComponent, markables)
    );
  }

  private createMarkablesContainer(markablesContainer: MarkablesContainer,
                                   elementComponent: TextComponent,
                                   markables: Markable[]): void {
    const node = markablesContainer.node;
    const markableContainerElement = this.renderer.createElement('markable-container');
    node.parentNode?.replaceChild(markableContainerElement, node);
    const environmentInjector = this.applicationRef.injector;
    const componentRef = createComponent(MarkablesContainerComponent, {
      environmentInjector,
      hostElement: markableContainerElement
    });
    componentRef.instance.allMarkables = markables;
    componentRef.instance.markables = markablesContainer.markables;
    componentRef.instance.selectedColor = elementComponent.selectedColor;
    componentRef.instance.markingRange = elementComponent.markingRange;
    componentRef.instance.markablesChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        elementComponent.elementValueChanged.emit(
          {
            id: elementComponent.elementModel.id,
            value: markables
          }
        );
      });
    this.applicationRef.attachView(componentRef.hostView);
  }

  private static getMarkablesContainers(nodes: Node[], savedMarks: string[]): MarkablesContainer[] {
    let offset = 0;
    return nodes.map((node: Node) => {
      const currentNodes = MarkableSupport.getMarkablesContainer(node, offset, savedMarks);
      offset += currentNodes.markables.length;
      return currentNodes;
    });
  }

  private static getMarkablesContainer(node: Node, offset: number, savedMarks: string[]): MarkablesContainer {
    return {
      node: node,
      markables: MarkableSupport.getMarkables(node.textContent || '', offset, savedMarks)
    };
  }

  private static getMarkables(text: string, startIndex: number, savedMarks: string[]): Markable[] {
    const wordsWithWhitespace = text?.match(MarkableSupport.markables);
    return wordsWithWhitespace?.map((wordWithWhitespace: string, index: number) => {
      const prefix = wordWithWhitespace.match(MarkableSupport.prefix);
      const word = wordWithWhitespace.match(MarkableSupport.word);
      const suffix = wordWithWhitespace.match(MarkableSupport.suffix);
      const id = startIndex + index;
      const color = MarkableSupport.getColorValueById(id, savedMarks);
      return {
        id: id,
        prefix: prefix ? prefix[0] : '',
        word: word ? word[0] : '',
        suffix: suffix ? suffix[0] : '',
        isActive: !!(word && word[0].length),
        color: color
      };
    }) || [];
  }

  private static getNodes(childList: Node[] | NodeListOf<ChildNode>): Node[] {
    return Array.from(childList).reduce((nodes: Node[], node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node) && node.textContent) {
        nodes.push(node);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length) {
          nodes.push(...MarkableSupport.getNodes(node.childNodes));
        }
      }
      return nodes;
    }, []);
  }

  private static getColorValueById(id: number, savedMarks: string[]): string | null {
    return savedMarks.map(savedMark => savedMark.split('-'))
      .find(mark => mark[0] === id.toString())?.[2] || null;
  }

  reset(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
