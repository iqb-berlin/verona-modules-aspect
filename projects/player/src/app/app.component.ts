import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Unit, UnitPage } from '../../../common/unit';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import {
  PlayerConfig,
  VopStartCommand
} from './models/verona';

@Component({
  selector: 'player-aspect',
  template: `
    <app-form *ngIf="playerConfig" [pages]=pages [playerConfig]=playerConfig></app-form>
  `
})
export class AppComponent {
  form!: FormGroup;
  pages!: UnitPage[];
  playerConfig!: PlayerConfig;

  constructor(public translateService: TranslateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private nativeEventService: NativeEventService) {
    this.initSubscriptions();
    veronaPostService.sendVopReadyNotification();
    translateService.addLangs(['de']);
    translateService.setDefaultLang('de');
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.nativeEventService.scrollY
      .subscribe((y: number): void => this.onScrollY(y));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private onStart(message: VopStartCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onStart', message);
    const unit: Unit = message.unitDefinition ? JSON.parse(message.unitDefinition) : [];
    this.pages = unit.pages;
    this.playerConfig = message.playerConfig || {};
    this.veronaPostService.sessionId = message.sessionId;
  }

  private onScrollY = (y: number): void => {
    // eslint-disable-next-line no-console
    console.log('player: onScrollY', y);
  };

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }
}
