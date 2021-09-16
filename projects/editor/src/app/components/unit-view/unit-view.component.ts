import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UnitService } from '../../unit.service';
import { DialogService } from '../../dialog.service';
import { SelectionService } from '../../selection.service';
import { Unit } from '../../../../../common/unit';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.toolbox_drawer {width: 230px}',
    '.properties_drawer {width: 320px}',
    '.delete-page-button {min-width: 0; padding: 0;position: absolute; left: 130px; bottom: 6px; visibility: hidden}',
    '::ng-deep .mat-tab-label:hover .delete-page-button {visibility: visible;}',
    '.page-alwaysVisible-icon {position: absolute; left: 15px}',
    '.drawer-button {font-size: large;background-color: lightgray;min-width: 0;width: 2%;border: none;cursor: pointer}',
    '.show-elements-button span {transform: rotate(-90deg); display: inherit}',
    '.show-properties-button {padding-bottom: 140px}',
    '.show-properties-button span {transform: rotate(90deg); display: inherit;}',
    '::ng-deep .mat-drawer-content .mat-tab-body-wrapper {height: 100%}'
  ]
})
export class UnitViewComponent implements OnInit, OnDestroy {
  unit!: Unit;
  private ngUnsubscribe = new Subject<void>();
  pagesLoaded = true;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService) { }

  ngOnInit(): void {
    this.unitService.unit
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((unit: Unit) => {
        this.unit = unit;
      });
    // The following is a hack. The tab element gets bugged when changing the underlying array.
    // With this we can temporarily remove it from the DOM and then add it again, re-initializing it.
    this.unitService.pageMoved
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.pagesLoaded = false;
        setTimeout(() => {
          this.pagesLoaded = true;
        });
      });
  }

  selectPage(newIndex: number): void {
    this.selectionService.selectPageIndex(newIndex);
  }

  addPage(): void {
    this.unitService.addPage();
    this.selectionService.selectPageIndex(this.unit.pages.length - 1);
  }

  deletePage(): void {
    this.showConfirmDialog().pipe(takeUntil(this.ngUnsubscribe)).subscribe((result: boolean) => {
      if (result) {
        this.selectionService.selectedPageIndex
          .pipe(take(1))
          .subscribe(index => {
            this.unitService.deletePage(index);
            this.selectionService.selectPageIndex(index - 1);
          }).unsubscribe();
      }
    });
  }

  showConfirmDialog(): Observable<boolean> {
    return this.dialogService.showConfirmDialog();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
