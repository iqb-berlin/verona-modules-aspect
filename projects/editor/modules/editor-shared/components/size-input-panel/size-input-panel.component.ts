import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Measurement } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: false,
  templateUrl: './size-input-panel.component.html',
  styleUrls: ['./size-input-panel.component.scss']
})
export class SizeInputPanelComponent {
  @Input() label!: string;
  /** `null` when the panel shows a merged measurement whose selected elements disagree. */
  @Input() value: number | null | undefined;
  @Input() unit: string | null | undefined;
  @Input() allowedUnits!: string[];
  @Input() disabled!: boolean;
  @Output() valueUpdated = new EventEmitter<Measurement>();

  /**
   * A measurement is written only once both of its parts are there.
   *
   * The margin fields of a multi-selection whose margins disagree arrive here as `value: null` and
   * render empty. This used to substitute `0`, so picking a unit — without entering anything — wrote
   * a margin of 0 to every selected element. An empty field now writes nothing; entering a value
   * still writes it to the whole selection.
   */
  emitMeasurement(): void {
    if (this.value == null || this.unit == null) return;
    this.valueUpdated.emit({ value: this.value, unit: this.unit });
  }
}
