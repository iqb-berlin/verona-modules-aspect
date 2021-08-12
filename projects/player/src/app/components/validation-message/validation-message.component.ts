import { Component, Input, OnInit } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  CheckboxElement,
  InputUIElement, NumberFieldElement, TextFieldElement, UnitUIElement
} from '../../../../../common/unit';
import { FormService } from '../../../../../common/form.service';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css']
})

export class ValidationMessageComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @Input() parentForm!: FormGroup;
  formElementControl!: FormControl;
  requiredMessage!: string;
  requiredTrueMessage!: string;
  minLengthMessage!: string;
  maxLengthMessage!: string;
  minMessage!: string;
  maxMessage!: string;

  constructor(private formService: FormService, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.formElementControl = this.parentForm.controls[this.elementModel.id] as FormControl;
    this.setErrorMessages();
    this.formService.setValidators({
      id: this.elementModel.id,
      validators: this.validators,
      formGroup: this.parentForm
    });
  }

  private get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      if (this.elementModel.type === 'checkbox') {
        validators.push(Validators.requiredTrue);
      } else {
        validators.push(Validators.required);
      }
    }
    if (this.elementModel.min) {
      if (this.elementModel.type === 'number-field') {
        validators.push(Validators.min(<number> this.elementModel.min));
      } else {
        validators.push(Validators.minLength(<number> this.elementModel.min));
      }
    }
    if (this.elementModel.max) {
      if (this.elementModel.type === 'number-field') {
        validators.push(Validators.max(<number> this.elementModel.max));
      } else {
        validators.push(Validators.maxLength(<number> this.elementModel.max));
      }
    }
    return validators;
  }

  private setErrorMessages() {
    this.requiredMessage = (this.elementModel as InputUIElement).requiredWarnMessage ||
      this.translateService.instant('validators.inputRequired');

    this.requiredTrueMessage = (this.elementModel as CheckboxElement).requiredWarnMessage ||
      this.translateService.instant('validators.inputRequiredTrue');

    this.minLengthMessage = (this.elementModel as TextFieldElement).minWarnMessage ||
      this.translateService.instant('validators.inputTooShort');

    this.maxLengthMessage = (this.elementModel as TextFieldElement).maxWarnMessage ||
      this.translateService.instant('validators.inputTooLong');

    this.minMessage = (this.elementModel as NumberFieldElement).minWarnMessage ||
      this.translateService.instant('validators.valueTooSmall');

    this.maxMessage = (this.elementModel as NumberFieldElement).maxWarnMessage ||
      this.translateService.instant('validators.valueTooBig');
  }
}
