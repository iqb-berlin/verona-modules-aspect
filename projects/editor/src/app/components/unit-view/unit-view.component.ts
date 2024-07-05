import { Component } from '@angular/core';
import { PageChangeService } from 'common/services/page-change.service';
import { UnitService } from '../../services/unit-services/unit.service';
import { SelectionService } from '../../services/selection.service';
import { HistoryService } from 'editor/src/app/services/history.service';
import { PageService } from 'editor/src/app/services/unit-services/page.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  pagesLoaded = true;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public pageService: PageService,
              public pageChangeService: PageChangeService,
              public historyService: HistoryService) { }

  selectPage(newIndex: number): void {
    this.selectionService.selectPage(newIndex);
  }

  addPage(): void {
    this.pageService.addPage();
  }

  /* This is a hack. The tab element gets bugged when changing the underlying array.
     With this we can temporarily remove it from the DOM and then add it again, re-initializing it. */
  refreshTabs(): void {
    this.pagesLoaded = false;
    setTimeout(() => {
      this.pagesLoaded = true;
    });
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
