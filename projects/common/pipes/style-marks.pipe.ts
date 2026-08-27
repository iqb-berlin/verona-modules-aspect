import { Pipe, PipeTransform } from '@angular/core';
import { ClozeMark, ClozeMarks } from 'common/models/elements/cloze';

@Pipe({
  name: 'styleMarks',
  standalone: false
})
/* This extracts marks from a text item and puts them in an object to be consumed by ngStyle.
  Only used in cloze component */
export class StyleMarksPipe implements PipeTransform {
  /**
   * The styles a run of cloze text carries, as the object a style binding takes: bold, italic and
   * underline as their own marks, font size and colour out of the `textStyle` mark, background out of
   * the `highlight` mark.
   *
   * Of a mark type that appears more than once only the first is read. A mark that is absent leaves its
   * key in the object without a value -- empty string for the three switches, `undefined` for the three
   * taken from attributes -- so the binding falls back to what the run inherits.
   */
  transform(items: ClozeMark[] | undefined): ClozeMarks {
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
