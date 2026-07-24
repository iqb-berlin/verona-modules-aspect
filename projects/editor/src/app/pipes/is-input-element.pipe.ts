import { Pipe, PipeTransform } from '@angular/core';
import { InputElement, isInputElement, UIElement } from 'common/models/elements/element';

@Pipe({
  name: 'isInputElement',
  standalone: true
})
export class IsInputElementPipe implements PipeTransform {
  transform(el: UIElement): el is InputElement {
    return isInputElement(el);
  }
}
