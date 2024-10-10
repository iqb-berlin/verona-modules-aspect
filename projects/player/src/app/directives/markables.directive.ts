import {
  AfterViewInit, ApplicationRef, createComponent, Directive, Input, Renderer2
} from '@angular/core';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/elements/markables-container/markables-container.component';
import { TextComponent } from 'common/components/text/text.component';
import { Markable, MarkablesContainer } from 'player/src/app/models/markable.interface';

@Directive({
  selector: '[markables]',
  standalone: true
})
export class MarkablesDirective implements AfterViewInit {
  @Input() elementComponent!: TextComponent;
  @Input() savedMarks!: string[];

  markables: Markable[] = [];

  constructor(
    private renderer: Renderer2,
    private applicationRef: ApplicationRef) { }

  ngAfterViewInit(): void {
    const nodes = MarkablesDirective.findNodes(this.elementComponent.textContainerRef.nativeElement.childNodes);
    const markablesContainers = this.getMarkablesContainers(nodes);
    this.markables = markablesContainers
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
            value: this.markables
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
    const wordsWithWhitespace = text?.match(/(\s*\S+\s*)|(s+\S*\s*)|(s*\S*\s+)/g);
    wordsWithWhitespace?.forEach((wordWithWhitespace: string, index: number) => {
      const prefix = wordWithWhitespace.match(/\s+(?=[^,]*\S*)/);
      const word = wordWithWhitespace.match(/\S+/);
      const suffix = wordWithWhitespace.match(/[^\S]\s*$/);
      const id = startIndex + index;
      const markedWord = this.getMarkedValueById(id);
      markables.push(
        {
          id: id,
          prefix: prefix ? prefix[0] : '',
          word: word ? word[0] : '',
          suffix: suffix ? suffix[0] : '',
          isActive: !!(word && word[0].length),
          marked: markedWord
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

  private getMarkedValueById(id: number): boolean {
    return this.savedMarks.map((mark: string) => mark.split('-')[0]).includes(id.toString());
  }
}
