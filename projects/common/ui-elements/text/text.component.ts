import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { TextElement } from './text-element';
import { ValueChangeElement } from '../../models/uI-element';

@Component({
  selector: 'aspect-text',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <aspect-marking-bar
          *ngIf="elementModel.highlightableYellow ||
              elementModel.highlightableTurquoise ||
              elementModel.highlightableOrange"
          [elementModel]="elementModel"
          (selectionChanged)="onSelectionChanged($event)">
      </aspect-marking-bar>
      <div #textContainerRef class="text-container"
           [class.orange-selection]="selectedColor === 'orange'"
           [class.yellow-selection]="selectedColor === 'yellow'"
           [class.turquoise-selection]="selectedColor === 'turquoise'"
           [class.delete-selection]="selectedColor === 'delete'"
           [style.background-color]="elementModel.surfaceProps.backgroundColor"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.font-size.px]="elementModel.fontProps.fontSize"
           [style.line-height.%]="elementModel.fontProps.lineHeight"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           [innerHTML]="elementModel.text | safeResourceHTML"
           (touchstart)="emitStartSelection($event)"
           (mousedown)="emitStartSelection($event)">
      </div>
    </div>
  `,
  styles: [
    '::ng-deep .yellow-selection ::selection {background-color: #f9f871}',
    '::ng-deep .turquoise-selection ::selection {background-color: #9de8eb}',
    '::ng-deep .orange-selection ::selection {background-color: #ffa06a}',
    '::ng-deep .delete-selection ::selection {background-color: lightgrey}',
    '::ng-deep .text-container p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    '::ng-deep .text-container p:empty::after {content: "\\00A0"}', // render empty p
    '::ng-deep .text-container h1 {font-weight: bold; font-size: 20px;}',
    '::ng-deep .text-container h2 {font-weight: bold; font-size: 18px;}',
    '::ng-deep .text-container h3 {font-weight: bold; font-size: 16px;}',
    '::ng-deep .text-container h4 {font-weight: normal; font-size: 16px;}',
    ':host ::ng-deep mark {color: inherit}',
    'sup, sub {line-height: 0;}'
  ]
})
export class TextComponent extends ElementComponent {
  @Input() elementModel!: TextElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() startSelection = new EventEmitter<MouseEvent | TouchEvent>();
  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    colorName: string | undefined
  }>();

  selectedColor!: string | undefined;

  @ViewChild('textContainerRef') textContainerRef!: ElementRef;

  emitStartSelection(event: TouchEvent | MouseEvent): void {
    if (this.elementModel.highlightableYellow ||
      this.elementModel.highlightableTurquoise ||
      this.elementModel.highlightableOrange) {
      this.startSelection.emit(event);
    }
  }

  onSelectionChanged(selection: {
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    colorName: string | undefined
  }): void {
    this.selectedColor = selection.colorName;
    this.applySelection.emit(selection);
  }
}
