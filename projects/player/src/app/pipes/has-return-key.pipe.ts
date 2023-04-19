import { Pipe, PipeTransform } from '@angular/core';
import { TextInputElement } from 'common/models/elements/element';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';

@Pipe({
  name: 'hasReturnKey'
})
export class HasReturnKeyPipe implements PipeTransform {
  transform(elementModel: TextInputElement): boolean {
    if (elementModel.type === 'text-area') {
      return (elementModel as TextAreaElement).hasReturnKey;
    }
    return false;
  }
}
