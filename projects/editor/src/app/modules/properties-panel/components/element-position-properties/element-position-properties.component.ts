import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';
import { PositionedUIElement, UIElementValue } from 'common/models/ui-element-interfaces';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  DivergingProperties, Merged
} from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-position-and-dimension-properties',
  templateUrl: './element-position-properties.component.html',
  standalone: false
})
export class ElementPositionPropertiesComponent {
  @Input() dimensions!: Merged<DimensionProperties> | null | undefined;
  @Input() positionProperties: Merged<PositionProperties> | undefined;
  @Input() divergingProperties: DivergingProperties | undefined;
  @Input() isZIndexDisabled: boolean = false;
  /**
   * Position edits go up to the host rather than into the `ElementService` from here. The host is
   * the one place that evaluates `isInputValid`; writing directly meant the guard the field set
   * computes could never take effect (#1154).
   */
  @Output() updatePositionModel =
    new EventEmitter<{
      property: keyof PositionProperties;
      value: UIElementValue;
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public elementService: ElementService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.elementService.alignElements(this.selectionService.getSelectedElements() as PositionedUIElement[], direction);
  }
}
