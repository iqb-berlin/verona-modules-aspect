import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../services/unit.service';
import { DialogService } from '../../services/dialog.service';
import { SelectionService } from '../../services/selection.service';
import { MessageService } from '../../../../../common/services/message.service';
import { Page } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent implements OnInit, OnDestroy {
  selectedPageIndex: number = 0;
  pagesLoaded = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              private dialogService: DialogService,
              private messageService: MessageService) { }

  ngOnInit(): void {
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
    this.selectedPageIndex = this.unitService.unit.pages.length - 1;
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
