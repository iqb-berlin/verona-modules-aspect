import { Pipe, PipeTransform } from '@angular/core';
import { ClozeMarks } from '../../models/uI-element';

@Pipe({
  name: 'styleMarks'
})
/* This extracts marks from a text item and puts them in an object to be consumed by ngStyle.
  Only used in cloze component */
export class StyleMarksPipe implements PipeTransform {
  transform(items: any[] | undefined): ClozeMarks {
    if (!items) {
      return {};
    }
    const markTypes = items.map(item => item.type);
    const textStyles = items.filter(item => item.type === 'textStyle')[0]?.attrs;
    const highlightAttributes = items.filter(item => item.type === 'highlight')[0]?.attrs;
    return {
      'font-weight': markTypes.includes('bold') ? 'bold' : '',
      'font-style': markTypes.includes('italic') ? 'italic' : '',
      'text-decoration': markTypes.includes('underline') ? 'underline' : '',
      fontSize: textStyles?.fontSize,
      color: textStyles?.color,
      'background-color': highlightAttributes?.color
    };
  }
}
