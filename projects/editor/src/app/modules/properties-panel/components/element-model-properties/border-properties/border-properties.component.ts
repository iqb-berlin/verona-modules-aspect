import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FrameProperties } from 'common/models/elements/frame';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-border-properties',
  standalone: false,
  templateUrl: './border-properties.component.html'
})
export class BorderPropertiesComponent {
  @Input() combinedProperties!: Merged<FrameProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof FrameProperties; value: string | number | boolean | null }>();
}
