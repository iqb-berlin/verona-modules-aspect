import { Component, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Unit } from '../../../common/models/unit';
import { PlayerConfig, VopStartCommand } from './models/verona';
import { UnitStateElementMapperService } from './services/unit-state-element-mapper.service';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { UnitStateService } from './services/unit-state.service';
import { MediaPlayerService } from './services/media-player.service';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { Page } from '../../../common/models/page';

@Component({
  selector: 'aspect-player',
  template: `
      <aspect-unit-state *ngIf="playerConfig && pages?.length"
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
              private dialog: MatDialog) {
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
        const unitDefinition: Unit = new Unit(JSON.parse(message.unitDefinition));
        this.unitStateElementMapperService.registerDropListValueIds(unitDefinition);
        if (this.metaDataService.verifyUnitDefinitionVersion(unitDefinition.unitDefinitionType)) {
          this.playerConfig = message.playerConfig || {};
          this.veronaPostService.sessionId = message.sessionId;
          this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
          this.pages = unitDefinition.pages;
          this.unitStateService.unitStateElementCodes = message.unitState?.dataParts?.elementCodes ?
            JSON.parse(message.unitState.dataParts.elementCodes) : [];
          // eslint-disable-next-line no-console
          console.log('player: unitStateElementCodes', this.unitStateService.unitStateElementCodes);
        } else {
          this.dialog.open(AlertDialogComponent, {
            data: {
              title: this.translateService.instant('dialogTitle.wrongUnitDefinitionType'),
              content: this.translateService.instant('dialogContent.wrongUnitDefinitionType',
                { version: this.metaDataService.playerMetadata.supportedUnitDefinitionTypes })
            }
          });
        }
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
    this.unitStateElementMapperService.reset();
  }
}
