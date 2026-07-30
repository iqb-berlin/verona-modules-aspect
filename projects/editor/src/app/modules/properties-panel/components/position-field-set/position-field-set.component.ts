import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { UIElementValue } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-position-field-set',
  templateUrl: './position-field-set.component.html',
  styleUrls: ['./position-field-set.component.scss'],
  standalone: false
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Input() isZIndexDisabled: boolean = false;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PositionProperties;
      value: UIElementValue,
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService, public selectionService: SelectionService) {}
}
