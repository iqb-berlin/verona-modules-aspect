import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileService } from 'common/services/file.service';
import { Page } from 'common/interfaces/unit';
import { ElementCode, PagingMode, UnitState, VopStartCommand } from 'verona/models/verona';

@Component({
  selector: 'aspect-unit-definition-menu',
  templateUrl: './unit-definition-menu.component.html',
  styleUrls: ['./unit-definition-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitDefinitionMenuComponent {
  @Input() scrollPages!: Page[];
  @Input() elementCodes!: ElementCode[];

  private message: VopStartCommand = {
    type: 'vopStartCommand',
    sessionId: 'dev',
    unitDefinition: undefined,
    playerConfig: {
      pagingMode: undefined
    },
    unitState: undefined
  };

  async load(pagingMode: PagingMode): Promise<void> {
    await this.loadUnit(await FileService.loadFile(['.json']), pagingMode, {});
  }

  reloadUnit(): void {
    this.message.unitState = { dataParts: { elementCodes: JSON.stringify(this.elementCodes) } };
    this.postMessage();
  }

  loadUnit(unitDefinition: string, pagingMode: PagingMode, unitSate: UnitState): void {
    this.message.unitDefinition = unitDefinition;
    this.message.playerConfig = { pagingMode };
    this.message.unitState = unitSate;
    this.postMessage();
  }

  postMessage() : void {
    window.postMessage(this.message, '*');
  }

  goToPage(pageIndex: number) {
    window.postMessage({
      type: 'vopPageNavigationCommand',
      sessionId: 'dev',
      target: pageIndex
    }, '*');
  }
}
