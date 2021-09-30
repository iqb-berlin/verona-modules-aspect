import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  CheckboxElement, InputUIElement, TextFieldElement, UnitUIElement
} from '../../unit';

@Pipe({
  name: 'errorTransform'
})
export class ErrorTransformPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(validationErrors: ValidationErrors, elementModel: UnitUIElement): string {
    const validationMessages = this.getValidationMessages(elementModel);
    let returnMessage = '';

    Object.keys(validationErrors).forEach(errorKey => {
      if (returnMessage) {
        returnMessage += '; ';
      }
      const messageKey = errorKey === 'required' && elementModel.type === 'checkbox' ? 'requiredTrue' : errorKey;
      returnMessage += validationMessages[messageKey];
    });
    return returnMessage;
  }

  private getValidationMessages(elementModel: UnitUIElement): Record<string, string> {
    return {
      required: (elementModel as InputUIElement).requiredWarnMessage ||
        this.translateService.instant('validators.inputRequired'),

      requiredTrue: (elementModel as CheckboxElement).requiredWarnMessage ||
        this.translateService.instant('validators.inputRequiredTrue'),

      minlength: (elementModel as TextFieldElement).minWarnMessage ||
        this.translateService.instant('validators.inputTooShort'),

      maxlength: (elementModel as TextFieldElement).maxWarnMessage ||
        this.translateService.instant('validators.inputTooLong'),

      pattern: (elementModel as TextFieldElement).patternWarnMessage ||
        this.translateService.instant('validators.wrongPattern')
    };
  }
}
