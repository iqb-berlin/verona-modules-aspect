import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-select-properties',
  templateUrl: './select-properties.component.html',
  standalone: false
})
export class SelectPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{
      property: string,
      value: string | number | boolean | string[] | null
    }>();

  constructor(public unitService: UnitService) { }

  setItemsPerRow(isLimited: boolean) {
    if (!isLimited) {
      this.updateModel.emit({ property: 'itemsPerRow', value: null });
    } else {
      this.updateModel.emit({ property: 'itemsPerRow', value: 4 });
    }
  }
}
