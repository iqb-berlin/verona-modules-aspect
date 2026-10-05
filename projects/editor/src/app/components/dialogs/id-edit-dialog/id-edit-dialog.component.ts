import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AbstractControl, FormControl,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { VariableAlias } from 'common/utils/variable-alias';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-id-edit-dialog',
  standalone: false,
  templateUrl: './id-edit-dialog.component.html'
})
export class IDEditDialogComponent {
  readonly aliasControl = new FormControl(this.data.alias, [Validators.required, this.checkAlias()]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { alias: string },
              private idService: IDService) { }

  /**
   * The rule the element applies when the dialog's result is written, asked while typing. Only whether the name was
   * taken was checked here, so a name with a forbidden character passed the dialog and was refused after it had
   * closed (#1523). The error carries the translation key of the reason.
   */
  checkAlias(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === this.data.alias) return null;
      const problem = VariableAlias.problemOf(
        control.value, this.idService.isAliasAvailable(control.value, this.data.alias)
      );
      return problem ? { alias: VariableAlias.PROBLEM_KEYS[problem] } : null;
    };
  }
}
