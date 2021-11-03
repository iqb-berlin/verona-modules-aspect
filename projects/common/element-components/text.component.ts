import {
  Component, ElementRef, EventEmitter, Output, ViewChild
} from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { TextElement } from '../models/text-element';

@Component({
  selector: 'app-text',
  template: `
    <div [style.width.%]="100"
         [style.height]="'auto'">
      <div *ngIf="elementModel.highlightable"
           class="marking-bar">
        <ng-container *ngIf="elementModel.highlightable">
          <button class="marking-button" mat-mini-fab [style.background-color]="'yellow'"
                  (click)="onMarkingButtonClick($event, { mode: 'mark', color:'yellow', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
          <button class="marking-button" mat-mini-fab [style.background-color]="'turquoise'"
                  (click)="onMarkingButtonClick($event, { mode: 'mark', color: 'turquoise', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
          <button class="marking-button" mat-mini-fab [style.background-color]="'orange'"
                  (click)="onMarkingButtonClick($event, { mode: 'mark', color: 'orange', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
        </ng-container>
        <button class="marking-button" [style.background-color]="'lightgrey'" mat-mini-fab
                (click)="onMarkingButtonClick($event, { mode: 'delete', color: 'none', element: container })">
          <mat-icon>clear</mat-icon>
        </button>
      </div>
      <div #container class="text-container"
           (mousedown)="startSelection.emit($event)"
           [style.background-color]="elementModel.backgroundColor"
           [style.color]="elementModel.fontColor"
           [style.font-family]="elementModel.font"
           [style.line-height.%]="elementModel.lineHeight"
           [style.font-weight]="elementModel.bold ? 'bold' : ''"
           [style.font-style]="elementModel.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.underline ? 'underline' : ''"
           [innerHTML]="elementModel.text | safeResourceHTML">
      </div>
    </div>
  `,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 15px}',
    '.marking-button {color: #333}',
    '::ng-deep .text-container p strong {letter-spacing: 0.04em; font-weight: 600}', // bold less bold
    '::ng-deep .text-container p:empty::after {content: "\\00A0"}', // render empty p
    '::ng-deep .text-container h1 {font-weight: bold; font-size: 20px;}',
    '::ng-deep .text-container h2 {font-weight: bold; font-size: 18px;}',
    '::ng-deep .text-container h3 {font-weight: bold; font-size: 16px;}',
    '::ng-deep .text-container h4 {font-weight: normal; font-size: 16px;}'
  ]
})
export class TextComponent extends ElementComponent {
  elementModel!: TextElement;
  @Output() startSelection = new EventEmitter<MouseEvent>();
  @Output() applySelection = new EventEmitter <{
    mode: 'mark' | 'underline' | 'delete',
    color: string,
    element: HTMLElement
  }>();

  @ViewChild('container') containerDiv!: ElementRef;

  onMarkingButtonClick(
    event: MouseEvent, markingValues: {
      mode: 'mark' | 'underline' | 'delete',
      color: string;
      element: HTMLElement;
    }
  ) : void {
    this.applySelection.emit(markingValues);
    event.preventDefault();
    event.stopPropagation();
  }
}
