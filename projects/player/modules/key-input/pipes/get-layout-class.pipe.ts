import { Pipe, PipeTransform } from '@angular/core';
import { InputAssistancePreset } from 'common/interfaces';

@Pipe({
  name: 'getLayoutClass',
  standalone: false
})
export class GetLayoutClassPipe implements PipeTransform {
  transform(
    position: 'floating' | 'right',
    preset: InputAssistancePreset,
    keyStyle: string,
    customStyle: 'small' | 'medium' | 'large'
  ): string {
    if (position === 'right') {
      if (preset === 'french' || preset === 'custom' || preset === 'chemicalEquation') return 'fixed-big-row-container';
      return 'fixed-small-row-container';
    }
    if (preset === 'custom') {
      return `floating-${keyStyle}-keys-${customStyle}-row-container`;
    }
    return `floating-${keyStyle}-keys-row-container`;
  }
}
