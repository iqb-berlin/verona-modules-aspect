import { Pipe, PipeTransform } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { TextAreaElement } from 'common/models/elements/text-area';

@Pipe({
  name: 'hasReturnKey',
  standalone: false
})
export class HasReturnKeyPipe implements PipeTransform {
  /** Whether the input aid shows a return key for this element. Only a text area can have one -- in a
      single-line field the key would have nothing to do. */
  transform(elementModel: UIElement): boolean {
    if (elementModel.type === 'text-area') {
      return (elementModel as TextAreaElement).hasReturnKey;
    }
    return false;
  }
}
