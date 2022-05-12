import { Component, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateService } from '@ngx-translate/core';
import { PlayerConfig, VopStartCommand } from 'player/modules/verona/models/verona';
import { ElementModelElementCodeMappingService } from './services/element-model-element-code-mapping.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { UnitStateService } from './services/unit-state.service';
import { MediaPlayerService } from './services/media-player.service';
import { Page, Unit } from 'common/interfaces/unit';
import { ValidationService } from './services/validation.service';
import { UnitFactory } from 'common/util/unit.factory';
import { SanitizationService } from 'common/services/sanitization.service';
import { UnitUtils } from 'common/util/unit-utils';
import { DragNDropValueObject, UIElement } from 'common/interfaces/elements';
import { LogService } from 'player/modules/logging/services/log.service';
import { DeviceService } from './services/device.service';

@Component({
  selector: 'aspect-player',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isStandalone: boolean;
  pages: Page[] = [];
  playerConfig: PlayerConfig | null = null;

  constructor(public unitStateService: UnitStateService,
              private translateService: TranslateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private metaDataService: MetaDataService,
              private nativeEventService: NativeEventService,
              private mediaPlayerService: MediaPlayerService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private validatorService: ValidationService,
              private deviceService: DeviceService,
              private sanitizationService: SanitizationService) {
    this.isStandalone = window === window.parent;
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initVeronaPostService();
    this.setLocales();
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
    this.nativeEventService.pointerDown
      .subscribe( () => this.deviceService.dontSleep());
  }

  private initVeronaPostService(): void {
    this.veronaPostService.isStandalone = this.isStandalone;
    this.veronaPostService.sendVopReadyNotification(this.metaDataService.playerMetadata);
  }

  private setLocales(): void {
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    registerLocaleData(localeDe);
  }

  private onStart(message: VopStartCommand): void {
    this.reset();
    setTimeout(() => {
      LogService.info('player: onStart', message);
      if (message.unitDefinition) {
        const unitDefinition: Unit = UnitFactory.createUnit(
          this.sanitizationService.sanitizeUnitDefinition(JSON.parse(message.unitDefinition))
        );
        this.configureSession(message, unitDefinition);
      } else {
        LogService.warn('player: message has no unitDefinition');
      }
    });
  }

  private configureSession(message: VopStartCommand, unitDefinition: Unit): void {
    this.pages = unitDefinition.pages;
    this.playerConfig = message.playerConfig || {};
    this.configureServices(message);
    LogService.info('player: unitStateElementCodes', this.unitStateService.elementCodes);
  }

  private configureServices(message: VopStartCommand): void {
    this.configureElementModelElementCodeMappingService();
    this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
      JSON.parse(message.unitState.dataParts.elementCodes) : [];
    this.veronaPostService.sessionId = message.sessionId;
    this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
  }

  private configureElementModelElementCodeMappingService(): void {
    this.elementModelElementCodeMappingService.dragNDropValueObjects = (
      UnitUtils
        .findUIElements(this.pages, 'drop-list')
        .concat(UnitUtils.findUIElements(this.pages, 'drop-list-simple'))
        .reduce(
          (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
            (currentValue.value && (currentValue.value as DragNDropValueObject[]).length) ?
              accumulator.concat(currentValue.value as DragNDropValueObject) :
              accumulator), []
        ));
  }

  private onFocus(focused: boolean): void {
    LogService.info('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }

  private reset(): void {
    LogService.info('player: reset');
    this.pages = [];
    this.playerConfig = null;
    this.unitStateService.reset();
    this.mediaPlayerService.reset();
    this.validatorService.reset();
    this.elementModelElementCodeMappingService.reset();
  }
}
