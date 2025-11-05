import { StorableTimer } from 'player/src/app/classes/storable-timer';
import { takeUntil } from 'rxjs/operators';
import { ValueChangeElement } from 'common/interfaces';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subject } from 'rxjs';

export class TimerManager {
  timerStateVariable: StorableTimer | null = null;
  private ngUnsubscribe = new Subject<void>();
  private stateVariableStateService: StateVariableStateService;

  constructor(stateVariableStateService: StateVariableStateService) {
    this.stateVariableStateService = stateVariableStateService;
  }

  destroyTimerStateVariable(): void {
    this.timerStateVariable?.stop();
    this.timerStateVariable = null;
  }

  runTimer(): void {
    this.timerStateVariable?.run();
  }

  initTimerState(timerStateVariableId: string, duration: number): void {
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
        this.destroyTimerStateVariable();
      });
    this.stateVariableStateService.registerElementCode(
      this.timerStateVariable.id,
      this.timerStateVariable.id,
      this.timerStateVariable.value);
  }

  reset(): void {
    this.destroyTimerStateVariable();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
