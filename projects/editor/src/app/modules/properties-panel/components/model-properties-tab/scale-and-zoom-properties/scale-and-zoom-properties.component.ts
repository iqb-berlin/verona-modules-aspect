import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-scale-and-zoom-properties',
  templateUrl: './scale-and-zoom-properties.component.html',
  styleUrls: ['./scale-and-zoom-properties.component.scss'],
  standalone: false
})
export class ScaleAndZoomPropertiesComponent {
  @Input() combinedProperties!: Merged<ImageProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof ImageProperties;
      value: string | number | boolean | null,
      isInputValid?: boolean | null
    }>();
}
