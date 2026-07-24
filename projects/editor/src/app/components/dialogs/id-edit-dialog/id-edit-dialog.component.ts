import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {
  AbstractControl, FormControl, FormsModule,
  ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-id-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormField,
    MatLabel,
    TranslateModule,
    MatInput,
    MatButton,
    MatError,
    FormsModule,
    ReactiveFormsModule
  ],
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
