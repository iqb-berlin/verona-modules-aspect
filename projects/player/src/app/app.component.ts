import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { PlayerConfig, UnitState, VopStartCommand } from './models/verona';
import { FormPage } from '../../../common/form';

@Component({
  selector: 'player-aspect',
  template: `
    <app-form *ngIf="playerConfig" [pages]=pages [playerConfig]=playerConfig></app-form>
  `
})
export class AppComponent implements OnInit {
  form!: FormGroup;
  pages!: UnitPage[];
  playerConfig!: PlayerConfig;

  constructor(private translateService: TranslateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private metaDataService: MetaDataService,
              private nativeEventService: NativeEventService) {
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.veronaPostService.sendVopReadyNotification(this.metaDataService.playerMetadata);
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
  }

  private initSubscriptions(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.nativeEventService.scrollY
      .subscribe((y: number): void => this.onScrollY(y));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private initUnit(pages: UnitPage[], unitState: UnitState | undefined): void {
    const storedPages: FormPage[] = unitState?.dataParts?.pages ?
      JSON.parse(unitState.dataParts.pages) : [];
    if (storedPages.length > 0) {
      if (unitState?.unitStateDataType &&
        this.metaDataService.verifyUnitStateDataType(unitState.unitStateDataType)) {
        this.pages = this.addStoredValues(pages, storedPages);
      } else {
        // eslint-disable-next-line no-console
        console.warn('player: wrong unitStateDataType');
        this.pages = pages;
      }
    } else {
      this.pages = pages;
    }
  }

  private onStart(message: VopStartCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onStart', message);
    const unitDefinition: Unit = message.unitDefinition ? JSON.parse(message.unitDefinition) : {};
    if (unitDefinition.veronaModuleVersion &&
      this.metaDataService.verifyUnitDefinitionVersion(unitDefinition.veronaModuleVersion)) {
      this.veronaPostService.sessionId = message.sessionId;
      this.playerConfig = message.playerConfig || {};
      this.initUnit(unitDefinition.pages, message.unitState);
    } else {
      // eslint-disable-next-line no-console
      console.warn('player: wrong unitDefinitionType');
    }
  }

  private addStoredValues = (unitPages: UnitPage[], storedPages: FormPage[]): UnitPage[] => unitPages
    .map((page: UnitPage, pageIndex: number): UnitPage => ({
      ...page,
      sections: page.sections.map((section: UnitPageSection, sectionIndex: number): UnitPageSection => (
        {
          ...section,
          elements: section.elements
            .map((element: UnitUIElement): UnitUIElement => {
              const storedValueElement: Record<string, string | number | boolean | undefined> =
                storedPages?.[pageIndex]?.sections?.[sectionIndex]?.elements?.find(
                  (storedElement: Record<string, string | number | boolean | undefined>) => Object
                    .keys(storedElement)[0] === element.id
                ) || {};
              const value = storedValueElement[Object.keys(storedValueElement)[0]];
              return {
                ...element,
                ...{ value: (value !== undefined && value !== null) ? value : element.value }
              };
            })
        }))
    }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onScrollY = (y: number): void => {
  };

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }
}
