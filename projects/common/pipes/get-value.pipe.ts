import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { InputElementValue } from 'common/models/input-element-interfaces';

@Pipe({
  name: 'getValue',
  standalone: false
})
export class GetValuePipe implements PipeTransform {
  /**
   * The text to show for an element's value: what the form control holds where there is a form, and the
   * model's own value where there is none -- the editor renders elements without one. `null` and
   * `undefined` become the empty string, so nothing prints the word "null".
   */
  transform(
    elementModelValue: InputElementValue, elementFormControlValue: InputElementValue, parentForm: UntypedFormGroup
  ): string {
    const value = parentForm ? elementFormControlValue : elementModelValue;
    return (value === null || value === undefined) ? '' : value as string;
  }
}
