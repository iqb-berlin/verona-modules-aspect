import { Injectable } from '@angular/core';
import { Page } from 'common/models/page';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { MessageService } from 'common/services/message.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  unit = this.unitService.unit;

  constructor(private unitService: UnitService,
              private messageService: MessageService,
              private selectionService: SelectionService) { }

  addPage(): void {
    this.unitService.updateUnitDefinition({
      title: 'Seite hinzugefügt',
      command: () => {
        this.unit.pages.push(new Page());
        this.selectionService.selectedPageIndex = this.unit.pages.length - 1; // TODO selection stuff here is not good
        return {};
      },
      rollback: () => {
        this.unit.pages.splice(this.unit.pages.length - 1, 1);
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
        this.unit.pages.splice(deletedData['pageIndex'] as number, 0, deletedData['deletedpage'] as Page);
      }
    });
  }

  moveSelectedPage(direction: 'left' | 'right') {
    if (this.unit.canPageBeMoved(this.selectionService.selectedPageIndex, direction)) {
      this.unit.movePage(this.selectionService.selectedPageIndex, direction);
      this.unitService.updateUnitDefinition();
    } else {
      this.messageService.showWarning('Seite kann nicht verschoben werden.');
    }
  }
}
