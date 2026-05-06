import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TextAreaMath } from 'common/models/elements/input-elements/text-area-math';

export function textAreaMathRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as TextAreaMath[];
    if (!value || value.length === 0) {
      return { required: true };
    }
    const hasContent = value.some(segment => segment.value && segment.value.trim().length > 0);
    return hasContent ? null : { required: true };
  };
}
