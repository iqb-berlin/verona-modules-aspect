import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PlayerConfig, VopStartCommand } from 'player/modules/verona/models/verona';
import { Unit } from 'common/models/unit';
import { LogService } from 'player/modules/logging/services/log.service';
import { UnitUtils } from 'common/util/unit-utils';
import { DragNDropValueObject, UIElement } from 'common/models/elements/element';
import { SanitizationService } from 'common/services/sanitization.service';
import { Page } from 'common/models/page';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
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

  private configureUnit( message: VopStartCommand): void {
    this.reset();
    setTimeout(() => {
      if (message.unitDefinition) {
        const unitDefinition: Unit = new Unit(
          this.sanitizationService.sanitizeUnitDefinition(JSON.parse(message.unitDefinition))
        );
        this.configurePlayerAndPages(message, unitDefinition);
        this.configureServices(message);
      } else {
        LogService.warn('player: message has no unitDefinition');
      }
    });
  }

  private configurePlayerAndPages(message: VopStartCommand, unitDefinition: Unit): void {
    this.pages = unitDefinition.pages;
    this.playerConfig = message.playerConfig || {};
    LogService.info('player: unitStateElementCodes', this.unitStateService.elementCodes);
  }

  private configureServices(message: VopStartCommand): void {
    this.veronaPostService.sessionId = message.sessionId;
    this.veronaPostService.stateReportPolicy = message.playerConfig?.stateReportPolicy || 'none';
    this.configureElementModelElementCodeMappingService();
    this.unitStateService.elementCodes = message.unitState?.dataParts?.elementCodes ?
      JSON.parse(message.unitState.dataParts.elementCodes) : [];
  }

  private configureElementModelElementCodeMappingService(): void {
    this.elementModelElementCodeMappingService.dragNDropValueObjects =
      UnitUtils
        .findUIElements(this.pages, 'drop-list')
        .concat(UnitUtils.findUIElements(this.pages, 'drop-list-simple'))
        .reduce(
          (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
            (currentValue.value && (currentValue.value as DragNDropValueObject[]).length) ?
              accumulator.concat(currentValue.value as DragNDropValueObject) :
              accumulator), []
        );
  }

  private reset(): void {
    this.pages = [];
    this.playerConfig = null;
    this.changeDetectorRef.detectChanges();
  }
}
