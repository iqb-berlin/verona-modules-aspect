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
              (focusin)="onFocusin.emit()"
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
      <input *ngIf="elementModel.imageSrc" type="image" [src]="elementModel.imageSrc"
             [style.width.%]="100"
             [style.height.%]="100"
             [style.object-fit]="'contain'" alt="Bild nicht gefunden">
    </div>
  `
})
export class ButtonComponent extends ElementComponent {
  @Output() onFocusin = new EventEmitter();
  elementModel!: ButtonElement;
}
