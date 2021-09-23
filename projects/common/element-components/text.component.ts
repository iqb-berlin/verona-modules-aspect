import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TextElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-text',
  template: `
    <div>
      <div *ngIf="elementModel.highlightable">
        <button mat-button [style.background-color]="'yellow'"
                (click)="highlightSelection('yellow')">Gelb</button>
        <button mat-button [style.background-color]="'turquoise'"
                (click)="highlightSelection('turquoise')">Türkis</button>
        <button mat-button (click)="clearHighlight()">X</button>
      </div>
      <div [style.background-color]="elementModel.backgroundColor"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-size.px]="elementModel.fontSize"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
           [style.white-space]="'pre-wrap'"
           [innerHTML]="sanitizer.bypassSecurityTrustHtml(elementModel.text)"
           #container>
      </div>
    </div>
  `
})
export class TextComponent extends ElementComponent {
  elementModel!: TextElement;
  @ViewChild('container') containerDiv!: ElementRef;

  highlightedNodes: Node[] = [];

  constructor(public sanitizer: DomSanitizer) {
    super();
  }

  // TODO double click selection does not work and adds more and more nested spans
  highlightSelection(color: string): void {
    const selection = window.getSelection();
    if (selection) {
      this.clearHighlight(selection.anchorNode?.parentElement as HTMLElement);

      const newNode = document.createElement('SPAN');
      newNode.classList.add('markedText');
      newNode.style.backgroundColor = color;
      this.highlightedNodes.push(newNode as Node);
      const range = selection.getRangeAt(0);
      range.surroundContents(newNode);
    } else {
      console.warn('No selection to highlight');
    }
  }

  clearHighlight(container: HTMLElement = this.containerDiv.nativeElement): void {
    (Array.from(container.children) as HTMLElement[]).forEach((child: HTMLElement) => {
      if (child.classList.contains('markedText')) {
        container.replaceChild(document.createTextNode(child.innerHTML), child);
      }
    });
  }
}
