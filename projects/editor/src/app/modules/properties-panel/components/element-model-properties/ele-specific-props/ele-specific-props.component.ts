import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextProperties } from 'common/models/elements/text-group-elements/text';
import { UIElementProperties, UIElementValue } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * Picks the component for whatever element type is selected. A pure distributor: it renders no
 * control of its own, so it reads only what its conditions need and writes nothing.
 */
export type PanelEleSpecificProperties =
  Pick<UIElementProperties, 'type'> & Pick<TextProperties, 'text'>;

@Component({
  selector: 'aspect-ele-specific-props',
  standalone: false,
  templateUrl: './ele-specific-props.component.html'
})
export class EleSpecificPropsComponent {
  @Input() combinedProperties!: Merged<PanelEleSpecificProperties>;
  /** `string`, because every event here comes from a child component and only passes through. */
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
