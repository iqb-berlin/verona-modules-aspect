import { Pipe, PipeTransform } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';

@Pipe({
  name: 'hasReturnKey'
})
export class HasReturnKeyPipe implements PipeTransform {
  transform(elementModel: UIElement): boolean {
    if (elementModel.type === 'text-area') {
      return (elementModel as TextAreaElement).hasReturnKey;
    }
    return false;
  }
}
