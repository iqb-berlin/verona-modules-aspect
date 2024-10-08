import {
  AfterViewInit, ApplicationRef, createComponent, Directive, Input, Renderer2
} from '@angular/core';
import {
  ClickableContainerComponent
} from 'player/src/app/components/elements/clickable-container/clickable-container.component';
import { TextComponent } from 'common/components/text/text.component';
import { Clickable, ClickableTextNode } from 'player/src/app/models/clickable-text-node.interface';
import { ClickableService } from 'player/src/app/services/clickable.service';

@Directive({
  selector: '[clickable]',
  standalone: true
})
export class ClickableDirective implements AfterViewInit {
  @Input() elementComponent!: TextComponent;

  constructor(
    private clickableService: ClickableService,
    private renderer: Renderer2,
    private applicationRef: ApplicationRef) { }

  ngAfterViewInit(): void {
    const nodes = ClickableDirective.findNodes(this.elementComponent.textContainerRef.nativeElement.childNodes);
    const textNodes = ClickableDirective.getClickableTextNodes(nodes);
    this.clickableService.clickables = textNodes
      .flatMap((clickableTextNode: ClickableTextNode) => clickableTextNode.words);
    this.createComponents(textNodes);
  }

  createComponents(textNodes: ClickableTextNode[]): void {
    textNodes.forEach((clickableTextNode: ClickableTextNode) => {
      const node = clickableTextNode.node;
      const clickableContainer = this.renderer.createElement('clickable-container');
      node.parentNode?.replaceChild(clickableContainer, node);
      const environmentInjector = this.applicationRef.injector;
      const componentRef = createComponent(ClickableContainerComponent, {
        environmentInjector,
        hostElement: clickableContainer
      });
      componentRef.instance.items = clickableTextNode.words;
      this.applicationRef.attachView(componentRef.hostView);
    });
  }

  private static getClickableTextNodes(nodes: Node[]): ClickableTextNode[] {
    const clickableTextNodes: ClickableTextNode[] = [];
    let wordsCount = 0;
    nodes.forEach((node: Node) => {
      const currentNodes = ClickableDirective.createClickableTextNode(node, wordsCount);
      wordsCount += currentNodes.words.length;
      clickableTextNodes.push(currentNodes);
    });
    return clickableTextNodes;
  }

  private static createClickableTextNode(node: Node, wordsCount: number): ClickableTextNode {
    return {
      node: node,
      words: ClickableDirective.getWords(node.textContent || '', wordsCount)
    };
  }

  private static getWords(text: string, startIndex: number): Clickable[] {
    const words: Clickable[] = [];
    const wordsWithWhitespace = text?.match(/\s*\S+\s*/g);
    wordsWithWhitespace?.forEach((word: string, index: number) => {
      const before = word.match(/\s(?=[^,]*\S*)/g);
      const cleared = word.match(/\S+/g);
      const after = word.match(/[^\S]\s*$/g);
      words.push(
        {
          id: startIndex + index,
          before: before ? before[0] : '',
          clickable: cleared ? cleared[0] : '',
          after: after ? after[0] : '',
          clicked: false
        }
      );
    });
    return words;
  }

  static findNodes(childList: Node[] | NodeListOf<ChildNode>): Node[] {
    const nodes: Node[] = [];
    childList.forEach((node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
        nodes.push(node);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length) {
          nodes.push(...ClickableDirective.findNodes(node.childNodes));
        } else if (!nodes.includes(node)) {
          nodes.push(node);
        }
      }
    });
    return nodes;
  }
}
