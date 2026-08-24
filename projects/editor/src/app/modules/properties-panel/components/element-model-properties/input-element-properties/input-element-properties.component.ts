import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CheckboxProperties } from 'common/models/elements/input-group-elements/checkbox';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The properties every input element has, plus the checkbox's `imgSrc`.
 *
 * `imgSrc` is read only, to disable the label field while an image stands in for it. It is the
 * element's own image, not `PlayerProperties.imgSrc`. This one extra property is why no existing
 * interface fitted this component — `Pick` names it without widening InputElementProperties.
 */
export type PanelInputElementProperties =
  InputElementProperties & Pick<CheckboxProperties, 'imgSrc'>;

@Component({
  selector: 'aspect-input-element-properties',
  templateUrl: './input-element-properties.component.html',
  standalone: false
})
export class InputElementPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelInputElementProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PanelInputElementProperties;
      value: string | number | boolean | string[],
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService) { }
}
