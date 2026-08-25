import { Component, Input } from '@angular/core';
import { SliderElement } from 'common/models/elements/slider';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  standalone: false
})
export class SliderComponent extends FormElementComponent {
  @Input() elementModel!: SliderElement;
}
