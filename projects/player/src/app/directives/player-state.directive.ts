import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  PlayerState, RunningState, VopContinueCommand, VopGetStateRequest, VopStopCommand
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
      .subscribe((message: VopContinueCommand): void => this.onContinue(message));
    this.veronaSubscriptionService.vopStopCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopStopCommand): void => this.onStop(message));
    this.veronaSubscriptionService.vopGetStateRequest
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopGetStateRequest): void => this.onGetStateRequest(message));
  }

  private get state(): RunningState {
    return this.isPlayerRunning.getValue() ? 'running' : 'stopped';
  }

  private onContinue(message: VopContinueCommand): void {
    LogService.info('player: onContinue', message);
    this.isPlayerRunning.next(true);
    this.sendVopStateChangedNotification();
  }

  private onStop(message: VopStopCommand): void {
    LogService.info('player: onStop', message);
    this.isPlayerRunning.next(false);
    this.sendVopStateChangedNotification();
  }

  private onGetStateRequest(message: VopGetStateRequest): void {
    LogService.info('player: onGetStateRequest', message);
    if (message.stop) {
      this.isPlayerRunning.next(false);
    }
    this.sendVopStateChangedNotification(true);
  }

  private sendVopStateChangedNotification(requested:boolean = false): void {
    const playerState: PlayerState = {
      state: this.state,
      currentPage: this.currentPlayerPageIndex.toString(10),
      validPages: this.validPages
    };
    LogService.info('player: sendVopStateChangedNotification', playerState);
    this.veronaPostService.sendVopStateChangedNotification({ playerState }, requested);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
