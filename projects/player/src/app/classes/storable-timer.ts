import { EventEmitter } from '@angular/core';
import { Storable } from 'player/src/app/classes/storable';
import { ValueChangeElement } from 'common/interfaces';

export class StorableTimer extends Storable {
  duration: number;
  timerStateValueChanged = new EventEmitter<ValueChangeElement>();
  timerStateEnded = new EventEmitter();

  private interval: number = 0;

  constructor(id: string, value: number, duration: number) {
    super(id, value);
    this.duration = duration;
  }

  run(): void {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.value += 1000;
        this.timerStateValueChanged.emit({ id: this.id, value: this.value });
        if (this.value >= this.duration) {
          this.timerStateEnded.emit();
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
