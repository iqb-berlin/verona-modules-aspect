import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';

export function hotspotImageRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => (
    (control.value as Hotspot[]).some(hotspot => hotspot.value) ? null : { required: true }
  );
}
