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
import { IDService } from '../../services/id.service';

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
  template: `
    <mat-dialog-content>
        <h2 mat-dialog-title>ID ändern</h2>
        <mat-form-field class="example-full-width">
          <mat-label>{{'propertiesPanel.id' | translate }}</mat-label>
          <input matInput required [formControl]="aliasControl"
                 (keyup)="checkAvailability()">
          @if (aliasControl.invalid) {
            <mat-error>
              @if (aliasControl.hasError('idTaken')) {
                <span>ID bereits vergeben</span>
              } @else {
                <span>Eingabe ungültig</span>
              }
            </mat-error>
          }
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [disabled]="aliasControl.invalid" [mat-dialog-close]="aliasControl.value">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    `
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
