import { EventEmitter } from '@angular/core';
import { Storable } from 'player/src/app/classes/storable';
import { ValueChangeElement } from 'common/models/input-element-interfaces';

/**
 * The countdown behind a waiting time in the unit -- a section that appears only after a delay, the
 * hint of a media player. Counts in milliseconds and takes its starting value from what the state
 * variable already holds, so a task resumed later goes on where it stopped rather than starting over.
 */
export class StorableTimer extends Storable {
  duration: number;
  /** What is left of `duration`. Goes negative if the timer keeps running past its end. */
  restTime: number;
  timerStateValueChanged = new EventEmitter<ValueChangeElement>();
  /**
   * Emitted once the value has reached the duration -- and again with every further second, because
   * reaching the end does not stop the timer. Whoever listens is expected to `stop()` it, as
   * `TimerManager` does.
   */
  timerStateEnded = new EventEmitter();

  private interval: number = 0;

  constructor(id: string, value: number, duration: number) {
    super(id, value);
    this.duration = duration;
    this.restTime = duration - value;
  }

  /** Starts counting, one second at a time. Calling it on a running timer does nothing -- no second
      interval is created. */
  run(): void {
    if (!this.interval) {
      this.interval = window.setInterval(() => {
        this.value += 1000;
        this.restTime = this.duration - this.value;
        this.timerStateValueChanged.emit({ id: this.id, value: this.value });
        if (this.value >= this.duration) {
          this.timerStateEnded.emit();
        }
      }, 1000);
    }
  }

  /** Stops the counting and keeps the value reached. A timer that is not running is left alone; a
      stopped timer can be started again with `run()`. */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = 0;
    }
  }
}
