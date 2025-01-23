import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  PlayerConfig,
  Progress,
  VopPlayerConfigChangedNotification,
  VopStartCommand
} from 'player/modules/verona/models/verona';
import { Unit } from 'common/models/unit';
import { LogService } from 'player/modules/logging/services/log.service';
import { InputElement } from 'common/models/elements/element';
import { Page } from 'common/models/page';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { MetaDataService } from 'player/src/app/services/meta-data.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { VersionManager } from 'common/services/version-manager';
import { MatDialog } from '@angular/material/dialog';
import { UnitDefErrorDialogComponent } from 'common/components/unit-def-error-dialog.component';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { TranslateService } from '@ngx-translate/core';
import { SectionCounter } from 'common/util/section-counter';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { BehaviorSubject } from 'rxjs';
import { DragNDropValueObject } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

@Component({
  selector: 'aspect-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
  pages: Page[] = [];
  playerConfig: PlayerConfig = {};
  showUnitNavNext: boolean = false;
  sectionNumbering: { enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above' } = {
    enableSectionNumbering: false,
    sectionNumberingPosition: 'left'
  };

  presentationProgressStatus: BehaviorSubject<Progress> = new BehaviorSubject<Progress>('none');

  constructor(public unitStateService: UnitStateService,
              public stateVariableStateService: StateVariableStateService,
              private metaDataService: MetaDataService,
              private veronaPostService: VeronaPostService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private anchorService: AnchorService,
              private dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef,
              private translateService: TranslateService,
              private navigationService: NavigationService) {
  }

  ngOnInit(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand) => this.configureUnit(message));
    this.veronaSubscriptionService.vopPlayerConfigChangedNotification
      .subscribe((message: VopPlayerConfigChangedNotification) => this.setPlayerConfig(message.playerConfig || {}));
  }

  private configureUnit(message: VopStartCommand): void {
    this.reset();
    setTimeout(() => {
      if (message.unitDefinition) {
        try {
          LogService.debug('player: unitDefinition', message.unitDefinition);
          const unitDefinition = JSON.parse(message.unitDefinition as string);
          this.checkUnitDefinitionVersion(unitDefinition);
          const unit: Unit = new Unit(unitDefinition);
          this.pages = unit.pages;
          this.sectionNumbering = {
            enableSectionNumbering: unit.enableSectionNumbering,
            sectionNumberingPosition: unit.sectionNumberingPosition
          };
          this.showUnitNavNext = unit.showUnitNavNext;
          this.setPlayerConfig(message.playerConfig || {});
          this.metaDataService.resourceURL = this.playerConfig.directDownloadUrl;
          this.veronaPostService.sessionID = message.sessionId;
          this.initElementCodes(message, unit);
          this.elementModelElementCodeMappingService.dragNDropValueObjects = [
            ...unit.getAllElements('drop-list'),
            ...unit.getAllElements('drop-list-simple')]
            .map(element => ((element as InputElement).value as DragNDropValueObject[]))
            .flat();
          this.setStartPage();
        } catch (e: unknown) {
          // eslint-disable-next-line no-console
          console.error(e);
          if (e instanceof InstantiationEror) {
            // eslint-disable-next-line no-console
            console.error('Failing element blueprint: ', e.faultyBlueprint);
            this.showErrorDialog(this.translateService.instant('errorMessage.unitDefinitionIsNotReadable'));
          } else if (e instanceof Error) {
            this.showErrorDialog(e.message);
          } else {
            this.showErrorDialog(this.translateService.instant('errorMessage.unitDefinitionIsNotReadable'));
          }
        }
      } else {
        LogService.warn('player: message has no unitDefinition');
      }
    });
  }

  private setPlayerConfig(playerConfig: PlayerConfig): void {
    this.playerConfig = playerConfig;
    this.navigationService.enabledNavigationTargets.next(playerConfig.enabledNavigationTargets);
  }

  private setStartPage(): void {
    if (this.playerConfig.startPage !== undefined) {
      const startPage = +this.playerConfig.startPage || 0;
      // delay is needed for scroll and snap scroll pages to work
      setTimeout(() => this.navigationService.setPage(startPage), 10);
    }
  }

  private checkUnitDefinitionVersion(unitDefinition: Record<string, unknown>): void {
    if (unitDefinition.version !== VersionManager.getCurrentVersion()) {
      if (!VersionManager.hasCompatibleVersion(unitDefinition) && VersionManager.isNewer(unitDefinition)) {
        throw Error(this.translateService.instant('errorMessage.unitDefinitionIsNewer'));
      }
      throw Error(this.translateService.instant('errorMessage.unitDefinitionIsOutdated'));
    }
  }

  private showErrorDialog(text: string): void {
    this.dialog.open(UnitDefErrorDialogComponent, {
      data: { text: text },
      disableClose: true
    });
  }

  private initElementCodes(message: VopStartCommand, unitDefinition: Unit): void {
    this.unitStateService
      .setElementCodes(message.unitState?.dataParts?.elementCodes ?
        JSON.parse(message.unitState.dataParts.elementCodes) : [],
      unitDefinition.getAllElements().map(element => element.getIdentifiers()).flat());

    this.stateVariableStateService
      .setElementCodes(message.unitState?.dataParts?.stateVariableCodes ?
        JSON.parse(message.unitState.dataParts.stateVariableCodes) : [],
      unitDefinition.stateVariables.map(stateVariable => ({ id: stateVariable.id, alias: stateVariable.alias })));

    unitDefinition.stateVariables
      .map(stateVariable => this.stateVariableStateService
        .registerElementCode(stateVariable.id, stateVariable.alias, stateVariable.value));
  }

  private reset(): void {
    this.presentationProgressStatus.next('none');
    this.pages = [];
    this.playerConfig = {};
    this.anchorService.reset();
    SectionCounter.reset();
    this.changeDetectorRef.detectChanges();
  }
}
