import { Component, Input } from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { ToggleButtonElement } from 'common/models/elements/toggle-button';
import { RichTextStart } from 'common/utils/rich-text-start';

@Component({
  selector: 'aspect-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
  standalone: false
})
export class ToggleButtonComponent extends FormElementComponent {
  @Input() elementModel!: ToggleButtonElement;

  /** Without options the template holds only an empty line in its middle. */
  static override startsWithText(element: ToggleButtonElement): boolean {
    return element.options.length > 0 && RichTextStart.isText(element.options[0].text);
  }
}
