import { Component, Input } from '@angular/core';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-radio-group-images',
  templateUrl: './radio-group-images.component.html',
  styleUrls: ['./radio-group-images.component.scss'],
  standalone: false
})
export class RadioGroupImagesComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupComplexElement;
}
