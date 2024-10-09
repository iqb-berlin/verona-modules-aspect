import {
  AfterViewInit, ApplicationRef, createComponent, Directive, Input, Renderer2
} from '@angular/core';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/elements/markables-container/markables-container.component';
import { TextComponent } from 'common/components/text/text.component';
import { Markable, MarkablesContainer } from 'player/src/app/models/markable.interface';
import { MarkableService } from 'player/src/app/services/markable.service';

@Directive({
  selector: '[markables]',
  standalone: true
})
export class MarkablesDirective implements AfterViewInit {
  @Input() elementComponent!: TextComponent;

  constructor(
    private markableService: MarkableService,
    private renderer: Renderer2,
    private applicationRef: ApplicationRef) { }

  ngAfterViewInit(): void {
    const nodes = MarkablesDirective.findNodes(this.elementComponent.textContainerRef.nativeElement.childNodes);
    const markablesContainers = this.getMarkablesContainers(nodes);
    this.markableService.markables = markablesContainers
      .flatMap((markablesContainer: MarkablesContainer) => markablesContainer.markables);
    this.createComponents(markablesContainers);
  }

  createComponents(markablesContainers: MarkablesContainer[]): void {
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
      componentRef.instance.markablesChange.subscribe(() => {
        this.elementComponent.elementValueChanged.emit(
          {
            id: this.elementComponent.elementModel.id,
            value: this.markableService.markables
          }
        );
      });
      this.applicationRef.attachView(componentRef.hostView);
    });
  }

  private getMarkablesContainers(nodes: Node[]): MarkablesContainer[] {
    const markablesContainers: MarkablesContainer[] = [];
    let wordsCount = 0;
    nodes.forEach((node: Node) => {
      const currentNodes = this.getMarkablesContainer(node, wordsCount);
      wordsCount += currentNodes.markables.length;
      markablesContainers.push(currentNodes);
    });
    return markablesContainers;
  }

  private getMarkablesContainer(node: Node, wordsCount: number): MarkablesContainer {
    return {
      node: node,
      markables: this.getMarkables(node.textContent || '', wordsCount)
    };
  }

  private getMarkables(text: string, startIndex: number): Markable[] {
    const markables: Markable[] = [];
    const wordsWithWhitespace = text?.match(/\s*\S+\s*/g);
    wordsWithWhitespace?.forEach((wordWithWhitespace: string, index: number) => {
      const prefix = wordWithWhitespace.match(/\s(?=[^,]*\S*)/g);
      const word = wordWithWhitespace.match(/\S+/g);
      const suffix = wordWithWhitespace.match(/[^\S]\s*$/g);
      const id = startIndex + index;
      const markedWord = this.markableService.getWordById(id);
      markables.push(
        {
          id: id,
          prefix: prefix ? prefix[0] : '',
          word: word ? word[0] : '',
          suffix: suffix ? suffix[0] : '',
          marked: markedWord ? markedWord.marked : false
        }
      );
    });
    return markables;
  }

  static findNodes(childList: Node[] | NodeListOf<ChildNode>): Node[] {
    const nodes: Node[] = [];
    childList.forEach((node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
        nodes.push(node);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length) {
          nodes.push(...MarkablesDirective.findNodes(node.childNodes));
        } else if (!nodes.includes(node)) {
          nodes.push(node);
        }
      }
    });
    return nodes;
  }
}
