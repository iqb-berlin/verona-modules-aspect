import { Component, Input } from '@angular/core';
import { RadioButtonGroupComplexElement } from 'common/models/elements/radio-button-group-complex';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { RichTextStart } from 'common/utils/rich-text-start';

@Component({
  selector: 'aspect-radio-group-images',
  templateUrl: './radio-group-images.component.html',
  styleUrls: ['./radio-group-images.component.scss'],
  standalone: false
})
export class RadioGroupImagesComponent extends FormElementComponent {
  @Input() elementModel!: RadioButtonGroupComplexElement;

  static override startsWithText(element: RadioButtonGroupComplexElement): boolean {
    return RichTextStart.isText(element.label);
  }
}
