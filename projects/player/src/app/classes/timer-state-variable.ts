import { EventEmitter } from '@angular/core';
import { ValueChangeElement } from 'common/models/elements/element';

export class TimerStateVariable {
  id: string;
  value: number;
  duration: number;
  timerStateValueChanged = new EventEmitter<ValueChangeElement>();
  timerStateEnded = new EventEmitter();

  private interval: number = 0;

  constructor(id: string, duration: number, value = 0) {
    this.id = id;
    this.duration = duration;
    this.value = value;
  }

  run(): void {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.value += 1000;
        this.timerStateValueChanged.emit({ id: this.id, value: this.value });
        if (this.value >= this.duration) {
          this.timerStateEnded.emit();
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
