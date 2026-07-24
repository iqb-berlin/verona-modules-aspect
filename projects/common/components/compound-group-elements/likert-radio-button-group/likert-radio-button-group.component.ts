import { Component, Input } from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';

@Component({
  selector: 'aspect-likert-radio-button-group',
  templateUrl: './likert-radio-button-group.component.html',
  styleUrls: ['./likert-radio-button-group.component.scss'],
  standalone: false
})
export class LikertRadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: LikertRowElement;
  @Input() firstColumnSizeRatio!: number;
}
