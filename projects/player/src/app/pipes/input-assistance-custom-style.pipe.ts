import { Pipe, PipeTransform } from '@angular/core';
import { InputAssistanceCustomStyle } from 'common/interfaces';

@Pipe({
  name: 'inputAssistanceCustomStyle',
  standalone: false
})
export class InputAssistanceCustomStylePipe implements PipeTransform {
  transform(keys: unknown): InputAssistanceCustomStyle {
    return keys as InputAssistanceCustomStyle;
  }
}
