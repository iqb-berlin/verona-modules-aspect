import { Component, Input } from '@angular/core';
import { RadioButtonGroupElement } from 'common/models/elements/input-group-elements/radio-button-group';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-radio-button-group',
  templateUrl: './radio-button-group.component.html',
  styleUrls: ['./radio-button-group.component.scss'],
  standalone: false
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
}
