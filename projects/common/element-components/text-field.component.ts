import { Component, EventEmitter, Output } from '@angular/core';
import { TextFieldElement } from '../unit';
import { FormElementComponent } from '../form-element-component.directive';

@Component({
  selector: 'app-text-field',
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
      <input matInput type="text" [pattern]="elementModel.pattern" #input
             (focus)="onFocus.emit(input)"
             (blur)="onBlur.emit(input)"
             [formControl]="elementFormControl"
             placeholder="{{elementModel.label}}">
    </mat-form-field>
  `
})
export class TextFieldComponent extends FormElementComponent {
  @Output() onFocus = new EventEmitter<HTMLElement>();
  @Output() onBlur = new EventEmitter<HTMLElement>();
  elementModel!: TextFieldElement;
}
