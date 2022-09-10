import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PlayerConfig, VopStartCommand } from 'player/modules/verona/models/verona';
import { Unit } from 'common/models/unit';
import { LogService } from 'player/modules/logging/services/log.service';
import { DragNDropValueObject, InputElement } from 'common/models/elements/element';
import { SanitizationService } from 'common/services/sanitization.service';
import { Page } from 'common/models/page';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { IDManager } from 'common/util/id-manager';

@Component({
  selector: 'aspect-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
  idManager = IDManager.getInstance();
  pages: Page[] = [];
  playerConfig: PlayerConfig | null = null;

  constructor(public unitStateService: UnitStateService,
              private veronaPostService: VeronaPostService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              private sanitizationService: SanitizationService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand) => this.configureUnit(message));
  }

  private configureUnit(message: VopStartCommand): void {
    this.reset();

    if (message.unitDefinition) {
      const unitDefinition: Unit = new Unit(
        this.sanitizationService.sanitizeUnitDefinition(JSON.parse(message.unitDefinition))
      );
      LogService.info('player: unitDefinition', unitDefinition);
      this.pages = unitDefinition.pages;
      this.playerConfig = message.playerConfig || {};
      LogService.info('player: unitStateElementCodes', this.unitStateService.elementCodes);
      this.veronaPostService.sessionId = message.sessionId;
      this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
      this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
        JSON.parse(message.unitState.dataParts.elementCodes) : [];
      this.elementModelElementCodeMappingService.dragNDropValueObjects = [
        ...unitDefinition.getAllElements('drop-list'),
        ...unitDefinition.getAllElements('drop-list-simple')]
        .map(element => ((element as InputElement).value as DragNDropValueObject[])).flat();
    } else {
      LogService.warn('player: message has no unitDefinition');
    }
  }

  private reset(): void {
    this.idManager.reset();
    this.pages = [];
    this.playerConfig = null;
    this.changeDetectorRef.detectChanges();
  }
}
