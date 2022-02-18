import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { TextElement, ValueChangeElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text',
  template: `
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : 'auto'">
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
           [style.background-color]="elementModel.styles.backgroundColor"
           [style.color]="elementModel.styles.fontColor"
           [style.font-family]="elementModel.styles.font"
           [style.font-size.px]="elementModel.styles.fontSize"
           [style.line-height.%]="elementModel.styles.lineHeight"
           [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
           [innerHTML]="elementModel.text | safeResourceHTML"
           (mousedown)="elementModel.highlightableYellow ||
             elementModel.highlightableTurquoise ||
             elementModel.highlightableOrange ? startSelection.emit($event) : null">
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
  @Output() startSelection = new EventEmitter<MouseEvent>();
  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    colorName: string | undefined
  }>();

  selectedColor!: string | undefined;

  @ViewChild('textContainerRef') textContainerRef!: ElementRef;

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
