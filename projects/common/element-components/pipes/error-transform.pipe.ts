import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UIElement } from '../../models/uI-element';

@Pipe({
  name: 'errorTransform'
})
export class ErrorTransformPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(validationErrors: ValidationErrors, elementModel: UIElement): string {
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

  private getValidationMessages(elementModel: UIElement): Record<string, string> {
    return {
      required: elementModel.requiredWarnMessage ||
        this.translateService.instant('validators.inputRequired'),
      requiredTrue: elementModel.requiredWarnMessage ||
        this.translateService.instant('validators.inputRequiredTrue'),
      minlength: elementModel.minWarnMessage ||
        this.translateService.instant('validators.inputTooShort'),
      maxlength: elementModel.maxWarnMessage ||
        this.translateService.instant('validators.inputTooLong'),
      pattern: elementModel.patternWarnMessage ||
        this.translateService.instant('validators.wrongPattern')
    };
  }
}
