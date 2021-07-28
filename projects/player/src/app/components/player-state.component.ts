import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UnitPage } from '../../../../common/unit';
import { VeronaSubscriptionService } from '../services/verona-subscription.service';
import {
  PlayerState,
  RunningState, VopContinueCommand, VopGetStateRequest, VopPageNavigationCommand, VopStopCommand
} from '../models/verona';
import { VeronaPostService } from '../services/verona-post.service';

@Component({
  selector: 'app-player-state',
  template: `
      <div *ngIf="!running" class='stopped-overlay'></div>
      <mat-tab-group [(selectedIndex)]="currentIndex"
                     (selectedIndexChange)="onSelectedIndexChange()"
                     mat-align-tabs="start">
          <mat-tab *ngFor="let page of pages; let i = index" label="{{page.label}}">
              <app-page [parentForm]="parenForm" [page]="page"></app-page>
          </mat-tab>
      </mat-tab-group>
  `,
  styles: [
    '.stopped-overlay {position: fixed; width: 100%; height: 100%; background-color: rgba(0,0,0,0.3); z-index: 1000}'
  ]
})
export class PlayerStateComponent implements OnInit, OnDestroy {
  @Input() parenForm!: FormGroup;
  @Input() pages!: UnitPage[];
  @Input() validPages!: Record<string, string>[];
  currentIndex: number = 0;
  running: boolean = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService) {
  }

  private get state(): RunningState {
    return this.running ? 'running' : 'stopped';
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.sendVopStateChangedNotification();
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

  onSelectedIndexChange(): void {
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
    this.currentIndex = parseInt(message.target, 10);
  }

  private sendVopStateChangedNotification(): void {
    const playerState: PlayerState = {
      state: this.state,
      currentPage: this.currentIndex.toString(10),
      validPages: this.validPages
    };
    this.veronaPostService.sendVopStateChangedNotification({ playerState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
