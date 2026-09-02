import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { ArrayUtils } from 'common/utils/array-utils';
import { EditorPage } from 'editor/src/app/models/editor-page';

/**
 * The three things that can happen to a whole page: adding, deleting, moving. Each of them renumbers
 * the sections and marks the unit as changed, which is why they belong together rather than in the
 * components that offer the buttons.
 */
@Injectable({
  providedIn: 'root'
})
export class PageService {
  constructor(private unitService: UnitService,
              private selectionService: SelectionService) { }

  /** Appends an empty page. Selecting it is left to the caller, and `UnitViewComponent` does it, so the
      author ends up on the new page. */
  addPage(): void {
    this.unitService.unit.pages.push(new EditorPage());
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  /**
   * Deletes a page after asking, where asking is due -- `prepareDelete` puts the question and reports
   * whether it may go ahead, and a refusal leaves everything as it is.
   *
   * Every element of the page gives its id and alias back first, so the names are free again; then the
   * page before it is selected.
   */
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

  /**
   * Moves a page one place to the left or right and follows it with the selection.
   *
   * Neither part checks whether the move is possible: at the end of the row the page would stay put
   * while the selection moved on to its neighbour. What keeps that from happening is the page menu,
   * which disables each button on its own edge.
   */
  moveSelectedPage(pageIndex: number, direction: 'left' | 'right') {
    ArrayUtils.moveArrayItem(
      this.unitService.unit.pages[pageIndex],
      this.unitService.unit.pages,
      direction === 'left' ? 'up' : 'down'
    );
    this.selectionService.selectPage(direction === 'left' ?
      this.selectionService.selectedPageIndex - 1 : this.selectionService.selectedPageIndex + 1);
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }
}
