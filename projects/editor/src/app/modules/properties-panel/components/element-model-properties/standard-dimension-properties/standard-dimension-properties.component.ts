import { Component, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
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
   * A size field has been left. `width` and `height` are declared `number`, so an empty box means
   * zero (#1154). Nothing is written while typing, because a box the browser cannot parse yet - a
   * lone `-`, say - reads as empty too, and writing then stamps the value back over what is being
   * typed.
   */
  commitNumber(control: NgModel,
               property: keyof DimensionProperties,
               modelValue: number | null | undefined): void {
    if (control.invalid) {
      this.refuse(control, modelValue);
      return;
    }
    if (control.value === null) this.updateDimensionProperty(property, 0);
  }

  /** `maxWidth` is `number | null`: an empty box means "no maximum" and is left alone. */
  revertIfInvalid(control: NgModel, modelValue: number | null | undefined): void {
    if (control.invalid) this.refuse(control, modelValue);
  }

  /**
   * Unlike every other tab, these fields write into the `ElementService` from this component rather
   * than emitting up to the host, so the guard the host applies has to be repeated here - without
   * it the `min="0"` on all four boxes meant nothing and a negative size was saved (#1154).
   *
   * Warning on leaving rather than per keystroke: typing `-50` passes through `-5`, and a warning
   * each would put one after the other on screen for a single edit.
   */
  private refuse(control: NgModel, modelValue: number | null | undefined): void {
    this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    /* `emitViewToModelChange: false`, or putting the box back would itself look like the user
       typing and write the rejected value after all. */
    control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
  }
}
