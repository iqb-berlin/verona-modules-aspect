import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldSimpleElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-field-simple',
  template: `
    <input type="text" form="parentForm"
           [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           [style.line-height.px]="elementModel.styles.fontSize"
           [style.color]="elementModel.styles.fontColor"
           [style.font-family]="elementModel.styles.font"
           [style.font-size.px]="elementModel.styles.fontSize"
           [style.font-weight]="elementModel.styles.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styles.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styles.underline ? 'underline' : ''"
           [readonly]="elementModel.readOnly"
           [formControl]="elementFormControl"
           [value]="elementModel.value">
  `,
  styles: [
    'input {border: 1px solid rgba(0,0,0,.12); border-radius: 5px}'
  ]
})
export class TextFieldSimpleComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldSimpleElement;
}
