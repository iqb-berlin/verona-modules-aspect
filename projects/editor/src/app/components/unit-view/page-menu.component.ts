import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Page } from 'common/models/page';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageService } from 'editor/src/app/services/unit-services/page.service';

@Component({
  selector: 'aspect-unit-view-page-menu',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: 'page-menu.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }
    mat-divider {
      margin-bottom: 10px;
    }
    .menuItem {
      padding: 0 16px;
    }
    mat-checkbox.menuItem {
      padding: 0 16px 10px 16px;
    }
    :host ::ng-deep .mat-mdc-menu-item .mat-icon {
      margin-right: 0;
    }
    .delete-button {
      justify-content: center;
    }
    .delete-button:hover {background-color: var(--warn)}
  `
})
export class PageMenu implements OnDestroy {
  @Input() page!: Page;
  @Input() pageIndex!: number;
  @Output() pageOrderChanged = new EventEmitter<void>();
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
    this.pageService.deletePage(this.selectionService.selectedPageIndex);
  }

  updateModel(page: Page, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      if (property === 'alwaysVisible' && value === true) {
        this.movePageToFront(page);
        page.alwaysVisible = true;
        this.selectionService.selectedPageIndex = 0;
        this.unitService.updateSectionCounter();
        this.pageOrderChanged.emit();
      }
      page[property] = value;
      this.unitService.updateUnitDefinition(); // TODO
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
