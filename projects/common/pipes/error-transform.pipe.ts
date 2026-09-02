import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { InputElement } from 'common/models/elements/element';

@Pipe({
  name: 'errorTransform',
  standalone: false
})
export class ErrorTransformPipe implements PipeTransform {
  /**
   * The message shown under a field that is not filled in as it must be. Every message comes from the
   * element itself -- what the task author wrote into `requiredWarnMessage` and its three siblings --
   * so nothing here is translated; several errors at once are joined with `; `.
   *
   * An error contributes the word `undefined` where no message answers it -- either because the author
   * left it empty, or because the error key is not one of the four known here. A required slider still
   * at its minimum fails `min`, which is that second case (#1385).
   */
  transform(validationErrors: ValidationErrors, elementModel: InputElement): string {
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

  private static getValidationMessages = (elementModel: InputElement): Record<string, string> => ({
    required: elementModel.requiredWarnMessage as string,
    minlength: elementModel.minLengthWarnMessage as string,
    maxlength: elementModel.maxLengthWarnMessage as string,
    pattern: elementModel.patternWarnMessage as string
  });
}
