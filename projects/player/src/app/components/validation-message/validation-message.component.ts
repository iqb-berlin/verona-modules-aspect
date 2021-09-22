import { Component, Input, OnInit } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  CheckboxElement,
  InputUIElement, TextFieldElement, UnitUIElement
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
  minLengthWarnMessage!: string;
  maxLengthWarnMessage!: string;
  patternMessage!: string;

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
    if (this.elementModel.minLength) {
      validators.push(Validators.minLength(<number> this.elementModel.minLength));
    }
    if (this.elementModel.maxLength) {
      validators.push(Validators.maxLength(<number> this.elementModel.maxLength));
    }
    if (this.elementModel.pattern) {
      validators.push(Validators.pattern(<string> this.elementModel.pattern));
    }
    return validators;
  }

  private setErrorMessages() {
    this.requiredMessage = (this.elementModel as InputUIElement).requiredWarnMessage ||
      this.translateService.instant('validators.inputRequired');

    this.requiredTrueMessage = (this.elementModel as CheckboxElement).requiredWarnMessage ||
      this.translateService.instant('validators.inputRequiredTrue');

    this.minLengthWarnMessage = (this.elementModel as TextFieldElement).minWarnMessage ||
      this.translateService.instant('validators.inputTooShort');

    this.maxLengthWarnMessage = (this.elementModel as TextFieldElement).maxWarnMessage ||
      this.translateService.instant('validators.inputTooLong');

    this.patternMessage = (this.elementModel as TextFieldElement).patternWarnMessage ||
      this.translateService.instant('validators.wrongPattern');
  }
}
