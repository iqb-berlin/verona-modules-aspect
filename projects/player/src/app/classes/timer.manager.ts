import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { takeUntil } from 'rxjs/operators';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subject } from 'rxjs';

/**
 * Holds one timer -- the delay of a section, the hint of a media player -- and keeps it and the state
 * variable in step: every second it writes the new value into `StateVariableStateService`, and it stops
 * the timer when the duration is reached. The value therefore survives a page change, and the caller
 * knows on return how long it has already been waited.
 */
export class TimerManager {
  /** The running timer, or `null` before `initTimer` and after `reset`. */
  timerStateVariable: StorableTimer | null = null;
  private ngUnsubscribe = new Subject<void>();
  private stateVariableStateService: StateVariableStateService;

  constructor(stateVariableStateService: StateVariableStateService) {
    this.stateVariableStateService = stateVariableStateService;
  }

  stopTimer(): void {
    this.timerStateVariable?.stop();
    this.timerStateVariable = null;
  }

  runTimer(): void {
    this.timerStateVariable?.run();
  }

  /**
   * Builds the timer, subscribes it to the state variable and registers that variable. The starting
   * value comes from the variable if it already carries one, otherwise from 0. Does not start the
   * counting -- `runTimer` does.
   *
   * Called a second time, this replaces the timer without stopping the old one; the caller checks
   * `timerStateVariable` first.
   */
  initTimer(timerStateVariableId: string, duration: number): void {
    this.timerStateVariable = new StorableTimer(
      timerStateVariableId,
      this.stateVariableStateService
        .getElementCodeById(timerStateVariableId)?.value as number || 0,
      duration
    );
    this.timerStateVariable.timerStateValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement) => {
        this.stateVariableStateService.changeElementCodeValue({
          id: value.id,
          value: value.value as number
        });
      });
    this.timerStateVariable.timerStateEnded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.stopTimer();
      });
    this.stateVariableStateService.registerElementCode(
      this.timerStateVariable.id,
      this.timerStateVariable.id,
      this.timerStateVariable.value);
  }

  /**
   * Stops the timer, drops it, and detaches the two subscriptions `initTimer` made for it.
   *
   * The manager stays usable afterwards, and its callers rely on that:
   * `SectionVisibilityHandlingDirective` resets once its section is visible for good, and builds the
   * next timer on the following rule event -- `checkVisibility` reads the `null` this leaves behind as
   * "no timer yet". Every timer built this way has to be detachable in turn, which is why the signal is
   * only sent here and the subject is not closed (#1382).
   */
  reset(): void {
    this.stopTimer();
    this.ngUnsubscribe.next();
  }
}
