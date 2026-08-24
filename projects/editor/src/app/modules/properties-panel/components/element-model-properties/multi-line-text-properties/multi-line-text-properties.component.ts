import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextAreaProperties } from 'common/models/elements/text-input-group-elements/text-area';
import { MultiLineTextProperties } from 'common/models/input-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The panel's view of how tall a multi-line text input is.
 *
 * The four controls are one cluster because they gate each other: a fixed row count and an
 * automatic height are mutually exclusive, and a dynamic row count replaces the row count with an
 * expected number of characters. Only `rowCount` and `hasAutoHeight` are shared with the math text
 * area (`MultiLineTextProperties`); the other two exist on the plain text area alone, which is why
 * they are picked from it by name rather than assumed to be everywhere.
 */
export type PanelMultiLineTextProperties =
  MultiLineTextProperties &
  Pick<TextAreaProperties, 'hasDynamicRowCount' | 'expectedCharactersCount' | 'resizeEnabled'>;

@Component({
  selector: 'aspect-multi-line-text-properties',
  templateUrl: './multi-line-text-properties.component.html',
  styleUrls: ['./multi-line-text-properties.component.scss'],
  standalone: false
})
export class MultiLineTextPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelMultiLineTextProperties>;
  /** A typed number is a string here; see FirstColumnRatioPropertiesComponent for the why. */
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PanelMultiLineTextProperties;
      value: boolean | number | string | null;
      isInputValid?: boolean | null;
    }>();

  constructor(public unitService: UnitService) { }
}
