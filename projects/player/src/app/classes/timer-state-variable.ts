import { EventEmitter } from '@angular/core';
import { ValueChangeElement } from 'common/models/elements/element';

export class TimerStateVariable {
  id: string;
  value: number;
  duration: number;
  elementValueChanged = new EventEmitter<ValueChangeElement>();

  private interval: number = 0;

  constructor(id: string, value: number, duration: number) {
    this.id = id;
    this.value = value;
    this.duration = duration;
  }

  run(): void {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.value += 1000;
        this.elementValueChanged.emit({ id: this.id, value: this.value });
        if (this.value >= this.duration) {
          this.stop();
        }
      }, 1000);
    }
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = 0;
    }
  }
}
