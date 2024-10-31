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
    this.unitService.unit.pages.push(new Page());
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  async deletePage(pageIndex: number): Promise<void> {
    const pageToBeDeleted = this.unitService.unit.pages[pageIndex];
    if (await this.unitService.prepareDelete('page', pageToBeDeleted, pageIndex)) {
      pageToBeDeleted.getAllElements().forEach(el => el.unregisterIDs());
      this.unitService.unit.pages.splice(pageIndex, 1);
      this.selectionService.selectPreviousPage();
      this.unitService.updateSectionCounter();
      this.unitService.updateUnitDefinition();
    }
  }

  moveSelectedPage(pageIndex: number, direction: 'left' | 'right') {
    ArrayUtils.moveArrayItem(
      this.unitService.unit.pages[pageIndex],
      this.unitService.unit.pages,
      direction === 'left' ? 'up' : 'down'
    );
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }
}
