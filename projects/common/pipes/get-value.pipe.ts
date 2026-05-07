import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { InputElementValue } from 'common/interfaces';

@Pipe({
  name: 'getValue',
  standalone: false
})
export class GetValuePipe implements PipeTransform {
  transform(
    elementModelValue: InputElementValue, elementFormControlValue: InputElementValue, parentForm: UntypedFormGroup
  ): string {
    const value = parentForm ? elementFormControlValue : elementModelValue;
    return (value === null || value === undefined) ? '' : value as string;
  }
}
