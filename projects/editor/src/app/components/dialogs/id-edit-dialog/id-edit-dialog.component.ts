import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AbstractControl, FormControl,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-id-edit-dialog',
  standalone: false,
  templateUrl: './id-edit-dialog.component.html'
})
export class IDEditDialogComponent {
  readonly aliasControl = new FormControl(this.data.alias, [Validators.required, this.checkAvailability()]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { alias: string },
              private idService: IDService) { }

  checkAvailability(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === this.data.alias) return null;
      const isAvailable = this.idService.isAliasAvailable(control.value);
      return isAvailable ? null : { idTaken: { value: control.value } };
    };
  }
}
