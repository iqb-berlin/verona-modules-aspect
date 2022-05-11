import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Progress, UnitState } from 'player/modules/verona/models/verona';
import { UnitStateService } from '../services/unit-state.service';
import { MediaPlayerService } from '../services/media-player.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { ValidationService } from '../services/validation.service';
import { LogService } from 'player/modules/logging/services/log.service';

@Directive({
  selector: '[aspectUnitState]'
})
export class UnitStateDirective implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private unitStateService: UnitStateService,
    private mediaPlayerService: MediaPlayerService,
    private veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private validatorService: ValidationService
  ) {}

  ngOnInit(): void {
    this.mediaPlayerService.mediaStatusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
    this.unitStateService.presentedPageAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
    this.unitStateService.elementCodeChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
  }

  private get presentationProgress(): Progress {
    const mediaStatus = this.mediaPlayerService.mediaStatus;
    return mediaStatus === this.unitStateService.presentedPagesProgress ? mediaStatus : 'some';
  }

  private sendVopStateChangedNotification(): void {
    LogService.info('player: this.unitStateService.unitStateElementCodes',
      this.unitStateService.elementCodes);
    const unitState: UnitState = {
      dataParts: {
        elementCodes: JSON.stringify(this.unitStateService.elementCodes)
      },
      presentationProgress: this.presentationProgress,
      responseProgress: this.validatorService.responseProgress,
      unitStateDataType: 'iqb-standard@1.0'
    };
    LogService.info('player: unitState sendVopStateChangedNotification', unitState);
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
