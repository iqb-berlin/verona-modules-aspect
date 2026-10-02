import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PageChangeService } from 'common/services/page-change.service';
import { PageService } from 'editor/src/app/services/page.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OverviewDialogComponent } from 'editor/src/app/components/dialogs/overview-dialog/overview-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-editor-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.scss'],
  standalone: false
})
export class UnitViewComponent implements OnInit, OnDestroy {
  pagesLoaded = true;
  showPagesAsList = true;
  /**
   * The tab shown in the list view, where all pages share one tab and a permanently visible first page has another
   * in front of it. It used to be bound as 0, so nothing outside the tab header could turn to the other one, and an
   * element asked for by the validation area stayed out of reach behind it (#1129). It moves with the author's
   * clicks and with such a request, and with nothing else.
   */
  listTabIndex = 0;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialog: MatDialog,
              private dialogService: DialogService,
              public pageService: PageService,
              public pageChangeService: PageChangeService) { }

  ngOnInit(): void {
    this.unitService.pageOrderChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.refreshTabs();
        }
      );
    this.selectionService.requestedElementID
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(elementID => {
        if (elementID && this.showPagesAsList && this.unitService.unit.pages[0].alwaysVisible) {
          this.listTabIndex = this.selectionService.selectedPageIndex === 0 ? 0 : 1;
        }
      });
  }

  selectPage(newIndex: number): void {
    if (this.showPagesAsList) this.listTabIndex = newIndex;
    this.selectionService.selectPage(newIndex);
  }

  addPage(): void {
    this.pageService.addPage();
    this.selectionService.selectedPageIndex = this.unitService.unit.pages.length - 1;
    this.selectionService.selectedSectionIndex = 0;
  }

  /** This is a hack. The tab element gets bugged when changing the underlying array.
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

  openOverview() {
    const dialogRef = this.dialog.open(OverviewDialogComponent, {
      width: '70%',
      height: '70%',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showVariableInfoFindings(): void {
    this.dialogService.showVariableInfoFindingsDialog();
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

  setUnitNavNext(event: MatCheckboxChange) {
    this.unitService.setUnitNavNext(event.checked);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
