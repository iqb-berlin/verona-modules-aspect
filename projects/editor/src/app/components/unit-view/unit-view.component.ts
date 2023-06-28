import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'common/services/message.service';
import { Page } from 'common/models/page';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { UnitService } from '../../services/unit.service';
import { DialogService } from '../../services/dialog.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent implements OnDestroy {
  pagesLoaded = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService,
              private messageService: MessageService) { }

  selectPage(newIndex: number): void {
    this.selectionService.selectPage(newIndex);
  }

  addPage(): void {
    this.unitService.addPage();
  }

  movePage(page: Page, direction: 'left' | 'right'): void {
    this.unitService.moveSelectedPage(direction);
    this.refreshTabs();
  }

  deletePage(): void {
    let refs = this.unitService.referenceManager.getPageElementsReferences(
      this.unitService.unit.pages[this.selectionService.selectedPageIndex]
    );

    const pageNavButtonRefs = this.unitService.referenceManager.getPageButtonReferences(
      this.selectionService.selectedPageIndex
    );
    if (pageNavButtonRefs.length > 0) {
      refs = refs.concat([{
        element: {
          id: `Seite ${this.selectionService.selectedPageIndex + 1}`,
          type: 'page'
        },
        refs: pageNavButtonRefs
      }]);
    }

    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.unitService.deletePage(this.selectionService.selectedPageIndex);
            this.selectionService.selectPreviousPage();
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.dialogService.showConfirmDialog('Seite löschen?')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result: boolean) => {
          if (result) {
            this.unitService.deletePage(this.selectionService.selectedPageIndex);
            this.selectionService.selectPreviousPage();
          }
        });
    }
  }

  updateModel(page: Page, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      if (property === 'alwaysVisible' && value === true) {
        this.movePageToFront(page);
        page.alwaysVisible = true;
        this.selectionService.selectedPageIndex = 0;
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
