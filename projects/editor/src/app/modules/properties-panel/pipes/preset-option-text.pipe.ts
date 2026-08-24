import { Pipe, PipeTransform } from '@angular/core';
import { InputElementValue } from 'common/models/input-element-interfaces';
import { TextLabel } from 'common/models/label-interfaces';

/**
 * The text of the preset option, for the closed state of the preset select.
 *
 * The select stores the preset as an index into the option list, so the label has to be looked up.
 * Everything that is not an index the list actually holds yields the empty string: no preset chosen,
 * option lists that disagree across the selection (`null`), and an index left over from a shorter
 * list. The trigger renders on every change detection cycle, so a lookup that throws throws
 * repeatedly - see #1151.
 *
 * Impure on purpose, against the preference for pure pipes in rules.md 2. The panel hands down the
 * element's own option array (`mergeElements` shallow-copies the element) and `UIElement.setProperty`
 * splices into arrays to keep their reference intact, so renaming, removing or reordering an option
 * reaches this pipe as an in-place mutation: a pure pipe would never see it and the closed select
 * would keep naming the option's old text. One index lookup per cycle is what the inline expression
 * this replaced cost anyway.
 */
@Pipe({
  name: 'presetOptionText',
  pure: false,
  standalone: false
})
export class PresetOptionTextPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(options: TextLabel[] | null | undefined, value: InputElementValue | undefined): string {
    if (options == null || typeof value !== 'number') return '';
    return options[value]?.text ?? '';
  }
}
