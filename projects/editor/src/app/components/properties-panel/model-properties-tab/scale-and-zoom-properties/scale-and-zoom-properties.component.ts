import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-scale-and-zoom-properties',
  templateUrl: './scale-and-zoom-properties.component.html',
  styleUrls: ['./scale-and-zoom-properties.component.scss'],
  standalone: false
})
export class ScaleAndZoomPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();
}
