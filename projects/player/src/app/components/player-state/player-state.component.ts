import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UnitPage } from '../../../../../common/unit';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import {
  PlayerConfig, PlayerState, RunningState,
  VopContinueCommand, VopGetStateRequest, VopPageNavigationCommand, VopStopCommand
} from '../../models/verona';
import { VeronaPostService } from '../../services/verona-post.service';

@Component({
  selector: 'app-player-state',
  templateUrl: './player-state.component.html',
  styleUrls: ['./player-state.component.css']
})
export class PlayerStateComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Input() pages!: UnitPage[];
  @Input() playerConfig!: PlayerConfig;

  currentPlayerPageIndex: number = 0;
  running: boolean = true;
  validPages!: Record<string, string> [];

  private ngUnsubscribe = new Subject<void>();

  constructor(private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService) {
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopPageNavigationCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopPageNavigationCommand): void => this.onPageNavigation(message));
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
    return this.running ? 'running' : 'stopped';
  }

  onSelectedIndexChange(): void {
    this.sendVopStateChangedNotification();
  }

  onValidPagesDetermined(validPages: Record<string, string>[]): void {
    this.validPages = validPages;
    this.sendVopStateChangedNotification();
  }

  private onContinue(message: VopContinueCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onContinue', message);
    this.running = true;
    this.sendVopStateChangedNotification();
  }

  private onStop(message: VopStopCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onStop', message);
    this.running = false;
    this.sendVopStateChangedNotification();
  }

  private onGetStateRequest(message: VopGetStateRequest): void {
    // eslint-disable-next-line no-console
    console.log('player: onGetStateRequest', message);
    if (message.stop) {
      this.running = false;
    }
    this.sendVopStateChangedNotification();
  }

  private onPageNavigation(message: VopPageNavigationCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onPageNavigation', message);
    this.currentPlayerPageIndex = parseInt(message.target, 10);
  }

  private sendVopStateChangedNotification(): void {
    const playerState: PlayerState = {
      state: this.state,
      currentPage: this.currentPlayerPageIndex.toString(10),
      validPages: this.validPages
    };
    this.veronaPostService.sendVopStateChangedNotification({ playerState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
