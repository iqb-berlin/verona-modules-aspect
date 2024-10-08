import { Injectable } from '@angular/core';
import { Page } from 'common/models/page';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { ArrayUtils } from 'common/util/array';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  constructor(private unitService: UnitService,
              private selectionService: SelectionService) { }

  addPage(): void {
    this.unitService.updateUnitDefinition({
      title: 'Seite hinzugefügt',
      command: () => {
        this.unitService.unit.pages.push(new Page());
        return {};
      },
      rollback: () => {
        this.unitService.unit.pages.splice(this.unitService.unit.pages.length - 1, 1);
      }
    });
  }

  async deletePage(pageIndex: number): Promise<void> {
    this.unitService.updateUnitDefinition({
      title: 'Seite gelöscht',
      command: async () => {
        const selectedPage = this.unitService.unit.pages[this.selectionService.selectedPageIndex];
        if (await this.unitService.prepareDelete('page', selectedPage)) {
          this.unitService.unregisterIDs(selectedPage.getAllElements());
          const deletedpage = this.unitService.unit.pages.splice(pageIndex, 1)[0];
          this.selectionService.selectPreviousPage();
          this.unitService.updateSectionCounter();
          return {
            pageIndex,
            deletedpage
          };
        }
        return {};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        this.unitService.registerIDs((deletedData.deletedpage as Page).getAllElements());
        this.unitService.unit.pages.splice(deletedData.pageIndex as number, 0, deletedData.deletedpage as Page);
        this.unitService.updateSectionCounter();
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
        this.unitService.updateSectionCounter();
        return { direction };
      },
      rollback: () => {
        ArrayUtils.moveArrayItem(
          this.unitService.unit.pages[pageIndex],
          this.unitService.unit.pages,
          direction === 'left' ? 'up' : 'down'
        );
        this.unitService.updateSectionCounter();
      }
    });
  }
}
