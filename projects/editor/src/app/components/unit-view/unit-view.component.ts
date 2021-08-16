import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../unit.service';
import { DialogService } from '../../dialog.service';
import { SelectionService } from '../../selection.service';
import { Unit } from '../../../../../common/unit';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.toolbox_drawer {width: 280px}',
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
  selectedPageIndex: number = 0;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService) { }

  ngOnInit(): void {
    this.unitService.unit
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((unit: Unit) => {
        this.unit = unit;
      });
  }

  selectPage(newIndex: number): void {
    this.selectedPageIndex = newIndex;
    this.selectionService.selectPage(this.unit.pages[this.selectedPageIndex]);
  }

  addPage(): void {
    this.unitService.addPage();
    this.selectionService.selectPage(this.unit.pages[this.unit.pages.length - 1]);
    this.selectedPageIndex = this.unit.pages.length - 1;
  }

  deletePage(): void {
    this.showConfirmDialog().pipe(takeUntil(this.ngUnsubscribe)).subscribe((result: boolean) => {
      if (result) {
        this.unitService.deletePage(this.selectedPageIndex);
        this.selectedPageIndex -= 1;
        this.selectionService.selectPage(this.unit.pages[this.selectedPageIndex]);
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
