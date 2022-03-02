import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import {
  PlayerConfig, PlayerState, RunningState,
  VopContinueCommand, VopGetStateRequest, VopPageNavigationCommand, VopStopCommand
} from '../../models/verona';
import { VeronaPostService } from '../../services/verona-post.service';
import { Page } from '../../../../../common/interfaces/unit';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'aspect-player-state',
  templateUrl: './player-state.component.html',
  styleUrls: ['./player-state.component.css']
})
export class PlayerStateComponent implements OnInit, OnDestroy {
  @Input() pages!: Page[];
  @Input() playerConfig!: PlayerConfig;

  currentPlayerPageIndex: number = 0;
  selectIndex: Subject<number> = new Subject();
  running: boolean = true;
  validPages!: Record<string, string>;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.navigationService.pageIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageIndex: number): void => this.selectIndex.next(pageIndex));
    this.veronaSubscriptionService.vopPageNavigationCommand
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopPageNavigationCommand): void => this.selectIndex.next(Number(message.target)));
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

  onValidPagesDetermined(validPages: Record<string, string>): void {
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
    this.sendVopStateChangedNotification(true);
  }

  private sendVopStateChangedNotification(requested:boolean = false): void {
    const playerState: PlayerState = {
      state: this.state,
      currentPage: this.currentPlayerPageIndex.toString(10),
      validPages: this.validPages
    };
    // eslint-disable-next-line no-console
    console.log('player: playerState sendVopStateChangedNotification', playerState);
    this.veronaPostService.sendVopStateChangedNotification({ playerState }, requested);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
