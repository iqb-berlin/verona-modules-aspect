import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Subject } from 'rxjs';
import { PageService } from 'editor/src/app/services/page.service';
import { EditorPage } from 'editor/src/app/models/editor-page';

@Component({
  selector: 'aspect-unit-view-page-menu',
  standalone: false,
  templateUrl: 'page-menu.component.html',
  styleUrls: ['./page-menu.component.scss']
})
export class PageMenu implements OnDestroy {
  @Input() page!: EditorPage;
  @Input() pageIndex!: number;
  @Output() pageOrderChanged = new EventEmitter<void>();
  @Output() alwaysVisiblePageModified = new EventEmitter();
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public pageService: PageService,
              public selectionService: SelectionService,
              private messageService: MessageService,
              private translateService: TranslateService) {}

  movePage(direction: 'left' | 'right'): void {
    this.pageService.moveSelectedPage(this.selectionService.selectedPageIndex, direction);
    this.pageOrderChanged.emit();
  }

  deletePage(): void {
    this.pageService.deletePage(this.pageIndex);
  }

  updateModel(page: EditorPage, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      if (property === 'alwaysVisible') {
        if (value === true) {
          this.movePageToFront(page);
          page.alwaysVisible = true;
          this.selectionService.selectedPageIndex = 0;
        }
        this.unitService.updateSectionCounter();
        this.alwaysVisiblePageModified.emit();
        this.pageOrderChanged.emit();
      }
      page[property] = value;
      this.unitService.updateUnitDefinition(); // TODO
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  /**
   * What `aspectNumberField` worked out for one of the three number boxes.
   *
   * They had a guard already, and it was the closest of all the pre-#1161 fields to the right
   * shape - but it hung on `(ngModelChange)`, so it judged every keystroke: typing `-50` warned
   * twice on its way through `-5`, and `$event || 0` wrote a 0 for the keystroke that emptied the
   * box. The aspect ratio passed no validity at all, so its `min="0" max="100"` meant nothing
   * (#1164).
   */
  commitNumber(page: EditorPage,
               property: 'maxWidth' | 'margin' | 'alwaysVisibleAspectRatio',
               update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.updateModel(page, property, update.value);
  }

  private movePageToFront(page: EditorPage): void {
    const pageIndex = this.unitService.unit.pages.indexOf(page);
    this.unitService.unit.movePageToFront(pageIndex);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
