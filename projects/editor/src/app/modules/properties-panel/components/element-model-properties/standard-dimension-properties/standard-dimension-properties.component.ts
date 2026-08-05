import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import {
  DivergingProperties, Merged
} from 'editor/src/app/modules/properties-panel/models/merged-properties';
import {
  PanelSection, panelSectionsOf
} from 'editor/src/app/modules/properties-panel/models/panel-sections';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
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
  /** For the maximum width, which is `number | null` and needs the third box state (#1167). */
  @Input() divergingProperties: DivergingProperties | undefined;
  /** Which sections the selection has, computed once by the panel's distributor. */
  @Input() show: Record<PanelSection, boolean> = panelSectionsOf([]);

  constructor(private elementService: ElementService,
              private selectionService: SelectionService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  /** Unchecking the box clears the property rather than leaving the last number behind. */
  toggleProperty(property: keyof DimensionProperties, checked: boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }

  updateDimensionProperty(property: keyof DimensionProperties, value: number | boolean | null): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  /**
   * What `aspectNumberField` worked out for one of the four standard-mode size boxes.
   *
   * This component writes into the `ElementService` itself rather than emitting up, so it applies
   * the guard the host applies elsewhere - without it the `min="0"` on all four boxes meant nothing
   * and a negative size was saved (#1154). Warning on leaving rather than per keystroke: typing
   * `-50` passes through `-5`, and a warning each would put one after the other on screen.
   */
  commitDimension(property: keyof DimensionProperties,
                  update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.updateDimensionProperty(property, update.value);
  }
}
