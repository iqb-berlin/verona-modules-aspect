import { Component, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ButtonElement } from '../models/button-element';

@Component({
  selector: 'app-button',
  template: `
    <div [style.display]="'flex'"
         [style.width.%]="100"
         [style.height.%]="100">
      <button *ngIf="!elementModel.imageSrc" mat-button
              [style.width.%]="100"
              [style.height.%]="100"
              [style.background-color]="elementModel.backgroundColor"
              [style.color]="elementModel.fontColor"
              [style.font-family]="elementModel.font"
              [style.font-size.px]="elementModel.fontSize"
              [style.font-weight]="elementModel.bold ? 'bold' : ''"
              [style.font-style]="elementModel.italic ? 'italic' : ''"
              [style.text-decoration]="elementModel.underline ? 'underline' : ''"
              [style.border-radius.px]="elementModel.borderRadius"
              (click)="onClick($event, elementModel.action)">
        {{elementModel.label}}
      </button>
      <input *ngIf="elementModel.imageSrc" type="image"
             [src]="elementModel.imageSrc | safeResourceUrl"
             [class]="elementModel.dynamicPositioning? 'dynamic-image' : 'static-image'"
             [alt]="'imageNotFound' | translate"
             (click)="onClick($event, elementModel.action)">
    </div>
  `,
  styles: [
    '.dynamic-image{width: 100%; height: fit-content}',
    '.static-image{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class ButtonComponent extends ElementComponent {
  @Input() elementModel!: ButtonElement;
  @Output() navigationRequested = new EventEmitter<'previous' | 'next' | 'first' | 'last' | 'end'>();

  onClick = (event: MouseEvent, action: 'previous' | 'next' | 'first' | 'last' | 'end' | null): void => {
    if (action) {
      this.navigationRequested.emit(action);
    }
    event.stopPropagation();
    event.preventDefault();
  };
}
