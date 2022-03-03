import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldSimpleElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-field-simple',
  template: `
    <input type="text" form="parentForm"
           autocomplete="off"
           autocapitalize="none"
           autocorrect="off"
           spellcheck="false"
           [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           [style.line-height.px]="elementModel.styling.fontSize"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
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
