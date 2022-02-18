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
            [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
            [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
            [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
            [style.background-color]="elementModel.styles.backgroundColor"
            [style.color]="elementModel.styles.fontColor"
            [style.font-family]="elementModel.styles.font"
            [style.font-size.px]="elementModel.styles.fontSize"
            [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
            [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
            [style.border-radius.px]="elementModel.styles.borderRadius"
            (click)="elementModel.action ? navigationRequested.emit(elementModel.action) : false">
      {{elementModel.label}}
    </button>
    <input *ngIf="elementModel.imageSrc" type="image"
           [src]="elementModel.imageSrc | safeResourceUrl"
           [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
           [class.fixed-size-dynamic-image]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
           [class]="elementModel.positionProps.dynamicPositioning ? 'dynamic-image' : 'static-image'"
           [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : null"
           [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : null"
           [alt]="'imageNotFound' | translate"
           (click)="elementModel.action ? navigationRequested.emit(elementModel.action) : false">
  `,
  styles: [
    '.dynamic-image {width: 100%; height: fit-content;}',
    '.static-image {max-width: 100%; max-height: 100%; display: grid;}', // grid: to prevent scrollbars
    '.fixed-size-dynamic-image {position: relative; object-fit: scale-down;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigationRequested = new EventEmitter<'previous' | 'next' | 'first' | 'last' | 'end'>();
}
