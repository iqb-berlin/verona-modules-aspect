import { Component } from '@angular/core';
import { TextFieldElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-text-field',
  template: `
    <mat-form-field [style.width.px]="elementModel.width"
                    [style.height.px]="elementModel.height"
                    [style.background-color]="elementModel.backgroundColor"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      <input matInput type="text"
             [formControl]="elementFormControl"
             placeholder="{{elementModel.label}}">
    </mat-form-field>
  `
})
export class TextFieldComponent extends FormElementComponent {
  elementModel!: TextFieldElement;
}
