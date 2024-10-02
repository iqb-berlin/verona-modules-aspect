import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarkClickableService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  transformToClickable(clicks: string[], color: string, text: string): string {
    const temp = this.renderer.createElement('aspect-temp-clickable-container');
    temp.innerHTML = text;
    const textNodes = MarkClickableService.findNodes(temp.childNodes);
    let wordIndex = 0;
    textNodes.forEach((node: Node) => {
      const wordsWithWhitespace = node.textContent?.match(/\s*\S+\s*/g);
      const clickableContainer = this.renderer.createElement('aspect-clickable-container');
      wordsWithWhitespace?.forEach((word: string) => {
        const before = word.match(/\s(?=[^,]*\S)/g);
        const cleared = word.match(/\S+/g);
        const after = word.match(/[^\S]\s*$/g);

        if (before) {
          const notClickableBefore = this.renderer.createElement('aspect-not-clickable');
          const beforeText = this.renderer.createText(before[0]);
          notClickableBefore.appendChild(beforeText);
          clickableContainer.appendChild(notClickableBefore);
        }
        if (cleared) {
          const clickable = this.renderer.createElement('aspect-clickable');
          const clearedText = this.renderer.createText(cleared[0]);
          clickable.appendChild(clearedText);
          clickableContainer.appendChild(clickable);
          if (clicks && clicks[wordIndex] === color) {
            clickable.style.backgroundColor = color;
          } else {
            clickable.style.backgroundColor = 'transparent';
          }
          wordIndex += 1;
        }
        if (after) {
          const notClickableAfter = this.renderer.createElement('aspect-not-clickable');
          const afterText = this.renderer.createText(after[0]);
          notClickableAfter.appendChild(afterText);
          clickableContainer.appendChild(notClickableAfter);
        }
      });
      node.parentNode?.replaceChild(clickableContainer, node);
    });
    return temp.innerHTML;
  }

  getClickedWords(text: string): string[] {
    const temp = this.renderer.createElement('aspect-temp-clickable-container');
    temp.innerHTML = text;
    const clickableWords = temp.querySelectorAll('aspect-clickable');
    return (Array.from(clickableWords) as HTMLElement[]).map(word => word.style.backgroundColor);
  }

  private static findNodes(childList: Node[] | NodeListOf<ChildNode>): Node[] {
    const nodes: Node[] = [];
    childList.forEach((node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && !nodes.includes(node)) {
        nodes.push(node);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length) {
          nodes.push(...MarkClickableService.findNodes(node.childNodes));
        } else if (!nodes.includes(node)) {
          nodes.push(node);
        }
      }
    });
    return nodes;
  }
}
