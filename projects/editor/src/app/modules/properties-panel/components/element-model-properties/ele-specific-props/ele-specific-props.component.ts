import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElementProperties, UIElementValue } from 'common/models/ui-element-interfaces';
import {
  DivergingProperties, Merged
} from 'editor/src/app/modules/properties-panel/models/merged-properties';
import {
  PanelSection, panelSectionsOf
} from 'editor/src/app/modules/properties-panel/models/panel-sections';

/**
 * Picks the component for whatever element type is selected. A pure distributor: it renders no
 * control of its own, reads nothing and writes nothing.
 *
 * Since #1137 it does not even read `type` — which section to offer comes from `PANEL_SECTIONS`,
 * computed once by the parent. The one remaining field is what the relayed object needs to stay
 * assignable to the children's own property types.
 */
export type PanelEleSpecificProperties = Pick<UIElementProperties, 'type'>;

@Component({
  selector: 'aspect-ele-specific-props',
  standalone: false,
  templateUrl: './ele-specific-props.component.html'
})
export class EleSpecificPropsComponent {
  @Input() combinedProperties!: Merged<PanelEleSpecificProperties>;
  /** Relayed unread, like `combinedProperties` - the slider's preset is the child that needs it. */
  @Input() divergingProperties: DivergingProperties | undefined;
  /**
   * Which sections the selection has, computed once by the parent. Defaults to none, so a caller
   * that forgets it renders an empty distributor instead of throwing - the characterization net
   * covers the real path for all 30 element types.
   */
  @Input() show: Record<PanelSection, boolean> = panelSectionsOf([]);
  /** `string`, because every event here comes from a child component and only passes through. */
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}
