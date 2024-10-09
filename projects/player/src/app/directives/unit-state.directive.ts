import { Directive, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Progress, UnitState } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { LogService } from 'player/modules/logging/services/log.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from '../services/unit-state.service';
import { MediaPlayerService } from '../services/media-player.service';
import { ValidationService } from '../services/validation.service';
import { MarkableService } from 'player/src/app/services/markable.service';

@Directive({
  selector: '[aspectUnitState]'
})
export class UnitStateDirective implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private unitStateService: UnitStateService,
    private stateVariableStateService: StateVariableStateService,
    private mediaPlayerService: MediaPlayerService,
    private veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private validatorService: ValidationService,
    private markableService: MarkableService
  ) {}

  ngOnInit(): void {
    merge(
      this.mediaPlayerService.mediaStatusChanged,
      this.unitStateService.pagePresented,
      this.unitStateService.elementCodeChanged,
      this.stateVariableStateService.elementCodeChanged
    )
      .pipe(
        debounceTime(500),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((): void => this.sendVopStateChangedNotification());
  }

  private get presentationProgress(): Progress {
    if (this.mediaPlayerService.areMediaElementsRegistered()) {
      const mediaStatus = this.mediaPlayerService.mediaStatus;
      return mediaStatus === this.unitStateService.presentedPagesProgress ? mediaStatus : 'some';
    }
    return this.unitStateService.presentedPagesProgress;
  }

  private sendVopStateChangedNotification(): void {
    LogService.debug('player: this.unitStateService.elementCodes',
      this.unitStateService.elementCodes);
    LogService.debug('player: this.stateVariableStateService.elementCodes',
      this.stateVariableStateService.elementCodes);
    const unitState: UnitState = {
      dataParts: {
        stateVariableCodes: JSON.stringify(this.stateVariableStateService.elementCodes),
        elementCodes: JSON.stringify(this.unitStateService.elementCodes)
      },
      presentationProgress: this.presentationProgress,
      responseProgress: this.validatorService.responseProgress,
      unitStateDataType: 'iqb-standard@1.0'
    };
    LogService.debug('player: unitState sendVopStateChangedNotification', unitState);
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.unitStateService.reset();
    this.stateVariableStateService.reset();
    this.mediaPlayerService.reset();
    this.validatorService.reset();
    this.markableService.reset();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
