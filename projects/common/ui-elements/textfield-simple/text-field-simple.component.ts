import { Component, Input } from '@angular/core';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { TextFieldSimpleElement } from './text-field-simple-element';

@Component({
  selector: 'app-text-field-simple',
  template: `
    <input type="text" form="parentForm"
           [style.width.px]="elementModel.width"
           [style.height.px]="elementModel.height"
           value="{{elementModel.value}}"
           (input)="setFormValue($any($event.target).value)">
  `
})
export class TextFieldSimpleComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldSimpleElement;
}
