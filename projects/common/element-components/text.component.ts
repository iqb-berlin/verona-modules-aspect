import {
  Component, ElementRef, EventEmitter, Output, ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TextElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-text',
  template: `
    <div [style.width.%]="100"
         [style.height]="'auto'">
      <div *ngIf="elementModel.highlightable">
        <button mat-button [style.background-color]="'yellow'"
                (click)="applySelection.emit({color:'yellow', element: container, clear: false})">
          <mat-icon>border_color</mat-icon>
        </button>
        <button mat-button [style.background-color]="'turquoise'"
                (click)="applySelection.emit({color: 'turquoise', element: container, clear: false})">
          <mat-icon>border_color</mat-icon>
        </button>
        <button mat-button [style.background-color]="'orange'"
                (click)="applySelection.emit({color: 'orange', element: container, clear: false})">
          <mat-icon>border_color</mat-icon>
        </button>
        <button mat-button
                (click)="applySelection.emit({color: 'none', element: container, clear: true})">
          <mat-icon>clear</mat-icon>
        </button>
      </div>
      <div [style.background-color]="elementModel.backgroundColor"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
           [innerHTML]="elementModel.text | safeResourceHTML"
           #container>
      </div>
    </div>
  `
})
export class TextComponent extends ElementComponent {
  elementModel!: TextElement;
  @Output()applySelection = new EventEmitter<{ color: string, element: HTMLElement, clear: boolean }>();
  @ViewChild('container') containerDiv!: ElementRef;

  constructor(public sanitizer: DomSanitizer) {
    super();
  }
}
