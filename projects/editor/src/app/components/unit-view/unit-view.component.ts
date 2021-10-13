import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../unit.service';
import { DialogService } from '../../dialog.service';
import { SelectionService } from '../../selection.service';
import { MessageService } from '../../../../../common/message.service';
import { Page } from '../../../../../common/classes/page';
import { Unit } from '../../../../../common/classes/unit';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.toolbox_drawer {width: 230px}',
    '.properties_drawer {width: 320px}',
    '.drawer-button {font-size: large;background-color: lightgray; min-width: 0; width: 2%;}',
    '.drawer-button {border: none; cursor: pointer}',
    '.show-elements-button span {transform: rotate(-90deg); display: inherit}',
    '.show-properties-button {padding-bottom: 140px}',
    '.show-properties-button span {transform: rotate(90deg); display: inherit;}',
    '::ng-deep .mat-drawer-content .mat-tab-body-wrapper {height: 100%}',
    '.menuItem {padding: 0 16px}',
    'mat-checkbox.menuItem {padding: 0 16px 10px 16px}',
    'mat-divider {margin-bottom: 10px}',
    '::ng-deep .mat-tab-label:hover .menu-button {visibility: visible}',
    '.menu-button {position: absolute; left: 130px; bottom: 6px; visibility: hidden}'
  ]
})
export class UnitViewComponent implements OnInit, OnDestroy {
  unit!: Unit;
  selectedPageIndex: number = 0;
  pagesLoaded = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService,
              private messageService: MessageService) { }

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
    this.selectedPageIndex = newIndex;
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;
  }

  addPage(): void {
    this.unitService.addPage();
    this.selectedPageIndex = this.unit.pages.length - 1;
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;
  }

  movePage(page: Page, direction: 'up' | 'down'): void {
    this.unitService.movePage(page, direction);
  }

  deletePage(page: Page): void {
    this.dialogService.showConfirmDialog('Seite löschen?')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result: boolean) => {
        if (result) {
          this.unitService.deletePage(page);
          this.selectedPageIndex -= 1;
        }
      });
    this.selectionService.selectedPageIndex = this.selectedPageIndex;
    this.selectionService.selectedPageSectionIndex = 0;
  }

  updateModel(page: Page, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      this.unitService.updatePageProperty(page, property, value);
      if (property === 'alwaysVisible') {
        this.selectedPageIndex = 0;
      }
    } else {
      this.messageService.showWarning('Eingabe ungültig');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
