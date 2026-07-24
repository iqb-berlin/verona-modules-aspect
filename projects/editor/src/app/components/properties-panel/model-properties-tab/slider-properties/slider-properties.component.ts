import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-slider-properties',
  standalone: false,
  templateUrl: './slider-properties.component.html'
})
export class SliderPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public unitService: UnitService) { }
}
