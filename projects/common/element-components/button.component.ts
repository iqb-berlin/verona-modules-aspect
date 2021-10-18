import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ButtonElement } from '../models/button-element';

@Component({
  selector: 'app-button',
  template: `
    <div [style.display]="'flex'"
         [style.width.%]="100"
         [style.height.%]="100">
      <button *ngIf="!elementModel.imageSrc" mat-button
              (click)="onClick($event)"
              [style.width.%]="100"
              [style.height.%]="100"
              [style.background-color]="elementModel.backgroundColor"
              [style.color]="elementModel.fontColor"
              [style.font-family]="elementModel.font"
              [style.font-size.px]="elementModel.fontSize"
              [style.font-weight]="elementModel.bold ? 'bold' : ''"
              [style.font-style]="elementModel.italic ? 'italic' : ''"
              [style.text-decoration]="elementModel.underline ? 'underline' : ''"
              [style.border-radius.px]="elementModel.borderRadius">
        {{elementModel.label}}
      </button>
      <input *ngIf="elementModel.imageSrc" type="image"
             (click)="onClick($event)"
             [src]="elementModel.imageSrc | safeResourceUrl"
             [class]="elementModel.dynamicPositioning? 'dynamic-image' : 'static-image'"
             [alt]="'imageNotFound' | translate">
    </div>
  `,
  styles: [
    '.dynamic-image{width: 100%; height: fit-content}',
    '.static-image{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class ButtonComponent extends ElementComponent {
  elementModel!: ButtonElement;

  onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
  };
}
