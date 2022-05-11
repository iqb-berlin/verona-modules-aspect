import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileService } from 'common/services/file.service';
import { Page } from 'common/interfaces/unit';
import {
  ElementCode, PagingMode, UnitState, VopPageNavigationCommand, VopStartCommand
} from 'player/modules/verona/models/verona';

@Component({
  selector: 'aspect-unit-definition-menu',
  templateUrl: './unit-definition-menu.component.html',
  styleUrls: ['./unit-definition-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitDefinitionMenuComponent {
  @Input() scrollPages!: Page[];
  @Input() elementCodes!: ElementCode[];

  private vopStartCommandMessage: VopStartCommand = {
    type: 'vopStartCommand',
    sessionId: 'dev',
    unitDefinition: undefined,
    playerConfig: {
      pagingMode: undefined
    },
    unitState: undefined
  };

  private vopPageNavigationCommandMessage: VopPageNavigationCommand = {
    type: 'vopPageNavigationCommand',
    sessionId: 'dev',
    target: '0'
  };

  async load(pagingMode: PagingMode): Promise<void> {
    await this.loadUnit(await FileService.loadFile(['.json']), pagingMode, {});
  }

  reloadUnit(): void {
    this.vopStartCommandMessage.unitState = { dataParts: { elementCodes: JSON.stringify(this.elementCodes) } };
    this.postMessage(this.vopStartCommandMessage);
  }

  goToPage(pageIndex: number) {
    this.vopPageNavigationCommandMessage.target = pageIndex.toString();
    window.postMessage( this.vopPageNavigationCommandMessage, '*');
  }

  private loadUnit(unitDefinition: string, pagingMode: PagingMode, unitSate: UnitState): void {
    this.vopStartCommandMessage.unitDefinition = unitDefinition;
    this.vopStartCommandMessage.playerConfig = { pagingMode };
    this.vopStartCommandMessage.unitState = unitSate;
    this.postMessage(this.vopStartCommandMessage);
  }

  private postMessage = (message: VopStartCommand | VopPageNavigationCommand): void => {
    window.postMessage(message, '*');
  };
}
