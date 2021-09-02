import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import { MetaDataService } from './services/meta-data.service';
import { PlayerConfig, UnitState, VopStartCommand } from './models/verona';
import { FormPage } from '../../../common/form';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'player-aspect',
  template: `
    <app-unit-state *ngIf="playerConfig" [pages]=pages [playerConfig]=playerConfig></app-unit-state>
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
              private nativeEventService: NativeEventService,
              private dialog: MatDialog) {
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
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private initUnitPages(pages: UnitPage[], unitState: UnitState | undefined): void {
    const storedPages: FormPage[] = unitState?.dataParts?.pages ?
      JSON.parse(unitState.dataParts.pages) : [];
    if (storedPages.length > 0) {
      if (this.metaDataService.verifyUnitStateDataType(unitState?.unitStateDataType)) {
        this.pages = this.addStoredValues(pages, storedPages);
      } else {
        // eslint-disable-next-line no-console
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translateService.instant('dialogTitle.wrongUnitStateDataType'),
            content: this.translateService.instant('dialogContent.wrongUnitStateDataType',
              { version: this.metaDataService.playerMetadata.supportedUnitStateDataTypes })
          }
        });
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
    if (this.metaDataService.verifyUnitDefinitionVersion(unitDefinition.veronaModuleVersion)) {
      this.playerConfig = message.playerConfig || {};
      this.veronaPostService.sessionId = message.sessionId;
      this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
      this.initUnitPages(unitDefinition.pages, message.unitState);
    } else {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translateService.instant('dialogTitle.wrongUnitDefinitionType'),
          content: this.translateService.instant('dialogContent.wrongUnitDefinitionType',
            { version: this.metaDataService.playerMetadata.supportedUnitDefinitionTypes })
        }
      });
    }
  }

  // structure of a unitPage:   {sections: [{elements: [{id: ..., value: ...}]}]}
  // structure of a storedPage: {sections: [{elements: [{[id]: [value]}]}]}
  // the array of unitPages contains all pages, all sections and all elements
  // the array of storedPages contains all pages, all sections but only form elements
  // to add the values of the elements of storedPages to the elements of unitPages
  // we need to find the elements in storedPages that match the elements of unitPages
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

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }
}
