import {
  Component, Input
} from '@angular/core';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-position-and-dimension-properties',
  templateUrl: './element-position-properties.component.html',
  standalone: false
})
export class ElementPositionPropertiesComponent {
  @Input() dimensions!: Merged<DimensionProperties> | null | undefined;
  @Input() positionProperties: Merged<PositionProperties> | undefined;
  @Input() isZIndexDisabled: boolean = false;

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              public elementService: ElementService) { }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.elementService.alignElements(this.selectionService.getSelectedElements() as PositionedUIElement[], direction);
  }
}
