import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Measurement } from 'common/models/ui-element-interfaces';
import { MessageService } from 'editor/src/app/services/message.service';

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
  /**
   * The smallest measurement this call site accepts, or null for no floor.
   *
   * It has to come from the call site because the same panel serves two kinds of measurement: a
   * margin goes into CSS `margin-top`, where a negative value pulls the element up and is meant,
   * while a grid track size of less than zero is not a length at all (#1164).
   */
  @Input() min: number | null = null;
  @Output() valueUpdated = new EventEmitter<Measurement>();

  /** The last valid entry in the number box, applied when the field is left. */
  private pendingValue: number | null = null;

  constructor(private messageService: MessageService,
              private translateService: TranslateService) {}

  /**
   * What `aspectNumberField` worked out for the number half of the measurement.
   *
   * An emptied box wrote nothing - correctly, see below - but also said nothing and put nothing
   * back, so the field sat empty over a measurement that still held its old value, and no later
   * render brought it back. Measured (#1164).
   */
  commitValue(update: { value: number | null; isInputValid: boolean }): void {
    // The box is `required`, so a valid update always carries a number - the null check is
    // what narrows the type, not a case that can occur.
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      this.pendingValue = null;
      return;
    }
    this.pendingValue = update.value;
  }

  /**
   * Written when the field is left, which is where the original `(change)` handler had it - so an
   * edit still reaches the model once rather than once per keystroke.
   *
   * The directive's own blur listener runs first, so a refused entry has already cleared what was
   * pending by the time this asks.
   */
  applyValue(): void {
    if (this.pendingValue === null) return;
    /* Retyping what is already there is not an edit, and the original `(change)` handler did not
       fire for it either - a `change` event only comes when the value at blur differs from the one
       at focus. Without this, selecting a 3 and typing 3 wrote a fresh measurement to the model. */
    if (this.pendingValue === this.value) {
      this.pendingValue = null;
      return;
    }
    /* A measurement whose selected elements disagree arrives with BOTH halves null, and
       `emitMeasurement` refuses to write half a measurement. Taking the number over anyway cleared
       the field's marker and showed a value that had reached no element at all, with nothing said -
       so the entry stays pending until `applyUnit` has the other half. Measured (#1138). */
    if (this.unit == null) return;
    this.value = this.pendingValue;
    this.pendingValue = null;
    this.emitMeasurement();
  }

  /**
   * The unit half of the measurement.
   *
   * It carries the value with it, because a number entered while the unit was still undecided is
   * waiting here rather than in the model - see `applyValue`.
   */
  applyUnit(): void {
    if (this.pendingValue !== null && this.unit != null) {
      this.value = this.pendingValue;
      this.pendingValue = null;
    }
    this.emitMeasurement();
  }

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
