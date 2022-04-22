import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Progress, UnitState } from '../../../modules/verona/models/verona';
import { UnitStateService } from '../services/unit-state.service';
import { MediaPlayerService } from '../services/media-player.service';
import { VeronaSubscriptionService } from '../../../modules/verona/services/verona-subscription.service';
import { VeronaPostService } from '../../../modules/verona/services/verona-post.service';
import { ValidatorService } from '../services/validator.service';

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
    private validatorService: ValidatorService
  ) {}

  ngOnInit(): void {
    this.mediaPlayerService.mediaStatusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
    this.unitStateService.presentedPageAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
    this.unitStateService.unitStateElementCodeChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.sendVopStateChangedNotification());
  }

  private get presentationProgress(): Progress {
    const mediaStatus = this.mediaPlayerService.mediaStatus;
    return mediaStatus === this.unitStateService.presentedPagesProgress ? mediaStatus : 'some';
  }

  private sendVopStateChangedNotification(): void {
    // eslint-disable-next-line no-console
    console.log('player: this.unitStateService.unitStateElementCodes',
      this.unitStateService.unitStateElementCodes);
    const unitState: UnitState = {
      dataParts: {
        elementCodes: JSON.stringify(this.unitStateService.unitStateElementCodes)
      },
      presentationProgress: this.presentationProgress,
      responseProgress: this.validatorService.responseProgress,
      unitStateDataType: 'iqb-standard@1.0'
    };
    // eslint-disable-next-line no-console
    console.log('player: unitState sendVopStateChangedNotification', unitState);
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
