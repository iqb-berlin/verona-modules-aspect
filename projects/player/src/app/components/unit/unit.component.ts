import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PlayerConfig, VopStartCommand } from 'player/modules/verona/models/verona';
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
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { VersionManager } from 'common/services/version-manager';
import { InstantiationEror } from 'common/util/errors';
import { MatDialog } from '@angular/material/dialog';
import { UnitDefErrorDialogComponent } from 'common/components/unit-def-error-dialog.component';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'aspect-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
  pages: Page[] = [];
  playerConfig: PlayerConfig = {};

  constructor(public unitStateService: UnitStateService,
              public stateVariableStateService: StateVariableStateService,
              private metaDataService: MetaDataService,
              private veronaPostService: VeronaPostService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private anchorService: AnchorService,
              private dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand) => this.configureUnit(message));
  }

  private configureUnit(message: VopStartCommand): void {
    this.reset();
    if (message.unitDefinition) {
      try {
        LogService.debug('player: unitDefinition', message.unitDefinition);
        const unitDefinition = JSON.parse(message.unitDefinition as string);
        this.checkUnitDefinitionVersion(unitDefinition);
        const unit: Unit = new Unit(unitDefinition);
        this.pages = unit.pages;
        this.playerConfig = message.playerConfig || {};
        this.metaDataService.resourceURL = this.playerConfig.directDownloadUrl;
        this.veronaPostService.sessionID = message.sessionId;
        this.initElementCodes(message, unit);
        this.elementModelElementCodeMappingService.dragNDropValueObjects = [
          ...unit.getAllElements('drop-list'),
          ...unit.getAllElements('drop-list-simple')]
          .map(element => ((element as InputElement).value as DragNDropValueObject[])).flat();
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
    this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
      JSON.parse(message.unitState.dataParts.elementCodes) : [];
    this.stateVariableStateService.elementCodes = message.unitState?.dataParts?.stateVariableCodes ?
      JSON.parse(message.unitState.dataParts.stateVariableCodes) : [];
    unitDefinition.stateVariables
      .map(stateVariable => this.stateVariableStateService
        .registerElementCode(stateVariable.id, stateVariable.value));
  }

  private reset(): void {
    this.pages = [];
    this.playerConfig = {};
    this.anchorService.reset();
    this.changeDetectorRef.detectChanges();
  }
}
