import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldSimpleElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-field-simple',
  template: `
    <input type="text" form="parentForm"
           [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           [style.line-height.px]="elementModel.fontProps.fontSize"
           [style.color]="elementModel.fontProps.fontColor"
           [style.font-family]="elementModel.fontProps.font"
           [style.font-size.px]="elementModel.fontProps.fontSize"
           [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
           [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
           [formControl]="elementFormControl"
           value="{{elementModel.value}}">
  `,
  styles: [
    'input {border: 1px solid rgba(0,0,0,.12); border-radius: 5px}'
  ]
})
export class TextFieldSimpleComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldSimpleElement;
}
