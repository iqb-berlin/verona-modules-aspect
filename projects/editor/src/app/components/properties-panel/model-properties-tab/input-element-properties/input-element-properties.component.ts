import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-input-element-properties',
  templateUrl: './input-element-properties.component.html',
  standalone: false
})
export class InputElementPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public unitService: UnitService) { }
}
