import { Component, Input } from '@angular/core';
import { RadioButtonGroupElement } from 'common/models/elements/radio-button-group';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { RichTextStart } from 'common/utils/rich-text-start';

@Component({
  selector: 'aspect-radio-button-group',
  templateUrl: './radio-button-group.component.html',
  styleUrls: ['./radio-button-group.component.scss'],
  standalone: false
})
export class RadioButtonGroupComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;

  static override startsWithText(element: RadioButtonGroupElement): boolean {
    return RichTextStart.isText(element.label);
  }
}
