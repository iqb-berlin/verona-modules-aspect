import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-border-properties',
  standalone: false,
  templateUrl: './border-properties.component.html'
})
export class BorderPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}
