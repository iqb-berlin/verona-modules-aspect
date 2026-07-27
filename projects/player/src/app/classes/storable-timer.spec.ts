import { fakeAsync, tick } from '@angular/core/testing';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { StorableTimer } from './storable-timer';

describe('StorableTimer', () => {
  let timer: StorableTimer;
  let valueChanges: ValueChangeElement[];
  let endedCount: number;

  beforeEach(() => {
    timer = new StorableTimer('timer_1', 0, 3000);
    valueChanges = [];
    endedCount = 0;
    timer.timerStateValueChanged.subscribe(change => valueChanges.push(change));
    timer.timerStateEnded.subscribe(() => { endedCount += 1; });
  });

  afterEach(() => {
    timer.stop();
  });

  it('should create an instance', () => {
    expect(timer).toBeTruthy();
    expect(timer.duration).toBe(3000);
    expect(timer.restTime).toBe(3000);
  });

  it('should start with the remaining time of an already running timer', () => {
    expect(new StorableTimer('timer_1', 1000, 3000).restTime).toBe(2000);
  });

  it('should count up second by second', fakeAsync(() => {
    timer.run();

    tick(2000);

    expect(timer.value).toBe(2000);
    expect(timer.restTime).toBe(1000);
    expect(valueChanges).toEqual([
      { id: 'timer_1', value: 1000 },
      { id: 'timer_1', value: 2000 }
    ]);
  }));

  it('should report the end of the duration', fakeAsync(() => {
    timer.run();

    tick(3000);

    expect(endedCount).toBe(1);
  }));

  it('should not start a second interval', fakeAsync(() => {
    timer.run();
    timer.run();

    tick(1000);

    expect(timer.value).toBe(1000);
  }));

  it('should stop counting', fakeAsync(() => {
    timer.run();
    tick(1000);

    timer.stop();
    tick(2000);

    expect(timer.value).toBe(1000);
  }));

  it('should be restartable after being stopped', fakeAsync(() => {
    timer.run();
    tick(1000);
    timer.stop();

    timer.run();
    tick(1000);

    expect(timer.value).toBe(2000);
  }));
});
