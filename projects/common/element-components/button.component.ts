import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ButtonElement } from '../unit';

@Component({
  selector: 'app-button',
  template: `
    <button mat-button
            [style.width.%]="100"
            [style.height.%]="100"
            [style.background-color]="elementModel.backgroundColor"
            [style.color]="elementModel.fontColor"
            [style.font-family]="elementModel.font"
            [style.font-size.px]="elementModel.fontSize"
            [style.font-weight]="elementModel.bold ? 'bold' : ''"
            [style.font-style]="elementModel.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      {{elementModel.label}}
    </button>
  `
})
export class ButtonComponent extends ElementComponent {
  elementModel!: ButtonElement;
}
