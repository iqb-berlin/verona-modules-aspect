import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { PlayerConfig, VopStartCommand } from 'player/modules/verona/models/verona';
import { Unit } from 'common/models/unit';
import { LogService } from 'player/modules/logging/services/log.service';
import { InputElement } from 'common/models/elements/element';
import { SanitizationService } from 'common/services/sanitization.service';
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

@Component({
  selector: 'aspect-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
  pages: Page[] = [];
  playerConfig: PlayerConfig = {};

  constructor(public unitStateService: UnitStateService,
              private metaDataService: MetaDataService,
              private veronaPostService: VeronaPostService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private sanitizationService: SanitizationService,
              private anchorService: AnchorService,
              private dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand) => this.configureUnit(message));
  }

  private configureUnit(message: VopStartCommand): void {
    this.reset();
    try {
      if (!message.unitDefinition) {
        throw Error('Unit-Definition nicht gefunden.');
      }
      LogService.debug('player: unitDefinition', message.unitDefinition);
      const unitDefinition = JSON.parse(message.unitDefinition as string);
      if (!VersionManager.hasCompatibleVersion(unitDefinition)) {
        if (VersionManager.isNewer(unitDefinition)) {
          throw Error('Unit-Version ist neuer als dieser Player. Bitte mit der neuesten Version öffnen.');
        }
        throw Error('Unit-Version ist veraltet. Sie kann im neuesten Editor geöffnet und aktualisiert werden.');
      }
      const unit: Unit = new Unit(unitDefinition);
      this.pages = unit.pages;
      this.playerConfig = message.playerConfig || {};
      LogService.info('player: unitStateElementCodes', this.unitStateService.elementCodes);
      this.metaDataService.resourceURL = this.playerConfig.directDownloadUrl;
      this.veronaPostService.sessionID = message.sessionId;
      this.initUnitStateService(message, unit);
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
        this.showErrorDialog('Unit definition konnte nicht gelesen werden!');
      } else if (e instanceof Error) {
        this.showErrorDialog(e.message);
      } else {
        this.showErrorDialog('Unit definition konnte nicht gelesen werden!');
      }
    }
  }

  private showErrorDialog(text: string): void {
    this.dialog.open(UnitDefErrorDialogComponent, {
      data: { text: text },
      disableClose: true
    });
  }

  private initUnitStateService(message: VopStartCommand, unitDefinition: Unit): void {
    this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
      JSON.parse(message.unitState.dataParts.elementCodes) : [];
    unitDefinition.stateVariables
      .map(stateVariable => this.unitStateService
        .registerElement(stateVariable.id, stateVariable.value));
  }

  private reset(): void {
    this.pages = [];
    this.playerConfig = {};
    this.anchorService.reset();
    this.changeDetectorRef.detectChanges();
  }
}
