import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { DeclaredKeys } from 'editor/src/app/components/properties-panel/models/merged-properties';
import { ElementService } from 'editor/src/app/services/element.service';

@Component({
  selector: 'aspect-dimension-field-set',
  templateUrl: './dimension-field-set.component.html',
  standalone: false
})

export class DimensionFieldSetComponent {
  @Input() positionProperties: PositionProperties | undefined;
  @Input() dimensions!: DimensionProperties;

  constructor(public unitService: UnitService,
              public elementService: ElementService,
              public selectionService: SelectionService) { }

  /**
   * `DeclaredKeys`, not `keyof`: DimensionProperties carries an index signature, which would make
   * plain `keyof` collapse to `string` and check nothing.
   */
  updateDimensionProperty(property: DeclaredKeys<DimensionProperties>, value: number | boolean | null): void {
    this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, value);
  }

  toggleProperty(property: DeclaredKeys<DimensionProperties>, checked: boolean): void {
    if (!checked) {
      this.elementService.updateElementsDimensionsProperty(this.selectionService.getSelectedElements(), property, null);
    }
  }
}
