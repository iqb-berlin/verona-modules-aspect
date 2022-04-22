import { Component, Input } from '@angular/core';
import { FileService } from '../../../../../editor/src/app/services/file.service';
import { Page } from 'common/interfaces/unit';
import { PagingMode } from '../../../verona/models/verona';

@Component({
  selector: 'aspect-unit-definition-menu',
  templateUrl: './unit-definition-menu.component.html',
  styleUrls: ['./unit-definition-menu.component.scss']
})
export class UnitDefinitionMenuComponent {
  @Input() scrollPages!: Page[];

  async load(pagingMode: PagingMode): Promise<void> {
    await this.loadUnitDefinition(await FileService.loadFile(['.json']), pagingMode);
  }

  loadUnitDefinition(unitDefinition: string, pagingMode: PagingMode): void {
    window.postMessage({
      type: 'vopStartCommand',
      sessionId: 'dev',
      unitDefinition: unitDefinition,
      playerConfig: {
        pagingMode: pagingMode
      }
    }, '*');
  }

  goToPage(pageIndex: number) {
    window.postMessage({
      type: 'vopPageNavigationCommand',
      sessionId: 'dev',
      target: pageIndex
    }, '*');
  }

}
