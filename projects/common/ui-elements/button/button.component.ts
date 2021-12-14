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
           [class]="elementModel.positionProps.dynamicPositioning ? 'dynamic-image' : 'static-image'"
           [alt]="'imageNotFound' | translate"
           (click)="elementModel.action ? navigationRequested.emit(elementModel.action) : false">
  `,
  styles: [
    '.dynamic-image {width: 100%; height: fit-content}',
    '.static-image {width: 100%; height: 100%; object-fit: contain}',
    '.center-content {position: absolute; top: 0; bottom: 0; left: 0;right: 0; margin: auto;}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigationRequested = new EventEmitter<'previous' | 'next' | 'first' | 'last' | 'end'>();
}
