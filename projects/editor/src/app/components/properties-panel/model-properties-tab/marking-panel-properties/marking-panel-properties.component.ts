import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-marking-panel-properties',
  standalone: false,
  templateUrl: './marking-panel-properties.component.html'
})
export class MarkingPanelPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[], isInputValid?: boolean | null;
    }>();
}
