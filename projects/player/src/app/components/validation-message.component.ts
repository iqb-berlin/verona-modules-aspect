import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputUIElement, UnitUIElement } from '../../../../common/unit';

@Component({
  selector: 'app-error-message',
  template: `
      <mat-error *ngIf="formElementControl && formElementControl.touched && formElementControl.errors">
          {{requiredMessage}}
      </mat-error>
  `
})

export class ValidationMessageComponent implements OnInit {
  elementModel!: UnitUIElement;
  parentForm!: FormGroup;
  formElementControl!: FormControl;

  ngOnInit(): void {
    this.formElementControl = this.parentForm.controls[this.elementModel.id] as FormControl;
  }

  // eslint-disable-next-line class-methods-use-this
  get requiredMessage(): string {
    return (this.elementModel as InputUIElement).validationWarnMessage || 'Wert muss angegeben werden';
  }
}
