import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { ButtonElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-button',
  template: `
    <button *ngIf="!elementModel.imageSrc" mat-button
            type='button'
            [style.width.%]="100"
            [style.height.%]="100"
            [style.background-color]="elementModel.styles.backgroundColor"
            [style.color]="elementModel.styles.fontColor"
            [style.font-family]="elementModel.styles.font"
            [style.font-size.px]="elementModel.styles.fontSize"
            [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
            [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
            [style.border-radius.px]="elementModel.styles.borderRadius"
            (click)="elementModel.action && elementModel.actionParam !== null ?
               navigateTo.emit({
                  action: elementModel.action,
                  param: elementModel.actionParam
               }) :
               false">
      {{elementModel.label}}
    </button>
    <input
        *ngIf="elementModel.imageSrc" type="image"
        [src]="elementModel.imageSrc | safeResourceUrl"
        [class]="elementModel.positionProps.dynamicPositioning &&
                    !elementModel.positionProps.fixedSize ? 'dynamic-image' : 'static-image'"
        [alt]="'imageNotFound' | translate"
        (click)="elementModel.action && elementModel.actionParam !== null?
           navigateTo.emit({
              action: elementModel.action,
              param: elementModel.actionParam
           }) :
           false">
  `,
  styles: [
    '.dynamic-image {width: 100%; height: fit-content;}',
    '.static-image {max-width: 100%; max-height: 100%; display: grid;}', // grid: to prevent scrollbars
    '.fill-container {width: 100%; height: 100%;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigateTo = new EventEmitter<{
    action: 'unitNav' | 'pageNav';
    param: 'previous' | 'next' | 'first' | 'last' | 'end' | number
  }>();
}
