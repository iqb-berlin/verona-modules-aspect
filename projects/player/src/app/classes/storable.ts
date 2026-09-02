import { EventEmitter } from '@angular/core';
import { ValueChangeElement } from 'common/models/input-element-interfaces';

/**
 * A number that belongs to a state variable and announces its own changes, so whoever holds it does not
 * have to poll it.
 */
export class Storable {
  id: string;
  private _value: number;
  /** Emitted on every change of `value` -- assigning the value it already has emits nothing. */
  valueChanged = new EventEmitter<ValueChangeElement>();

  constructor(id: string, value: number) {
    this.id = id;
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    if (this._value !== value) {
      this._value = value;
      this.valueChanged.emit({ id: this.id, value });
    }
  }
}
