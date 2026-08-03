import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FirstColumnRatioProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * Width of the label column relative to the option columns, for likert and its rows.
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
   * `value` is a string for anything the author types: `input[type=number].value` is a string, and
   * the panel has always passed it on unconverted, so the model ends up holding `'5'` rather than
   * `5`. Typed as it actually behaves; normalising it would be a change of behaviour, not of types.
   */
  @Output() updateModel =
    new EventEmitter<{
      property: keyof FirstColumnRatioProperties;
      value: number | string | null;
      isInputValid?: boolean | null
    }>();
}
