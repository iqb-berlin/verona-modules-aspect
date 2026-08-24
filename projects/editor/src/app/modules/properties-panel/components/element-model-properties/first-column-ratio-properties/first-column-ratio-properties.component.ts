import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FirstColumnRatioProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * Width of the label column relative to the option columns of a likert table. That table's value
 * governs its own grid and the grid of every row in it.
 *
 * Corresponds exactly to `FirstColumnRatioProperties`, so the property name is checked on both the
 * read and the write side.
 */
@Component({
  selector: 'aspect-first-column-ratio-properties',
  templateUrl: './first-column-ratio-properties.component.html',
  styleUrls: ['./first-column-ratio-properties.component.scss'],
  standalone: false
})
export class FirstColumnRatioPropertiesComponent {
  @Input() combinedProperties!: Merged<FirstColumnRatioProperties>;
  /**
   * A number now. The box used to pass `input.value` on unconverted, so the model ended up holding
   * `'5'` rather than `5` - that is what #1164 changed here. `null` is what a refused entry carries;
   * the caller acts on `isInputValid` rather than on the value.
   */
  @Output() updateModel =
    new EventEmitter<{
      property: keyof FirstColumnRatioProperties;
      value: number | null;
      isInputValid?: boolean | null
    }>();
}
