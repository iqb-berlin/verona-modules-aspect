import { Component } from '@angular/core';
import { TextAreaElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-text-area',
  template: `
    <mat-form-field [style.width.%]="100"
                    [style.height.%]="100"
                    [style.background-color]="elementModel.backgroundColor"
                    [style.color]="elementModel.fontColor"
                    [style.font-family]="elementModel.font"
                    [style.font-size.px]="elementModel.fontSize"
                    [style.font-weight]="elementModel.bold ? 'bold' : ''"
                    [style.font-style]="elementModel.italic ? 'italic' : ''"
                    [style.text-decoration]="elementModel.underline ? 'underline' : ''">
    <textarea matInput [formControl]="elementFormControl"
              placeholder="{{elementModel.label}}"
              [style.resize]="elementModel.resizeEnabled ? 'both' : 'none'">
      </textarea>
    </mat-form-field>
  `
})
export class TextAreaComponent extends FormElementComponent {
  elementModel!: TextAreaElement;
}
