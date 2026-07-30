import { Component, Input } from '@angular/core';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import {
  PanelSection, panelSectionsOf
} from 'editor/src/app/modules/properties-panel/models/panel-sections';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

/**
 * The few size fields the panel offers in standard mode.
 *
 * They exist because the "position and size" tab is expert-only — in standard mode not one of the
 * 30 element types shows it, so without these fields there would be no way to set a width at all.
 * That is why they sit in the element properties tab and not with the rest of the dimensions.
 *
 * Which of them appear comes from `PANEL_SECTIONS`: width and height for the geometry element,
 * the fixed-width pair for the drop list and the simple text field. The maximum width is offered
 * to every type and therefore has no section of its own.
 */
export type PanelStandardDimensionProperties = Pick<UIElementProperties, 'dimensions'>;

@Component({
  selector: 'aspect-standard-dimension-properties',
  templateUrl: './standard-dimension-properties.component.html',
  styleUrls: ['./standard-dimension-properties.component.scss'],
  standalone: false
})
export class StandardDimensionPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelStandardDimensionProperties>;
  /** Which sections the selection has, computed once by the panel's distributor. */
  @Input() show: Record<PanelSection, boolean> = panelSectionsOf([]);

  constructor(private elementService: ElementService,
              private selectionService: SelectionService) { }

  /** Unchecking the box clears the property rather than leaving the last number behind. */
  toggleProperty(property: keyof DimensionProperties, checked: boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }

  updateDimensionProperty(property: keyof DimensionProperties, value: number | boolean | null): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }
}
