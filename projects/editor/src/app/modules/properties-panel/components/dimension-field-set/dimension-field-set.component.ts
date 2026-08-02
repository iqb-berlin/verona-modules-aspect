import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-dimension-field-set',
  templateUrl: './dimension-field-set.component.html',
  standalone: false
})

export class DimensionFieldSetComponent {
  @Input() positionProperties: Merged<PositionProperties> | undefined;
  @Input() dimensions!: Merged<DimensionProperties>;

  constructor(public unitService: UnitService,
              public elementService: ElementService,
              public selectionService: SelectionService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  updateDimensionProperty(property: keyof DimensionProperties, value: number | boolean | null): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  /**
   * What `aspectNumberField` worked out for one of the ten size boxes.
   *
   * These fields write into the `ElementService` from this component rather than emitting up, so
   * the guard the host applies to the other tabs never covered them: `min="0"` sat on every box and
   * meant nothing, a negative size was saved, and an emptied box sent `null` into `width`/`height`,
   * which are declared `number` (#1161). Warning here rather than in the directive keeps the choice
   * with the caller - the leaves that do emit upwards let their host decide instead.
   */
  commitDimension(property: keyof DimensionProperties,
                  update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.updateDimensionProperty(property, update.value);
  }

  toggleProperty(property: keyof DimensionProperties, checked: boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }
}
