import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  PlayerState, RunningState
} from 'player/modules/verona/models/verona';
import { BehaviorSubject, Subject } from 'rxjs';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { takeUntil } from 'rxjs/operators';
import { LogService } from 'player/modules/logging/services/log.service';

@Directive({
  selector: '[aspectPlayerState]'
})
export class PlayerStateDirective implements OnInit, OnChanges {
  @Input() validPages!: Record<string, string>;
  @Input() currentPlayerPageIndex!: number;
  @Input() isPlayerRunning!: BehaviorSubject<boolean>;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
    this.sendVopStateChangedNotification();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentPlayerPageIndex) {
      this.sendVopStateChangedNotification();
    }
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopContinueCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.setAndSendRunningState(true));
    this.veronaSubscriptionService.vopStopCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(()  => this.setAndSendRunningState(false));
    this.veronaSubscriptionService.vopGetStateRequest
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(message => this.setAndSendRunningState((!message.stop && this.state === 'running')));
  }

  private get state(): RunningState {
    return this.isPlayerRunning.getValue() ? 'running' : 'stopped';
  }

  private setAndSendRunningState(isRunning: boolean): void {
    this.isPlayerRunning.next(isRunning);
    this.sendVopStateChangedNotification();
  }

  private sendVopStateChangedNotification(requested:boolean = false): void {
    const playerState: PlayerState = {
      state: this.state,
      currentPage: this.currentPlayerPageIndex.toString(10),
      validPages: this.validPages
    };
    LogService.warn('player: sendVopStateChangedNotification', playerState);
    this.veronaPostService.sendVopStateChangedNotification({ playerState }, requested);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
