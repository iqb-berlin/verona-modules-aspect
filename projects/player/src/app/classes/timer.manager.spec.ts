import { fakeAsync, tick } from '@angular/core/testing';
import { Response } from '@iqb/responses';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { TimerManager } from './timer.manager';

describe('TimerManager', () => {
  let manager: TimerManager;
  let stateVariableStateService: SpyObj<StateVariableStateService>;
  let stored: Record<string, Response>;
  let writes: { id: string, value: number }[];

  beforeEach(() => {
    stored = {};
    writes = [];

    stateVariableStateService = createSpyObj<StateVariableStateService>(
      ['getElementCodeById', 'registerElementCode', 'changeElementCodeValue']
    );
    stateVariableStateService.getElementCodeById.mockImplementation((id: string) => stored[id]);
    stateVariableStateService.registerElementCode
      .mockImplementation((id: string, alias: string, value: unknown) => {
        stored[id] = { id, status: 'VALUE_CHANGED', value: value as number };
      });
    stateVariableStateService.changeElementCodeValue
      .mockImplementation((code: { id: string, value: unknown }) => {
        stored[code.id] = { id: code.id, status: 'VALUE_CHANGED', value: code.value as number };
        writes.push({ id: code.id, value: code.value as number });
      });

    manager = new TimerManager(stateVariableStateService);
  });

  it('should create an instance', () => {
    expect(manager).toBeTruthy();
  });

  it('should write the value into the state variable every second', fakeAsync(() => {
    manager.initTimer('timer-1', 3000);
    manager.runTimer();

    tick(2000);

    expect(writes).toEqual([{ id: 'timer-1', value: 1000 }, { id: 'timer-1', value: 2000 }]);
    manager.reset();
  }));

  it('should take the value the state variable already holds as its starting point', fakeAsync(() => {
    stored['timer-1'] = { id: 'timer-1', status: 'VALUE_CHANGED', value: 2000 };

    manager.initTimer('timer-1', 3000);
    manager.runTimer();
    tick(1000);

    expect(writes).toEqual([{ id: 'timer-1', value: 3000 }]);
    manager.reset();
  }));

  it('should stop the timer once the duration is reached', fakeAsync(() => {
    manager.initTimer('timer-1', 2000);
    manager.runTimer();

    tick(5000);

    expect(writes).toEqual([{ id: 'timer-1', value: 1000 }, { id: 'timer-1', value: 2000 }]);
    expect(manager.timerStateVariable).toBeNull();
  }));

  it('should stop the timer and drop it on reset', fakeAsync(() => {
    manager.initTimer('timer-1', 5000);
    manager.runTimer();
    tick(1000);

    manager.reset();
    tick(4000);

    expect(writes).toEqual([{ id: 'timer-1', value: 1000 }]);
    expect(manager.timerStateVariable).toBeNull();
  }));

  it('should build a new timer after a reset', fakeAsync(() => {
    manager.initTimer('timer-1', 5000);
    manager.runTimer();
    tick(1000);
    manager.reset();

    manager.initTimer('timer-2', 5000);
    manager.runTimer();
    tick(1000);

    expect(writes).toEqual([{ id: 'timer-1', value: 1000 }, { id: 'timer-2', value: 1000 }]);
    manager.reset();
  }));

  /*
   * The timers are started again by hand here, which is what makes the detachment visible at all: a
   * reset stops its timer, so a still-attached subscription has nothing to carry. `stop()` leaves a
   * timer restartable by design. `SectionVisibilityHandlingDirective` builds a second timer through
   * this manager, so it is not only the first that has to come loose (#1382).
   */
  it('should detach the subscriptions of every timer it built, not only the first', fakeAsync(() => {
    manager.initTimer('timer-1', 5000);
    manager.runTimer();
    const first = manager.timerStateVariable as StorableTimer;
    manager.reset();

    manager.initTimer('timer-2', 5000);
    manager.runTimer();
    const second = manager.timerStateVariable as StorableTimer;
    manager.reset();

    writes.length = 0;
    first.run();
    second.run();
    tick(1000);
    first.stop();
    second.stop();

    expect(writes).toEqual([]);
  }));
});
