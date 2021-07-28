import { Component, OnInit } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import {
  InputUIElement, NumberFieldElement, TextFieldElement, UnitUIElement
} from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-error-message',
  template: `
      <ng-container *ngIf="formElementControl && formElementControl.touched">
          <mat-error *ngIf="formElementControl.errors?.required">
              {{requiredMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.minlength">
              {{minLengthMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.maxlength">
              {{maxLengthMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.min">
              {{minMessage}}
          </mat-error>
          <mat-error *ngIf="formElementControl.errors?.max">
              {{maxMessage}}
          </mat-error>
      </ng-container>
  `
})

export class ValidationMessageComponent implements OnInit {
  elementModel!: UnitUIElement;
  parentForm!: FormGroup;
  formElementControl!: FormControl;

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.formElementControl = this.parentForm.controls[this.elementModel.id] as FormControl;
    this.formService.setValidators({
      id: this.elementModel.id,
      validators: this.validators,
      formGroup: this.parentForm
    });
  }

  private get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.required);
    }
    if (this.elementModel.min) {
      if (this.elementModel.type === 'number_field') {
        validators.push(Validators.min(<number> this.elementModel.min));
      } else {
        validators.push(Validators.minLength(<number> this.elementModel.min));
      }
    }
    if (this.elementModel.max) {
      if (this.elementModel.type === 'number_field') {
        validators.push(Validators.max(<number> this.elementModel.max));
      } else {
        validators.push(Validators.maxLength(<number> this.elementModel.maxLength));
      }
    }
    return validators;
  }

  get requiredMessage(): string {
    return (this.elementModel as InputUIElement).requiredWarnMessage || 'Eingabe erforderlich';
  }

  get minLengthMessage(): string {
    return (this.elementModel as TextFieldElement).minWarnMessage || 'Eingabe zu kurz';
  }

  get maxLengthMessage(): string {
    return (this.elementModel as TextFieldElement).maxWarnMessage || 'Eingabe zu lang';
  }

  get minMessage(): string {
    return (this.elementModel as NumberFieldElement).minWarnMessage || 'Wert zu klein';
  }

  get maxMessage(): string {
    return (this.elementModel as NumberFieldElement).maxWarnMessage || 'Wert zu groß';
  }
}
