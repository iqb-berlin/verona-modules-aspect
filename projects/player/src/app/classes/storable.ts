import { EventEmitter } from '@angular/core';
import { ValueChangeElement } from 'common/interfaces';

export class Storable {
  id: string;
  private _value: number;
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
