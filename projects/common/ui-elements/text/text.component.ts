import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { TextElement } from './text-element';
import { ValueChangeElement } from '../../models/uI-element';

@Component({
  selector: 'app-text',
  template: `
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : 'auto'">
      <app-marking-bar
          *ngIf="elementModel.highlightableYellow ||
           elementModel.highlightableTurquoise ||
           elementModel.highlightableOrange"
          [elementModel]="elementModel"
          (applySelection)="applySelection.emit($event)">
      </app-marking-bar>
      <div #textContainerRef class="text-container"
           [style.background-color]="elementModel.surfaceProps.backgroundColor"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.font-size.px]="elementModel.fontProps.fontSize"
           [style.line-height.%]="elementModel.fontProps.lineHeight"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           (mousedown)="startSelection.emit($event)"
           [innerHTML]="elementModel.text | safeResourceHTML">
      </div>
    </div>
  `,
  styles: [
    '::ng-deep .text-container p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    '::ng-deep .text-container p:empty::after {content: "\\00A0"}', // render empty p
    '::ng-deep .text-container h1 {font-weight: bold; font-size: 20px;}',
    '::ng-deep .text-container h2 {font-weight: bold; font-size: 18px;}',
    '::ng-deep .text-container h3 {font-weight: bold; font-size: 16px;}',
    '::ng-deep .text-container h4 {font-weight: normal; font-size: 16px;}',
    ':host ::ng-deep mark {color: inherit}'
  ]
})
export class TextComponent extends ElementComponent {
  @Input() elementModel!: TextElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() startSelection = new EventEmitter<MouseEvent>();
  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string
  }>();

  @ViewChild('textContainerRef') textContainerRef!: ElementRef;
}
