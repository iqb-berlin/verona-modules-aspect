import { Component } from '@angular/core';
import { TextFieldElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
      <input *ngIf="elementModel.multiline === false" matInput
             placeholder="{{elementModel.placeholder}}"
             [formControl]="formElementControl">
      <textarea *ngIf="elementModel.multiline === true" matInput
                placeholder="{{elementModel.placeholder}}"
                [formControl]="formElementControl"
                [style.width.px]="elementModel.width"
                [style.height.px]="elementModel.height"
                [style.background-color]="elementModel.backgroundColor"
                [style.color]="elementModel.fontColor"
                [style.font-family]="elementModel.font"
                [style.font-size.px]="elementModel.fontSize"
                [style.font-weight]="elementModel.bold ? 'bold' : ''"
                [style.font-style]="elementModel.italic ? 'italic' : ''"
                [style.text-decoration]="elementModel.underline ? 'underline' : ''">
    </textarea>
  `
})
export class TextFieldComponent extends FormElementComponent {
  elementModel!: TextFieldElement;
}
