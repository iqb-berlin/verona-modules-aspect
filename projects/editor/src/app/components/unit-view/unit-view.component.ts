import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PageChangeService } from 'common/services/page-change.service';
import { PageService } from 'editor/src/app/services/unit-services/page.service';
import { UnitService } from '../../services/unit-services/unit.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-editor-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  pagesLoaded = true;
  showPagesAsList = true;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public pageService: PageService,
              public pageChangeService: PageChangeService) { }

  selectPage(newIndex: number): void {
    this.selectionService.selectPage(newIndex);
  }

  addPage(): void {
    this.pageService.addPage();
    this.selectionService.selectedPageIndex = this.unitService.unit.pages.length - 1;
    this.selectionService.selectedSectionIndex = 0;
  }

  /* This is a hack. The tab element gets bugged when changing the underlying array.
     With this we can temporarily remove it from the DOM and then add it again, re-initializing it. */
  refreshTabs(): void {
    this.pagesLoaded = false;
    setTimeout(() => {
      this.pagesLoaded = true;
    });
  }

  toggleViewMode(): void {
    this.showPagesAsList = !this.showPagesAsList;
  }

  setSectionNumbering(event: MatCheckboxChange) {
    this.unitService.setSectionNumbering(event.checked);
  }

  setSectionNumberingPosition(event: MatCheckboxChange) {
    this.unitService.setSectionNumberingPosition(event.checked ? 'above' : 'left');
  }

  setExpertMode(event: MatCheckboxChange) {
    this.unitService.setSectionExpertMode(event.checked);
  }
}
