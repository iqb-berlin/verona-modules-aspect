import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { UIElement } from 'common/models/elements/element';

@Pipe({
  name: 'errorTransform'
})
export class ErrorTransformPipe implements PipeTransform {
  transform(validationErrors: ValidationErrors, elementModel: UIElement): string {
    const validationMessages = ErrorTransformPipe.getValidationMessages(elementModel);
    let returnMessage = '';

    Object.keys(validationErrors).forEach(errorKey => {
      if (returnMessage) {
        returnMessage += '; ';
      }
      returnMessage += validationMessages[errorKey];
    });
    return returnMessage;
  }

  private static getValidationMessages = (elementModel: UIElement): Record<string, string> => ({
    required: elementModel.requiredWarnMessage as string,
    minlength: elementModel.minLengthWarnMessage as string,
    maxlength: elementModel.maxLengthWarnMessage as string,
    pattern: elementModel.patternWarnMessage as string
  });
}
