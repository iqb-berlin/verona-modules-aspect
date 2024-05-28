import { Injectable } from '@angular/core';
import { Page } from 'common/models/page';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { MessageService } from 'common/services/message.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { ArrayUtils } from 'common/util/array';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  constructor(private unitService: UnitService,
              private messageService: MessageService,
              private selectionService: SelectionService) { }

  addPage(): void {
    this.unitService.updateUnitDefinition({
      title: 'Seite hinzugefügt',
      command: () => {
        this.unitService.unit.pages.push(new Page());
        this.selectionService.selectedPageIndex = this.unitService.unit.pages.length - 1; // TODO selection stuff here is not good
        return {};
      },
      rollback: () => {
        this.unitService.unit.pages.splice(this.unitService.unit.pages.length - 1, 1);
        this.selectionService.selectPreviousPage();
      }
    });
  }

  deletePage(pageIndex: number): void {
    this.unitService.updateUnitDefinition({
      title: 'Seite gelöscht',
      command: () => {
        const deletedpage = this.unitService.unit.pages.splice(pageIndex, 1)[0];
        return {
          pageIndex,
          deletedpage
        };
      },
      rollback: (deletedData: Record<string, unknown>) => {
        this.unitService.unit.pages.splice(deletedData['pageIndex'] as number, 0, deletedData['deletedpage'] as Page);
      }
    });
  }

  moveSelectedPage(pageIndex: number, direction: 'left' | 'right') {
    this.unitService.updateUnitDefinition({
      title: 'Seite verschoben',
      command: () => {
        ArrayUtils.moveArrayItem(
          this.unitService.unit.pages[pageIndex],
          this.unitService.unit.pages,
          direction === 'left' ? 'up' : 'down'
        );
        return {direction};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        ArrayUtils.moveArrayItem(
          this.unitService.unit.pages[pageIndex],
          this.unitService.unit.pages,
          direction === 'left' ? 'up' : 'down'
        );
      }
    });
  }
}
