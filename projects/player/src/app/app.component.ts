import { Component, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';
import { PlayerConfig, VopStartCommand } from './models/verona';
import { UnitStateElementMapperService } from './services/unit-state-element-mapper.service';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { UnitStateService } from './services/unit-state.service';
import { MediaPlayerService } from './services/media-player.service';
import { Page, Unit } from '../../../common/interfaces/unit';
import { UnitDefinitionSanitizer } from '../../../common/util/unit-definition-sanitizer';
import { ValidatorService } from './services/validator.service';
import { UnitFactory } from '../../../common/util/unit.factory';

@Component({
  selector: 'aspect-player',
  template: `
      <aspect-unit-state
          *ngIf="playerConfig && pages?.length"
          [pages]="pages"
          [playerConfig]="playerConfig">
      </aspect-unit-state>
  `
})
export class AppComponent implements OnInit {
  pages!: Page[];
  playerConfig!: PlayerConfig | undefined;

  constructor(private translateService: TranslateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private metaDataService: MetaDataService,
              private nativeEventService: NativeEventService,
              private unitStateService: UnitStateService,
              private mediaPlayerService: MediaPlayerService,
              private unitStateElementMapperService: UnitStateElementMapperService,
              private validatorService: ValidatorService) {
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.veronaPostService.sendVopReadyNotification(this.metaDataService.playerMetadata);
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    registerLocaleData(localeDe);
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private onStart(message: VopStartCommand): void {
    this.reset();
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('player: onStart', message);
      if (message.unitDefinition) {
        const unitDefinition: Unit = UnitFactory.createUnit(
          UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(message.unitDefinition))
        );
        this.unitStateElementMapperService.registerDropListValueIds(unitDefinition);
        this.playerConfig = message.playerConfig || {};
        this.veronaPostService.sessionId = message.sessionId;
        this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
        this.pages = unitDefinition.pages;
        this.unitStateService.unitStateElementCodes = message.unitState?.dataParts?.elementCodes ?
          JSON.parse(message.unitState.dataParts.elementCodes) : [];
        // eslint-disable-next-line no-console
        console.log('player: unitStateElementCodes', this.unitStateService.unitStateElementCodes);
      } else {
        // eslint-disable-next-line no-console
        console.warn('player: message has no unitDefinition');
      }
    });
  }

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }

  private reset(): void {
    // eslint-disable-next-line no-console
    console.log('player: reset');
    this.pages = [];
    this.playerConfig = {};
    this.unitStateService.reset();
    this.mediaPlayerService.reset();
    this.validatorService.reset();
    this.unitStateElementMapperService.reset();
  }
}
