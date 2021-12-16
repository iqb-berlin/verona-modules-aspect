import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { ButtonElement } from './button-element';

@Component({
  selector: 'app-button',
  template: `
    <button *ngIf="!elementModel.imageSrc" mat-button
            type='button'
            [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize"
            [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
            [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
            [style.background-color]="elementModel.surfaceProps.backgroundColor"
            [style.color]="elementModel.fontProps.fontColor"
            [style.font-family]="elementModel.fontProps.font"
            [style.font-size.px]="elementModel.fontProps.fontSize"
            [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
            [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
            [style.border-radius.px]="elementModel.borderRadius"
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
    '.center-content {display: block; margin: auto; top: 50%; transform: translateY(-50%);}',
    '.fixed-size-dynamic-image {position: relative; object-fit: scale-down;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigationRequested = new EventEmitter<'previous' | 'next' | 'first' | 'last' | 'end'>();
}
