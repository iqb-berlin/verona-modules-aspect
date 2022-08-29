import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'common/services/message.service';
import { ArrayUtils } from 'common/util/array';
import { Page } from 'common/models/page';
import { UnitService } from '../../services/unit.service';
import { DialogService } from '../../services/dialog.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent implements OnDestroy {
  selectedPageIndex: number = 0;
  pagesLoaded = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService,
              private messageService: MessageService) { }

  selectPage(newIndex: number): void {
    this.selectedPageIndex = newIndex;
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;
  }

  addPage(): void {
    this.unitService.unit.pages.push(new Page());

    this.selectedPageIndex = this.unitService.unit.pages.length - 1;
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;

    this.unitService.unitUpdated();
  }

  movePage(page: Page, direction: 'up' | 'down'): void {
    if ((direction === 'up' && this.unitService.unit.pages.indexOf(page) === 1 &&
        this.unitService.unit.pages[0].alwaysVisible) ||
        (direction === 'up' && this.unitService.unit.pages.indexOf(page) === 0) ||
        (direction === 'down' &&
          this.unitService.unit.pages.indexOf(page) === this.unitService.unit.pages.length - 1)) {
      this.messageService.showWarning('page can\'t be moved'); // TODO translate
      return;
    }
    ArrayUtils.moveArrayItem(page, this.unitService.unit.pages, direction);
    this.refreshTabs();
    direction === 'up' ? this.selectedPageIndex -= 1 : this.selectedPageIndex += 1;
    this.unitService.unitUpdated();
  }

  deletePage(page: Page): void {
    this.dialogService.showConfirmDialog('Seite löschen?')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result: boolean) => {
        if (result) {
          this.unitService.unit.pages.splice(this.unitService.unit.pages.indexOf(page), 1);
          this.unitService.unitUpdated();
          this.selectedPageIndex -= 1;
        }
      });
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;
  }

  updateModel(page: Page, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      if (property === 'alwaysVisible' && value === true) {
        this.movePageToFront(page);
        page.alwaysVisible = true;
        this.selectedPageIndex = 0;
        this.refreshTabs();
      }
      page[property] = value;
      this.unitService.unitUpdated();
    } else {
      this.messageService.showWarning('Eingabe ungültig');
    }
  }

  private movePageToFront(page: Page): void {
    const pageIndex = this.unitService.unit.pages.indexOf(page);
    if (pageIndex !== 0) {
      this.unitService.unit.pages.splice(pageIndex, 1);
      this.unitService.unit.pages.splice(0, 0, page);
    }
  }

  /* This is a hack. The tab element gets bugged when changing the underlying array.
     With this we can temporarily remove it from the DOM and then add it again, re-initializing it. */
  private refreshTabs(): void {
    this.pagesLoaded = false;
    setTimeout(() => {
      this.pagesLoaded = true;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
