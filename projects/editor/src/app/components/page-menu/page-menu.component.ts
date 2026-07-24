import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
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
              private messageService: MessageService) {}

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
      this.messageService.showWarning('Eingabe ungültig');
    }
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
