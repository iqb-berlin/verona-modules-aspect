import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { TextElement } from './text-element';
import { ValueChangeElement } from '../../models/uI-element';

@Component({
  selector: 'app-text',
  template: `
    <div [style.width.%]="100"
         [style.height]="'auto'">
      <div *ngIf="elementModel.interaction !== 'none'"
           class="marking-bar">
        <ng-container *ngIf="elementModel.interaction === 'highlightable'">
          <button type="button"
                  class="marking-button"
                  mat-mini-fab [style.background-color]="'yellow'"
                  (click)="applySelection.emit({ mode: 'mark', color:'yellow', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
          <button type="button"
                  class="marking-button"
                  mat-mini-fab [style.background-color]="'turquoise'"
                  (click)="applySelection.emit({ mode: 'mark', color: 'turquoise', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
          <button type="button"
                  class="marking-button"
                  mat-mini-fab [style.background-color]="'orange'"
                  (click)="applySelection.emit({ mode: 'mark', color: 'orange', element: container })">
            <mat-icon>border_color</mat-icon>
          </button>
        </ng-container>
        <ng-container *ngIf="elementModel.interaction === 'underlinable'">
          <button type="button"
                  class="marking-button"
                  mat-mini-fab [style.background-color]="'white'"
                  (click)="applySelection.emit({ mode: 'underline', color: 'black', element: container })">
            <mat-icon>format_underlined</mat-icon>
          </button>
        </ng-container>
        <button type="button"
                class="marking-button" [style.background-color]="'lightgrey'" mat-mini-fab
                (click)="applySelection.emit({ mode: 'delete', color: 'none', element: container })">
          <mat-icon>clear</mat-icon>
        </button>
      </div>
      <div #container class="text-container"
           (mousedown)="startSelection.emit($event)"
           [style.background-color]="elementModel.surfaceProps.backgroundColor"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.line-height.%]="elementModel.fontProps.lineHeight"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           [innerHTML]="elementModel.text | safeResourceHTML">
      </div>
    </div>
  `,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 15px;}',
    '.marking-button {color: #333; margin-right: 5px;}',
    '::ng-deep .text-container p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    '::ng-deep .text-container p:empty::after {content: "\\00A0"}', // render empty p
    '::ng-deep .text-container h1 {font-weight: bold; font-size: 20px;}',
    '::ng-deep .text-container h2 {font-weight: bold; font-size: 18px;}',
    '::ng-deep .text-container h3 {font-weight: bold; font-size: 16px;}',
    '::ng-deep .text-container h4 {font-weight: normal; font-size: 16px;}',
    'mark {color: inherit}'
  ]
})
export class TextComponent extends ElementComponent {
  @Input() elementModel!: TextElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() startSelection = new EventEmitter<MouseEvent>();
  @Output() applySelection = new EventEmitter <{
    mode: 'mark' | 'underline' | 'delete',
    color: string,
    element: HTMLElement
  }>();

  @ViewChild('container') containerDiv!: ElementRef;
}
